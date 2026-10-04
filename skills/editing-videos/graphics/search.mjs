#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

const HELP = `Usage: node search.mjs [text] [--category <c>] [--json] [--paths]

  no arguments          list the categories and how many assets each has
  text                  filter by id, description or when to use (case and accents ignored)
  --category <c>        only that category (arrows, highlights, underlines, focus, callouts,
                        text, progress, status, layouts, overlays, cta)
  --paths               print the absolute path of every file (to copy it into the project)
  --json                print the full catalog entries

Examples:
  node search.mjs --category arrows
  node search.mjs shortcut
  node search.mjs chapter --paths
  node search.mjs end screen --json`;

const DIR = import.meta.dirname;
const { assets, usage } = JSON.parse(readFileSync(join(DIR, "catalog.json"), "utf8"));
const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const flat = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const iCat = args.indexOf("--category");
const category = iCat >= 0 ? args[iCat + 1] : null;
if (iCat >= 0 && !category) {
  console.error("Missing the category name after --category");
  process.exit(2);
}
const text = args.filter((a, i) => !a.startsWith("--") && (iCat < 0 || i !== iCat + 1)).join(" ");

if (!text && !category) {
  const count = {};
  for (const a of assets) count[a.category] = (count[a.category] ?? 0) + 1;
  console.log(`${assets.length} assets. Categories:`);
  for (const [c, n] of Object.entries(count)) console.log(`  ${c.padEnd(12)} ${n}`);
  console.log(`\nDrop-in: ${usage.drop_in}`);
  console.log(`\n${HELP}`);
  process.exit(0);
}

const words = flat(text).split(/\s+/).filter(Boolean);
const found = assets.filter((a) => {
  if (category && a.category !== category) return false;
  const hay = flat(`${a.id} ${a.category} ${a.description} ${a.when_to_use}`);
  return words.every((w) => hay.includes(w));
});

if (!found.length) {
  console.error(`Nothing matches ${[text && `"${text}"`, category && `category ${category}`].filter(Boolean).join(" and ")}.`);
  process.exit(1);
}
if (args.includes("--json")) {
  console.log(JSON.stringify(found, null, 2));
} else {
  for (const a of found) {
    const files = args.includes("--paths") ? a.files.map((f) => join(DIR, f).replaceAll("\\", "/")) : a.files;
    console.log(`${a.id.padEnd(22)} ${a.category.padEnd(11)} ${String(a.default_duration_s).padStart(5)} s  in ${a.animation_in_s} s / out ${a.animation_out_s} s  ${a.call}`);
    console.log(`${"".padEnd(22)} ${a.description}`);
    for (const f of files) console.log(`${"".padEnd(22)} ${f}`);
  }
}
