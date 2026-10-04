import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

const HELP = `Usage: node gen-voice.mjs [ch] [--redo | --redo --all] [--script ./chapters.mjs] [--env path/.env] [--voice-var NAME] [--out assets/voice]

Generates the narration with ElevenLabs: one continuous mp3 per chapter and its character-by-character alignment.
Measures each chapter's loudness in LUFS and writes the gains to volumes.json.
Checks that every anchor in the script exists in the spoken text.

The .env is the one from --env, otherwise the one in VIDEO_ENV_FILE, otherwise ./.env. Do not copy keys: point to the .env that already has them.
Variables (in that .env or in the environment):
  ELEVENLABS_KEY         key with text-to-speech permission
  ELEVENLABS_VOICE_ID    the voice's voice_id; required, not discovered through the API (another name with --voice-var)
  ELEVENLABS_MODEL_ID    optional, defaults to eleven_multilingual_v2
  VOICE_STABILITY, VOICE_SIMILARITY, VOICE_STYLE   optional (0..1)`;

const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) { console.log(HELP); process.exit(0); }
const opt = (n, d) => {
  const i = args.indexOf(n);
  if (i < 0) return d;
  if (!args[i + 1] || args[i + 1].startsWith("--")) throw new Error(`Missing value after ${n}`);
  return args[i + 1];
};
const redo = args.includes("--redo");
const values = new Set(["--script", "--env", "--out", "--voice-var"].map((n) => opt(n)).filter(Boolean));
const filter = args.find((a) => !a.startsWith("--") && !values.has(a));

const envPath = opt("--env", process.env.VIDEO_ENV_FILE || join(process.cwd(), ".env"));
const envTxt = envPath && existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const read = (k) => ((process.env[k] || undefined) ?? envTxt.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1] ?? "").trim().replace(/^["']|["']$/g, "");

const KEY = read("ELEVENLABS_KEY");
const VOICE_VAR = opt("--voice-var", "ELEVENLABS_VOICE_ID");
const VOICE_ID = read(VOICE_VAR);
const MODEL_ID = read("ELEVENLABS_MODEL_ID") || "eleven_multilingual_v2";
if (!KEY) throw new Error(`Missing ELEVENLABS_KEY (looked in ${envPath ?? "no .env"} and in the environment)`);
if (!VOICE_ID) throw new Error(`Missing ${VOICE_VAR} in ${envPath}. It is not resolved by name: ElevenLabs' default voice is English.`);
const num = (k, d) => (read(k) === "" ? d : Number(read(k)));
const SETTINGS = { stability: num("VOICE_STABILITY", 0.55), similarity_boost: num("VOICE_SIMILARITY", 0.8), style: num("VOICE_STYLE", 0.05), use_speaker_boost: true };

const { chapters, chapterId = (c) => `ch${c}` } = await import(pathToFileURL(resolve(opt("--script", "./chapters.mjs"))).href);
const OUT = opt("--out", "assets/voice");
if (filter && !chapters.some((c) => c.ch === filter)) throw new Error(`There is no chapter "${filter}". Available: ${chapters.map((c) => c.ch).join(", ")}`);
if (redo && !filter && !args.includes("--all")) throw new Error("--redo regenerates (and pays for) everything. Pass the chapter (node gen-voice.mjs 03 --redo) or add --all");
for (const c of chapters) {
  for (const a of c.anchors ?? []) if (!c.vo.includes(a)) throw new Error(`Chapter ${c.ch}: the anchor "${a}" is not in vo; fix the script before paying for synthesis`);
  if (c.anchors?.length && c.vo.indexOf(c.anchors[0]) !== 0) throw new Error(`Chapter ${c.ch}: the first anchor must be the beginning of vo`);
  const pos = (c.anchors ?? []).map((a) => c.vo.indexOf(a));
  if (pos.some((v, k) => k && v <= pos[k - 1])) throw new Error(`Chapter ${c.ch}: the anchors are not in text order`);
}
mkdirSync(OUT, { recursive: true });

function duration(file) {
  try {
    const n = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file], { encoding: "utf8" }).trim());
    return Number.isFinite(n) ? Math.round(n * 1000) / 1000 : null;
  } catch { return null; }
}

async function tts(text, mp3, alignmentPath) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: MODEL_ID, voice_settings: SETTINGS }),
  });
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  if (!j.alignment) throw new Error("ElevenLabs returned no alignment");
  writeFileSync(mp3, Buffer.from(j.audio_base64, "base64"));
  writeFileSync(alignmentPath, JSON.stringify({ text: j.alignment.characters.join(""), starts: j.alignment.character_start_times_seconds }));
}

const pending = chapters.filter((c) => {
  if (filter && c.ch !== filter) return false;
  const mp3 = join(OUT, `${chapterId(c.ch)}.mp3`);
  return redo || !(existsSync(mp3) && statSync(mp3).size > 0 && existsSync(join(OUT, `${chapterId(c.ch)}.json`)));
});

console.log(`To generate: ${pending.length} of ${chapters.length} chapters`);
for (const c of pending) {
  const id = chapterId(c.ch);
  process.stdout.write(`  ${id}  ${String(c.title ?? "").padEnd(30).slice(0, 30)} ${String(c.vo.length).padStart(4)} chars ... `);
  try {
    await tts(c.vo, join(OUT, `${id}.mp3`), join(OUT, `${id}.json`));
    const d = duration(join(OUT, `${id}.mp3`));
    console.log(`ok  ${d ? d.toFixed(1) + " s" : ""}`);
  } catch (e) {
    console.log(`FAILED: ${e.message}`);
    process.exitCode = 1;
  }
}

const measured = {};
for (const c of chapters) {
  const mp3 = join(OUT, `${chapterId(c.ch)}.mp3`);
  if (!existsSync(mp3)) continue;
  const r = spawnSync("ffmpeg", ["-hide_banner", "-v", "info", "-i", mp3, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], { encoding: "utf8" });
  if (r.error) throw new Error(`Could not run ffmpeg (${r.error.message}); without ffmpeg the loudness is not measured`);
  const m = (r.stderr ?? "").match(/\{[\s\S]*?\}/g)?.pop();
  if (!m) throw new Error(`ffmpeg returned no measurement for ${mp3}`);
  measured[chapterId(c.ch)] = Number(JSON.parse(m).input_i);
}
const vol = {};
if (Object.keys(measured).length) {
  const ref = Math.min(...Object.values(measured));
  const sorted = Object.values(measured).sort((a, b) => a - b);
  const half = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
  console.log(`\nLoudness per chapter. Reference: the quietest, ${ref.toFixed(1)} LUFS. With the gains applied, the whole voice sits at that level (voice_lufs in volumes.json).`);
  for (const c of chapters) {
    const id = chapterId(c.ch);
    const v = measured[id];
    vol[id] = v === undefined ? 1 : Math.round(Math.pow(10, (ref - v) / 20) * 1000) / 1000;
    if (v !== undefined) console.log(`  ${id}  ${v.toFixed(1)} LUFS → data-volume ${vol[id].toFixed(3)}${Math.abs(v - median) > 4 ? `   🔴 ${(v - median).toFixed(1)} dB off the median: node gen-voice.mjs ${c.ch} --redo` : ""}`);
  }
  vol.voice_lufs = Math.round(ref * 10) / 10;
}
writeFileSync(join(OUT, "volumes.json"), JSON.stringify(vol, null, 2));

const dur = {};
let total = 0;
for (const c of chapters) {
  const d = duration(join(OUT, `${chapterId(c.ch)}.mp3`));
  if (d !== null) { dur[chapterId(c.ch)] = d; total += d; }
}
writeFileSync(join(OUT, "durations.json"), JSON.stringify(dur, null, 2));

const broken = [];
for (const c of chapters) {
  const path = join(OUT, `${chapterId(c.ch)}.json`);
  if (!existsSync(path)) continue;
  const { text } = JSON.parse(readFileSync(path, "utf8"));
  for (const a of (c.anchors ?? []).concat((c.visuals ?? []).map((v) => v.anchor))) {
    const i = text.indexOf(a);
    if (i < 0) broken.push(`${c.ch}: "${a}" is missing`);
    else if (text.indexOf(a, i + 1) >= 0) broken.push(`${c.ch}: "${a}" appears twice`);
  }
}
console.log(`\nVoiceover on disk: ${Object.keys(dur).length}/${chapters.length} chapters · ${Math.floor(total / 60)}m ${Math.round(total % 60)}s`);
if (broken.length) {
  console.log("🔴 Anchors that do not match the voiceover:");
  for (const r of broken) console.log(`   ${r}`);
  process.exitCode = 1;
} else {
  console.log("Every anchor in the script matches the voiceover.");
}
