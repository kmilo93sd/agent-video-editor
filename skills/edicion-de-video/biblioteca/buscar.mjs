#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

const AYUDA = `Uso: node buscar.mjs [texto] [--categoria <c>] [--json] [--rutas]

  sin argumentos        lista las categorias con cuantos sonidos tiene cada una
  texto                 filtra por id, uso sugerido u origen (sin importar tildes ni mayusculas)
  --categoria <c>       solo esa categoria (transicion, click, aparicion, notificacion, error,
                        exito, tipeo, impacto, musica)
  --voz <lufs>          calcula el data-volume de cada sonido para una voz a ese nivel (voz_lufs de
                        volumenes.json): efectos 15 dB bajo la voz, musica 20 dB
  --rutas               imprime la ruta absoluta de cada archivo (para copiarlo al proyecto)
  --json                devuelve las entradas completas del catalogo

Ejemplos:
  node buscar.mjs --categoria transicion
  node buscar.mjs placa
  node buscar.mjs pop --rutas
  node buscar.mjs --categoria aparicion --voz -17`;

const DIR = import.meta.dirname;
const { sonidos, criterio } = JSON.parse(readFileSync(join(DIR, "catalogo.json"), "utf8"));
const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
  console.log(AYUDA);
  process.exit(0);
}

const plano = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const iCat = args.indexOf("--categoria");
const categoria = iCat >= 0 ? args[iCat + 1] : null;
if (iCat >= 0 && !categoria) {
  console.error("Falta el nombre de la categoria despues de --categoria");
  process.exit(2);
}
const iVoz = args.indexOf("--voz");
const voz = iVoz >= 0 ? Number(args[iVoz + 1]) : null;
if (iVoz >= 0 && !Number.isFinite(voz)) {
  console.error("Falta el nivel de la voz en LUFS despues de --voz (por ejemplo --voz -17)");
  process.exit(2);
}
const valores = new Set([iCat, iVoz].filter((i) => i >= 0).map((i) => i + 1));
const texto = args.filter((a, i) => !(a.startsWith("--") || (a.startsWith("-") && valores.has(i))) && !valores.has(i)).join(" ");

if (!texto && !categoria && voz === null) {
  const cuenta = {};
  for (const s of sonidos) cuenta[s.categoria] = (cuenta[s.categoria] ?? 0) + 1;
  console.log(`${sonidos.length} sonidos. Categorias:`);
  for (const [c, n] of Object.entries(cuenta)) console.log(`  ${c.padEnd(13)} ${n}`);
  console.log(`\nMezcla: ${criterio.mezcla}`);
  console.log(`\n${AYUDA}`);
  process.exit(0);
}

const q = plano(texto);
const hallados = sonidos.filter((s) =>
  (!categoria || s.categoria === categoria) &&
  (!q || plano(`${s.id} ${s.uso_sugerido} ${s.origen}`).includes(q)));

if (!hallados.length) {
  console.error(`Nada calza con ${[texto && `"${texto}"`, categoria && `categoria ${categoria}`].filter(Boolean).join(" y ")}.`);
  process.exit(1);
}
if (args.includes("--json")) {
  console.log(JSON.stringify(hallados, null, 2));
} else {
  for (const s of hallados) {
    const ruta = args.includes("--rutas") ? join(DIR, s.archivo).replaceAll("\\", "/") : s.archivo;
    const vol = voz === null ? "" : `  data-volume ${Math.min(1, Math.pow(10, (voz - (s.categoria === "musica" ? 20 : 15) - s.lufs) / 20)).toFixed(2)}`;
    console.log(`${s.id.padEnd(21)} ${s.categoria.padEnd(12)} ${String(s.duracion_s).padStart(6)} s  ${String(s.lufs).padStart(6)} LUFS${vol}  ${ruta}`);
    console.log(`${"".padEnd(21)} ${s.uso_sugerido}`);
  }
}
