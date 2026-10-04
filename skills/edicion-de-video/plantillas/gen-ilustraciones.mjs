import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const AYUDA = `Uso: node gen-ilustraciones.mjs [escena ...] [--rehacer] [--escenas ./ilustraciones.mjs] [--env ruta/.env] [--salida assets/ilustraciones]

Genera ilustraciones 16:9 con Gemini a partir de un modulo que exporta:
  export const ESTILO = "estilo comun a todas, en ingles, con 'no text, no letters, no logos'";
  export const ESCENAS = { nombre: "descripcion de la escena", ... };

El .env es el de --env, si no el de VIDEO_ENV_FILE, si no ./.env. No copies claves: apunta al .env que ya las tiene.
Variables (en ese .env o en el entorno):
  GEMINI_API_KEY        obligatoria
  GEMINI_IMAGE_MODEL    opcional, por defecto gemini-3.1-flash-image
  ILUSTRACION_TAMANO    opcional, por defecto 2K`;

const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) { console.log(AYUDA); process.exit(0); }
const opt = (n, d) => {
  const i = args.indexOf(n);
  if (i < 0) return d;
  if (!args[i + 1] || args[i + 1].startsWith("--")) throw new Error(`Falta el valor después de ${n}`);
  return args[i + 1];
};
const valores = new Set(["--escenas", "--env", "--salida"].map((n) => opt(n)).filter(Boolean));
const quiero = args.filter((a) => !a.startsWith("--") && !valores.has(a));

const rutaEnv = opt("--env", process.env.VIDEO_ENV_FILE || join(process.cwd(), ".env"));
const envTxt = rutaEnv && existsSync(rutaEnv) ? readFileSync(rutaEnv, "utf8") : "";
const leer = (k) => ((process.env[k] || undefined) ?? envTxt.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1] ?? "").trim().replace(/^["']|["']$/g, "");

const KEY = leer("GEMINI_API_KEY");
if (!KEY) throw new Error(`Falta GEMINI_API_KEY (busqué en ${rutaEnv ?? "ningún .env"} y en el entorno)`);
const MODELO = leer("GEMINI_IMAGE_MODEL") || "gemini-3.1-flash-image";
const TAMANO = leer("ILUSTRACION_TAMANO") || "2K";

const { ESTILO, ESCENAS } = await import(pathToFileURL(resolve(opt("--escenas", "./ilustraciones.mjs"))).href);
const OUT = opt("--salida", "assets/ilustraciones");
mkdirSync(OUT, { recursive: true });

const desconocidas = quiero.filter((q) => !(q in ESCENAS));
if (desconocidas.length) throw new Error(`Escenas que no existen: ${desconocidas.join(", ")}`);

let fallas = 0;
for (const [nombre, escena] of Object.entries(ESCENAS)) {
  if (quiero.length && !quiero.includes(nombre)) continue;
  const destino = join(OUT, `${nombre}.jpg`);
  if (existsSync(destino) && !args.includes("--rehacer")) { console.log("ya está", nombre); continue; }
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "x-goog-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODELO,
      input: `${escena} ${ESTILO}`,
      response_format: { type: "image", mime_type: "image/jpeg", aspect_ratio: "16:9", image_size: TAMANO },
    }),
  });
  const json = await res.json();
  const img = json.steps?.flatMap((s) => s.content ?? []).find((c) => c.type === "image");
  if (!img) {
    console.error("FALLÓ", nombre, res.status, JSON.stringify(json).slice(0, 400));
    fallas++;
    continue;
  }
  if (img.mime_type && img.mime_type !== "image/jpeg") console.error(`aviso: ${nombre} vino como ${img.mime_type}, no JPEG`);
  writeFileSync(destino, Buffer.from(img.data, "base64"));
  console.log("ok", nombre);
}
if (fallas) process.exitCode = 1;
