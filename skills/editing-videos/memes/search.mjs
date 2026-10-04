#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

const HELP = `Usage: node search.mjs [text] [--format <f>] [--risk <r>] [--json]

  no arguments          list formats and Content ID risk levels with counts
  text                  filter by id, name, meaning or when to use (case and accents ignored)
  --format <f>          only that format (image, gif, video, sound)
  --risk <r>            only that Content ID risk (low, medium, high)
  --json                print the full catalog entries

No meme media ships with this catalog: read README.md before using one.

Examples:
  node search.mjs fail
  node search.mjs --format sound
  node search.mjs wrong way --risk low
  node search.mjs drake --json`;

const DIR = import.meta.dirname;
const { memes } = JSON.parse(readFileSync(join(DIR, "catalog.json"), "utf8"));
const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const flat = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const value = (flag) => {
  const i = args.indexOf(flag);
  if (i < 0) return { i, v: null };
  if (!args[i + 1] || args[i + 1].startsWith("--")) {
    console.error(`Missing the value after ${flag}`);
    process.exit(2);
  }
  return { i, v: args[i + 1] };
};
const fmt = value("--format");
const risk = value("--risk");
const skip = new Set([fmt.i + 1, risk.i + 1].filter((i) => i > 0));
const text = args.filter((a, i) => !a.startsWith("--") && !skip.has(i)).join(" ");

if (!text && !fmt.v && !risk.v) {
  const by = (f) => memes.reduce((acc, m) => ({ ...acc, [f(m)]: (acc[f(m)] ?? 0) + 1 }), {});
  console.log(`${memes.length} memes (reference only, no media).`);
  console.log("Formats:");
  for (const [k, n] of Object.entries(by((m) => m.format))) console.log(`  ${k.padEnd(8)} ${n}`);
  console.log("Content ID risk if you use the original:");
  for (const [k, n] of Object.entries(by((m) => m.content_id_risk.level))) console.log(`  ${k.padEnd(8)} ${n}`);
  console.log(`\n${HELP}`);
  process.exit(0);
}

const words = flat(text).split(/\s+/).filter(Boolean);
const found = memes.filter((m) => {
  if (fmt.v && m.format !== fmt.v) return false;
  if (risk.v && m.content_id_risk.level !== risk.v) return false;
  const hay = flat(`${m.id} ${m.name} ${m.what_it_means} ${m.when_to_use}`);
  return words.every((w) => hay.includes(w));
});

if (!found.length) {
  console.error(`Nothing matches ${[text && `"${text}"`, fmt.v && `format ${fmt.v}`, risk.v && `risk ${risk.v}`].filter(Boolean).join(" and ")}.`);
  process.exit(1);
}
if (args.includes("--json")) {
  console.log(JSON.stringify(found, null, 2));
} else {
  for (const m of found) {
    console.log(`${m.id.padEnd(28)} ${m.format.padEnd(6)} ${`${m.timing_s[0]}-${m.timing_s[1]} s`.padEnd(9)} risk ${m.content_id_risk.level.padEnd(6)} ${m.name}`);
    console.log(`${"".padEnd(28)} ${m.what_it_means}`);
    console.log(`${"".padEnd(28)} Recreate: ${m.how_to_recreate}`);
    if (m.tone_warnings.length) console.log(`${"".padEnd(28)} Tone: ${m.tone_warnings.join(" ")}`);
  }
}
