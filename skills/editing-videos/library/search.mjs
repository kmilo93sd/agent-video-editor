#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

const UNDER_VOICE_DB = { music: 20, ambience: 30 };
const UNDER_VOICE_DEFAULT_DB = 15;

const HELP = `Usage: node search.mjs [text] [--category <c>] [--voice <lufs>] [--paths] [--json]

  no arguments          lists the categories and how many sounds each one has
  text                  filters by id, suggested use or origin (ignores case and accents)
  --category <c>        only that category (transition, click, appear, notification, success, error,
                        typing, impact, stinger, office, ambience, music)
  --voice <lufs>        computes each sound's data-volume for a voice at that level (voice_lufs in
                        volumes.json): effects ${UNDER_VOICE_DEFAULT_DB} dB under the voice, music ${UNDER_VOICE_DB.music} dB, ambience ${UNDER_VOICE_DB.ambience} dB
  --paths               prints the absolute path of each file (to copy it into the project)
  --json                prints the full catalog entries

Examples:
  node search.mjs --category transition
  node search.mjs card
  node search.mjs pop --paths
  node search.mjs --category appear --voice -17`;

const DIR = import.meta.dirname;
const { sounds, criteria } = JSON.parse(readFileSync(join(DIR, "catalog.json"), "utf8"));
const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const plain = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const iCat = args.indexOf("--category");
const category = iCat >= 0 ? args[iCat + 1] : null;
if (iCat >= 0 && !category) {
  console.error("Missing the category name after --category");
  process.exit(2);
}
const iVoice = args.indexOf("--voice");
const voice = iVoice >= 0 ? Number(args[iVoice + 1]) : null;
if (iVoice >= 0 && !Number.isFinite(voice)) {
  console.error("Missing the voice level in LUFS after --voice (for example --voice -17)");
  process.exit(2);
}
const values = new Set([iCat, iVoice].filter((i) => i >= 0).map((i) => i + 1));
const text = args.filter((a, i) => !values.has(i) && !a.startsWith("--")).join(" ");

if (!text && !category && voice === null) {
  const count = {};
  for (const s of sounds) count[s.category] = (count[s.category] ?? 0) + 1;
  console.log(`${sounds.length} sounds. Categories:`);
  for (const [c, n] of Object.entries(count)) console.log(`  ${c.padEnd(13)} ${n}`);
  console.log(`\nMix: ${criteria.mix}`);
  console.log(`\n${HELP}`);
  process.exit(0);
}

const q = plain(text);
const found = sounds.filter((s) =>
  (!category || s.category === category) &&
  (!q || plain(`${s.id} ${s.suggested_use} ${s.origin}`).includes(q)));

if (!found.length) {
  console.error(`Nothing matches ${[text && `"${text}"`, category && `category ${category}`].filter(Boolean).join(" and ")}.`);
  process.exit(1);
}
if (args.includes("--json")) {
  console.log(JSON.stringify(found, null, 2));
  process.exit(0);
}

const underVoice = (s) => UNDER_VOICE_DB[s.category] ?? UNDER_VOICE_DEFAULT_DB;
const volume = (s) => Math.min(1, Math.pow(10, (voice - underVoice(s) - s.lufs) / 20));
const idWidth = Math.max(...found.map((s) => s.id.length));
const catWidth = Math.max(...found.map((s) => s.category.length));
const durWidth = Math.max(...found.map((s) => String(s.duration_s).length));
for (const s of found) {
  const where = args.includes("--paths") ? join(DIR, s.file).replaceAll("\\", "/") : s.file;
  const vol = voice === null ? "" : `  data-volume ${volume(s).toFixed(2)} (${underVoice(s)} dB under)`;
  console.log(`${s.id.padEnd(idWidth)}  ${s.category.padEnd(catWidth)}  ${String(s.duration_s).padStart(durWidth)} s  ${String(s.lufs).padStart(5)} LUFS${vol}  ${where}`);
  console.log(`${"".padEnd(idWidth)}  ${s.suggested_use}`);
}
