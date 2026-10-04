#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";

const HELP = `Usage: node verify.mjs [--quick]

Checks the audio library against its catalog and fails (exit 1) on any problem:
  - catalog.json is valid JSON, ids are unique and every entry has the required fields;
  - every catalog file exists on disk and every file in sfx/ and music/ is in the catalog;
  - every entry has evidence in LICENSES.md (its id, its file name or its source URL);
  - every file decodes without errors, is 48 kHz, is not empty or silent, and its true peak is at most 0 dBTP;
  - duration, LUFS and true peak match the catalog (0.05 s or 2 %, 0.5 LU, 0.5 dB).
  --quick skips decoding and loudness (catalog, disk and license checks only).
Needs ffmpeg and ffprobe in the PATH.`;

const DIR = import.meta.dirname;
const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}
const quick = args.includes("--quick");
const REQUIRED = ["id", "file", "category", "duration_s", "suggested_use", "license", "source_url", "origin",
  "attribution_required", "lufs", "true_peak_dbtp"];
const AUDIO_DIRS = ["sfx", "music"];
const problems = [];
const fail = (msg) => problems.push(msg);

let catalog;
try {
  catalog = JSON.parse(readFileSync(join(DIR, "catalog.json"), "utf8"));
} catch (e) {
  console.error(`catalog.json is not valid JSON: ${e.message}`);
  process.exit(1);
}
const sounds = catalog.sounds ?? [];
const licenses = readFileSync(join(DIR, "LICENSES.md"), "utf8");

const seen = new Set();
for (const s of sounds) {
  for (const f of REQUIRED) if (s[f] === undefined || s[f] === "") fail(`${s.id ?? "?"}: missing field ${f}`);
  if (seen.has(s.id)) fail(`${s.id}: duplicate id`);
  seen.add(s.id);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.id ?? "")) fail(`${s.id}: id is not kebab-case`);
  if (s.license !== "CC0 1.0") fail(`${s.id}: license is ${s.license}, not CC0 1.0`);
  const evidence = [s.id, basename(s.file ?? ""), s.source_url].some((k) => k && licenses.includes(k));
  if (!evidence) fail(`${s.id}: no evidence in LICENSES.md (neither its id, file name nor source URL)`);
}

const inCatalog = new Set(sounds.map((s) => s.file));
const onDisk = AUDIO_DIRS.flatMap((d) => readdirSync(join(DIR, d)).map((f) => `${d}/${f}`));
for (const f of onDisk) if (!inCatalog.has(f)) fail(`${f}: on disk but not in the catalog (orphan)`);
for (const s of sounds) {
  try {
    if (!statSync(join(DIR, s.file)).size) fail(`${s.file}: empty file`);
  } catch {
    fail(`${s.id}: ${s.file} is in the catalog but not on disk`);
  }
}

function loudness(path) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", path, "-af",
    "apad=whole_dur=0.5,loudnorm=I=-16:TP=-1:LRA=11:print_format=json", "-f", "null", "-"], { encoding: "utf8" });
  const a = r.stderr.lastIndexOf("{");
  const j = JSON.parse(r.stderr.slice(a, r.stderr.indexOf("}", a) + 1));
  return { lufs: Number(j.input_i), tp: Number(j.input_tp) };
}

const rows = [];
if (!quick) {
  for (const s of sounds) {
    const path = join(DIR, s.file);
    if (!onDisk.includes(s.file)) continue;
    const dec = spawnSync("ffmpeg", ["-v", "error", "-i", path, "-f", "null", "-"], { encoding: "utf8" });
    if (dec.status !== 0 || dec.stderr.trim()) fail(`${s.id}: decode errors: ${dec.stderr.trim().split("\n")[0]}`);
    const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries",
      "format=duration:stream=sample_rate,channels,codec_name,bit_rate", "-of", "json", path], { encoding: "utf8" }));
    const dur = Number(probe.format.duration);
    const st = probe.streams[0];
    if (!(dur > 0)) fail(`${s.id}: zero duration`);
    if (st.sample_rate !== "48000") fail(`${s.id}: ${st.sample_rate} Hz, the library is 48 kHz`);
    if (Math.abs(dur - s.duration_s) > Math.max(0.05, 0.02 * s.duration_s)) fail(`${s.id}: duration ${dur.toFixed(3)} s, catalog says ${s.duration_s}`);
    const { lufs, tp } = loudness(path);
    if (!Number.isFinite(lufs) || lufs < -60) fail(`${s.id}: silent (${lufs} LUFS)`);
    if (tp > 0) fail(`${s.id}: clipped, true peak ${tp} dBTP`);
    if (Math.abs(lufs - s.lufs) > 0.5) fail(`${s.id}: ${lufs} LUFS, catalog says ${s.lufs}`);
    if (Math.abs(tp - s.true_peak_dbtp) > 0.5) fail(`${s.id}: true peak ${tp} dBTP, catalog says ${s.true_peak_dbtp}`);
    rows.push({ s, lufs, tp, sr: st.sample_rate, ch: st.channels, codec: st.codec_name });
  }
}

const count = {};
let bytes = 0;
for (const s of sounds) count[s.category] = (count[s.category] ?? 0) + 1;
for (const f of onDisk) bytes += statSync(join(DIR, f)).size;
console.log(`${sounds.length} catalog entries, ${onDisk.length} files on disk, ${(bytes / 1048576).toFixed(1)} MiB of audio`);
for (const [c, n] of Object.entries(count)) console.log(`  ${c.padEnd(13)} ${n}`);
if (rows.length) {
  const worst = rows.reduce((a, b) => (b.tp > a.tp ? b : a));
  const formats = {};
  for (const r of rows) formats[`${r.codec} ${r.sr} Hz ${r.ch} ch`] = (formats[`${r.codec} ${r.sr} Hz ${r.ch} ch`] ?? 0) + 1;
  console.log(`Decoded and measured ${rows.length} files. Highest true peak: ${worst.tp} dBTP (${worst.s.id}).`);
  for (const [f, n] of Object.entries(formats)) console.log(`  ${f.padEnd(28)} ${n}`);
}
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("\nOK: catalog, disk and LICENSES.md agree; no empty, silent, clipped or corrupt file.");
