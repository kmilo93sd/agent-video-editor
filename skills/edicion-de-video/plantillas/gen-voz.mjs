import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

const AYUDA = `Uso: node gen-voz.mjs [cap] [--rehacer | --rehacer --todo] [--guion ./capitulos.mjs] [--env ruta/.env] [--voz-var NOMBRE] [--salida assets/voz]

Genera la narracion con ElevenLabs: un mp3 corrido por capitulo y su alineacion caracter a caracter.
Mide el volumen de cada capitulo en LUFS y deja las ganancias en volumenes.json.
Comprueba que cada ancla del guion exista en el texto hablado.

El .env es el de --env, si no el de VIDEO_ENV_FILE, si no ./.env. No copies claves: apunta al .env que ya las tiene.
Variables (en ese .env o en el entorno):
  ELEVENLABS_KEY         clave con permiso de text-to-speech
  ELEVENLABS_VOICE_ID    voice_id de la voz; obligatorio, no se descubre por API (otro nombre con --voz-var)
  ELEVENLABS_MODEL_ID    opcional, por defecto eleven_multilingual_v2
  VOZ_ESTABILIDAD, VOZ_SIMILITUD, VOZ_ESTILO   opcionales (0..1)`;

const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) { console.log(AYUDA); process.exit(0); }
const opt = (n, d) => {
  const i = args.indexOf(n);
  if (i < 0) return d;
  if (!args[i + 1] || args[i + 1].startsWith("--")) throw new Error(`Falta el valor después de ${n}`);
  return args[i + 1];
};
const rehacer = args.includes("--rehacer");
const valores = new Set(["--guion", "--env", "--salida", "--voz-var"].map((n) => opt(n)).filter(Boolean));
const filtro = args.find((a) => !a.startsWith("--") && !valores.has(a));

const rutaEnv = opt("--env", process.env.VIDEO_ENV_FILE || join(process.cwd(), ".env"));
const envTxt = rutaEnv && existsSync(rutaEnv) ? readFileSync(rutaEnv, "utf8") : "";
const leer = (k) => ((process.env[k] || undefined) ?? envTxt.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1] ?? "").trim().replace(/^["']|["']$/g, "");

const KEY = leer("ELEVENLABS_KEY");
const VOZ_VAR = opt("--voz-var", "ELEVENLABS_VOICE_ID");
const VOICE_ID = leer(VOZ_VAR);
const MODEL_ID = leer("ELEVENLABS_MODEL_ID") || "eleven_multilingual_v2";
if (!KEY) throw new Error(`Falta ELEVENLABS_KEY (busqué en ${rutaEnv ?? "ningún .env"} y en el entorno)`);
if (!VOICE_ID) throw new Error(`Falta ${VOZ_VAR} en ${rutaEnv}. No se resuelve por nombre: la voz por defecto de ElevenLabs es inglesa.`);
const num = (k, d) => (leer(k) === "" ? d : Number(leer(k)));
const AJUSTES = { stability: num("VOZ_ESTABILIDAD", 0.55), similarity_boost: num("VOZ_SIMILITUD", 0.8), style: num("VOZ_ESTILO", 0.05), use_speaker_boost: true };

const { caps, idCap = (c) => `cap${c}` } = await import(pathToFileURL(resolve(opt("--guion", "./capitulos.mjs"))).href);
const OUT = opt("--salida", "assets/voz");
if (filtro && !caps.some((c) => c.cap === filtro)) throw new Error(`No hay capítulo «${filtro}». Hay: ${caps.map((c) => c.cap).join(", ")}`);
if (rehacer && !filtro && !args.includes("--todo")) throw new Error("--rehacer regenera (y cobra) todo. Pasa el capítulo (node gen-voz.mjs 03 --rehacer) o agrega --todo");
for (const c of caps) {
  for (const a of c.anclas ?? []) if (!c.vo.includes(a)) throw new Error(`Capítulo ${c.cap}: el ancla "${a}" no está en vo; corrige el guion antes de pagar la síntesis`);
  if (c.anclas?.length && c.vo.indexOf(c.anclas[0]) !== 0) throw new Error(`Capítulo ${c.cap}: la primera ancla tiene que ser el comienzo de vo`);
  const pos = (c.anclas ?? []).map((a) => c.vo.indexOf(a));
  if (pos.some((v, k) => k && v <= pos[k - 1])) throw new Error(`Capítulo ${c.cap}: las anclas no están en el orden del texto`);
}
mkdirSync(OUT, { recursive: true });

function duracion(archivo) {
  try {
    const n = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", archivo], { encoding: "utf8" }).trim());
    return Number.isFinite(n) ? Math.round(n * 1000) / 1000 : null;
  } catch { return null; }
}

async function tts(texto, mp3, alineacion) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text: texto, model_id: MODEL_ID, voice_settings: AJUSTES }),
  });
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  if (!j.alignment) throw new Error("ElevenLabs no devolvió alineación");
  writeFileSync(mp3, Buffer.from(j.audio_base64, "base64"));
  writeFileSync(alineacion, JSON.stringify({ texto: j.alignment.characters.join(""), inicios: j.alignment.character_start_times_seconds }));
}

const pendientes = caps.filter((c) => {
  if (filtro && c.cap !== filtro) return false;
  const mp3 = join(OUT, `${idCap(c.cap)}.mp3`);
  return rehacer || !(existsSync(mp3) && statSync(mp3).size > 0 && existsSync(join(OUT, `${idCap(c.cap)}.json`)));
});

console.log(`Por generar: ${pendientes.length} de ${caps.length} capítulos`);
for (const c of pendientes) {
  const id = idCap(c.cap);
  process.stdout.write(`  ${id}  ${String(c.titulo ?? "").padEnd(30).slice(0, 30)} ${String(c.vo.length).padStart(4)} car ... `);
  try {
    await tts(c.vo, join(OUT, `${id}.mp3`), join(OUT, `${id}.json`));
    const d = duracion(join(OUT, `${id}.mp3`));
    console.log(`ok  ${d ? d.toFixed(1) + " s" : ""}`);
  } catch (e) {
    console.log(`FALLÓ: ${e.message}`);
    process.exitCode = 1;
  }
}

const medidos = {};
for (const c of caps) {
  const mp3 = join(OUT, `${idCap(c.cap)}.mp3`);
  if (!existsSync(mp3)) continue;
  const r = spawnSync("ffmpeg", ["-hide_banner", "-v", "info", "-i", mp3, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], { encoding: "utf8" });
  if (r.error) throw new Error(`No se pudo correr ffmpeg (${r.error.message}); sin ffmpeg no se mide el volumen`);
  const m = (r.stderr ?? "").match(/\{[\s\S]*?\}/g)?.pop();
  if (!m) throw new Error(`ffmpeg no devolvió la medición de ${mp3}`);
  medidos[idCap(c.cap)] = Number(JSON.parse(m).input_i);
}
const vol = {};
if (Object.keys(medidos).length) {
  const ref = Math.min(...Object.values(medidos));
  const orden = Object.values(medidos).sort((a, b) => a - b);
  const mitad = Math.floor(orden.length / 2);
  const mediana = orden.length % 2 ? orden[mitad] : (orden[mitad - 1] + orden[mitad]) / 2;
  console.log(`\nVolumen por capítulo. Referencia: el más suave, ${ref.toFixed(1)} LUFS. Con las ganancias aplicadas toda la voz queda en ese nivel (voz_lufs en volumenes.json).`);
  for (const c of caps) {
    const id = idCap(c.cap);
    const v = medidos[id];
    vol[id] = v === undefined ? 1 : Math.round(Math.pow(10, (ref - v) / 20) * 1000) / 1000;
    if (v !== undefined) console.log(`  ${id}  ${v.toFixed(1)} LUFS → data-volume ${vol[id].toFixed(3)}${Math.abs(v - mediana) > 4 ? `   🔴 ${(v - mediana).toFixed(1)} dB fuera de la mediana: node gen-voz.mjs ${c.cap} --rehacer` : ""}`);
  }
  vol.voz_lufs = Math.round(ref * 10) / 10;
}
writeFileSync(join(OUT, "volumenes.json"), JSON.stringify(vol, null, 2));

const dur = {};
let total = 0;
for (const c of caps) {
  const d = duracion(join(OUT, `${idCap(c.cap)}.mp3`));
  if (d !== null) { dur[idCap(c.cap)] = d; total += d; }
}
writeFileSync(join(OUT, "duraciones.json"), JSON.stringify(dur, null, 2));

const rotas = [];
for (const c of caps) {
  const ruta = join(OUT, `${idCap(c.cap)}.json`);
  if (!existsSync(ruta)) continue;
  const { texto } = JSON.parse(readFileSync(ruta, "utf8"));
  for (const a of (c.anclas ?? []).concat((c.visuales ?? []).map((v) => v.ancla))) {
    const i = texto.indexOf(a);
    if (i < 0) rotas.push(`${c.cap}: "${a}" no está`);
    else if (texto.indexOf(a, i + 1) >= 0) rotas.push(`${c.cap}: "${a}" aparece dos veces`);
  }
}
console.log(`\nLocución en disco: ${Object.keys(dur).length}/${caps.length} capítulos · ${Math.floor(total / 60)}m ${Math.round(total % 60)}s`);
if (rotas.length) {
  console.log("🔴 Anclas que no calzan con la locución:");
  for (const r of rotas) console.log(`   ${r}`);
  process.exitCode = 1;
} else {
  console.log("Todas las anclas del guion calzan con la locución.");
}
