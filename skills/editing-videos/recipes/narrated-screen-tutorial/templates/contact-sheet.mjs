import { readdirSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const HELP = `Usage: node contact-sheet.mjs <snapshots-folder> [--columns 4] [--rows 3]

Puts the folder's PNGs, in name order, into contact sheets of columns x rows (4x3 = 12 frames per sheet by
default). Writes <folder>/sheet-1.jpg, sheet-2.jpg, ... and drops no frame.
Read it by rows, left to right. Take the snapshots with:
  npx hyperframes snapshot --at <t1>,<t2>,... --no-end --describe false -o <folder>`;

const args = process.argv.slice(2);
if (!args.length || args.includes("-h") || args.includes("--help")) { console.log(HELP); process.exit(args.length ? 0 : 2); }
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? Number(args[i + 1]) : d; };
const COL = opt("--columns", 4), ROW = opt("--rows", 3);
const dir = resolve(args[0]);
const pngs = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".png")).sort();
if (!pngs.length) { console.error(`No PNGs in ${dir}`); process.exit(1); }

const perSheet = COL * ROW;
const sheets = [];
for (let h = 0; h * perSheet < pngs.length; h++) {
  const group = pngs.slice(h * perSheet, (h + 1) * perSheet);
  const list = join(dir, `.list-${h + 1}.txt`);
  writeFileSync(list, group.map((f) => `file '${join(dir, f).replaceAll("\\", "/")}'`).join("\n"));
  const out = join(dir, `sheet-${h + 1}.jpg`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list,
    "-vf", `scale=480:-1,tile=${COL}x${ROW}:padding=8:color=white`, "-frames:v", "1", out]);
  rmSync(list);
  sheets.push(`${out}  (${group[0]} … ${group[group.length - 1]})`);
}
console.log(`${pngs.length} frames in ${sheets.length} sheet(s):`);
for (const h of sheets) console.log(`  ${h}`);
