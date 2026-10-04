import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const AYUDA = `Uso: node verificar-voz.mjs <cap> <transcripcion> [--guion ./capitulos.mjs]

Compara lo que el guion manda leer (campo vo del capitulo) con lo que se oye en la transcripcion.
<transcripcion> es el JSON de palabras de "npx hyperframes transcribe <mp3> --model small --language es"
(arreglo de { text }; queda en <dir>/transcript.json) o un .txt con el texto plano de cualquier otro whisper.
Lista los tramos donde difieren y sale con codigo 1 si hay alguno. No es una compuerta automatica:
las siglas deletreadas siempre difieren (whisper escribe SII); cada tramo se mira y los dudosos se oyen.`;

const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) { console.log(AYUDA); process.exit(0); }
if (args.length < 2) { console.log(AYUDA); process.exit(2); }
const iG = args.indexOf("--guion");
const guion = iG >= 0 ? args[iG + 1] : "./capitulos.mjs";
const [cap, ruta] = args.filter((a, i) => !a.startsWith("--") && (iG < 0 || i !== iG + 1));

const { caps } = await import(pathToFileURL(resolve(guion)).href);
const c = caps.find((x) => x.cap === cap);
if (!c) throw new Error(`No hay capítulo ${cap} en ${guion}`);

const crudo = readFileSync(ruta, "utf8");
let oido;
try {
  const j = JSON.parse(crudo);
  const lista = Array.isArray(j) ? j : j.words ?? j.segments ?? [];
  oido = lista.map((w) => w.text ?? w.word ?? "").join(" ");
} catch {
  oido = crudo;
}

const tok = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9ñ\s]/g, " ").split(/\s+/).filter(Boolean);
const a = tok(c.vo);
const b = tok(oido);

const n = a.length, m = b.length;
const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);

const tramos = [];
let i = 0, j = 0, cur = null;
const cerrar = () => { if (cur) { tramos.push(cur); cur = null; } };
while (i < n || j < m) {
  if (i < n && j < m && a[i] === b[j]) { cerrar(); i++; j++; continue; }
  cur ??= { pos: i, guion: [], oido: [] };
  if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])) cur.oido.push(b[j++]);
  else cur.guion.push(a[i++]);
}
cerrar();

const acierto = n ? (L[0][0] / n) * 100 : 100;
console.log(`Capítulo ${cap}: ${L[0][0]} de ${n} palabras del guion se oyen igual (${acierto.toFixed(1)} %).`);
if (!tramos.length) { console.log("Sin diferencias."); process.exit(0); }
for (const t of tramos) {
  const ctx = a.slice(Math.max(0, t.pos - 4), t.pos).join(" ");
  console.log(`  …${ctx} | guion: «${t.guion.join(" ") || "—"}»  oído: «${t.oido.join(" ") || "—"}»`);
}
console.log("\nNo toda diferencia es error: whisper escribe «SII» donde el guion dice «ese i i». Revisa cada tramo y oye los dudosos.");
process.exitCode = 1;
