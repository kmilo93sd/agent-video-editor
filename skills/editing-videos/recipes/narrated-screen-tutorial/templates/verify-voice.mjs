import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const HELP = `Usage: node verify-voice.mjs <ch> <transcript> [--script ./chapters.mjs]

Compares what the script says to read (the chapter's vo field) with what is heard in the transcript.
<transcript> is the word JSON from "npx hyperframes transcribe <mp3> --model small --language es"
(an array of { text }; it is written to <dir>/transcript.json) or a .txt with the plain text from any other whisper.
Lists the spans where they differ and exits with code 1 if there are any. It is not an automatic gate:
spelled-out acronyms always differ (whisper writes SII); look at each span and listen to the doubtful ones.`;

const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) { console.log(HELP); process.exit(0); }
if (args.length < 2) { console.log(HELP); process.exit(2); }
const iS = args.indexOf("--script");
const script = iS >= 0 ? args[iS + 1] : "./chapters.mjs";
const [ch, path] = args.filter((a, i) => !a.startsWith("--") && (iS < 0 || i !== iS + 1));

const { chapters } = await import(pathToFileURL(resolve(script)).href);
const c = chapters.find((x) => x.ch === ch);
if (!c) throw new Error(`There is no chapter ${ch} in ${script}`);

const raw = readFileSync(path, "utf8");
let heard;
try {
  const j = JSON.parse(raw);
  const list = Array.isArray(j) ? j : j.words ?? j.segments ?? [];
  heard = list.map((w) => w.text ?? w.word ?? "").join(" ");
} catch {
  heard = raw;
}

const tok = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9ñ\s]/g, " ").split(/\s+/).filter(Boolean);
const a = tok(c.vo);
const b = tok(heard);

const n = a.length, m = b.length;
const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);

const spans = [];
let i = 0, j = 0, cur = null;
const close = () => { if (cur) { spans.push(cur); cur = null; } };
while (i < n || j < m) {
  if (i < n && j < m && a[i] === b[j]) { close(); i++; j++; continue; }
  cur ??= { pos: i, script: [], heard: [] };
  if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])) cur.heard.push(b[j++]);
  else cur.script.push(a[i++]);
}
close();

const match = n ? (L[0][0] / n) * 100 : 100;
console.log(`Chapter ${ch}: ${L[0][0]} of ${n} script words are heard the same (${match.toFixed(1)} %).`);
if (!spans.length) { console.log("No differences."); process.exit(0); }
for (const t of spans) {
  const ctx = a.slice(Math.max(0, t.pos - 4), t.pos).join(" ");
  console.log(`  …${ctx} | script: "${t.script.join(" ") || "—"}"  heard: "${t.heard.join(" ") || "—"}"`);
}
console.log("\nNot every difference is an error: whisper writes \"SII\" where the script says \"ese i i\". Check each span and listen to the doubtful ones.");
process.exitCode = 1;
