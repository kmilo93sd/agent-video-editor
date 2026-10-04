import { readdirSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const AYUDA = `Uso: node hoja-de-contacto.mjs <carpeta-de-snapshots> [--columnas 4] [--filas 3]

Junta los PNG de la carpeta, en orden de nombre, en hojas de contacto de columnas x filas (por defecto 4x3 = 12
cuadros por hoja). Escribe <carpeta>/hoja-1.jpg, hoja-2.jpg, ... y no descarta ningun cuadro.
Se lee por filas, de izquierda a derecha. Saca los snapshots con:
  npx hyperframes snapshot --at <t1>,<t2>,... --no-end --describe false -o <carpeta>`;

const args = process.argv.slice(2);
if (!args.length || args.includes("-h") || args.includes("--help")) { console.log(AYUDA); process.exit(args.length ? 0 : 2); }
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? Number(args[i + 1]) : d; };
const COL = opt("--columnas", 4), FIL = opt("--filas", 3);
const dir = resolve(args[0]);
const pngs = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".png")).sort();
if (!pngs.length) { console.error(`No hay PNG en ${dir}`); process.exit(1); }

const porHoja = COL * FIL;
const hojas = [];
for (let h = 0; h * porHoja < pngs.length; h++) {
  const grupo = pngs.slice(h * porHoja, (h + 1) * porHoja);
  const lista = join(dir, `.lista-${h + 1}.txt`);
  writeFileSync(lista, grupo.map((f) => `file '${join(dir, f).replaceAll("\\", "/")}'`).join("\n"));
  const salida = join(dir, `hoja-${h + 1}.jpg`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista,
    "-vf", `scale=480:-1,tile=${COL}x${FIL}:padding=8:color=white`, "-frames:v", "1", salida]);
  rmSync(lista);
  hojas.push(`${salida}  (${grupo[0]} … ${grupo[grupo.length - 1]})`);
}
console.log(`${pngs.length} cuadros en ${hojas.length} hoja(s):`);
for (const h of hojas) console.log(`  ${h}`);
