/**
 * Ejemplo de grabación de un clip con Playwright. Se copia al proyecto y se escribe un GUION por clip.
 *
 *   node grabar.mjs 01          (en Windows con node, no con bun)
 *
 * Escribe assets/clips/01-<nombre>.webm (lo que graba Playwright), 01-<nombre>.mp4 (H.264, el que usa el
 * montaje) y 01-<nombre>.marcas.txt con una línea «12.34s texto» por acción.
 *
 * Los segundos de las marcas se miden desde que se crea la página, que es cuando Playwright empieza a
 * grabar. Nunca uses datos reales: la URL apunta al ambiente local con la empresa demo.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, renameSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const W = 1920, H = 1080;
const BASE = process.env.APP_URL ?? "http://localhost:3000";
const OUT = join(import.meta.dirname, "assets/clips");
const TMP = join(import.meta.dirname, ".grabando");

const GUIONES = {
  "01": {
    nombre: "cargar-cartola",
    async correr(page, marca) {
      await page.goto(`${BASE}/bancos`);
      await page.waitForLoadState("networkidle");
      await pausa(page, 1200);
      await marca("abre «Bancos»");
      await clic(page, page.getByRole("button", { name: "Subir cartola" }));
      await marca("selector abierto");
      await page.getByLabel("Archivo").setInputFiles(join(import.meta.dirname, "datos/cartola-demo.csv"));
      await marca("archivo elegido");
      await page.getByRole("table").waitFor();
      await pausa(page, 1500);
      await marca("tabla cargada");
      await pausa(page, 2000);
    },
  },
};

async function pausa(page, ms) { await page.waitForTimeout(ms); }

async function clic(page, loc) {
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  if (b) {
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 25 });
    await pausa(page, 350);
  }
  await loc.click();
  await pausa(page, 600);
}

export async function tipear(loc, texto) {
  await loc.click();
  await loc.pressSequentially(texto, { delay: 90 });
}

const cap = process.argv[2];
const guion = GUIONES[cap];
if (!guion) throw new Error(`No hay guion de grabación para «${cap}». Hay: ${Object.keys(GUIONES).join(", ")}`);

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
  recordVideo: { dir: TMP, size: { width: W, height: H } },
});
const page = await context.newPage();
const t0 = Date.now();
const marcas = [];
const marca = async (texto) => { marcas.push(`${((Date.now() - t0) / 1000).toFixed(2)}s ${texto}`); };

try {
  await guion.correr(page, marca);
} finally {
  await context.close();
  await browser.close();
}

const webm = readdirSync(TMP).find((f) => f.endsWith(".webm"));
if (!webm) throw new Error("Playwright no dejó el video");
const base = join(OUT, `${cap}-${guion.nombre}`);
renameSync(join(TMP, webm), `${base}.webm`);
writeFileSync(`${base}.marcas.txt`, marcas.join("\n") + "\n");
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", `${base}.webm`, "-c:v", "libx264", "-preset", "slow", "-crf", "14",
  "-pix_fmt", "yuv420p", "-g", "15", "-r", "30", "-an", `${base}.mp4`]);
rmSync(TMP, { recursive: true, force: true });
console.log(`ok ${base}.mp4 · ${marcas.length} marcas`);
