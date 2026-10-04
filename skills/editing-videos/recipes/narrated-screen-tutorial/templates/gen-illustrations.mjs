import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const HELP = `Usage: node gen-illustrations.mjs [scene ...] [--redo] [--scenes ./illustrations.mjs] [--env path/.env] [--out assets/illustrations]

Generates 16:9 illustrations with Gemini from a module that exports:
  export const STYLE = "style shared by all of them, in English, with 'no text, no letters, no logos'";
  export const SCENES = { name: "description of the scene", ... };

The .env is the one from --env, otherwise the one in VIDEO_ENV_FILE, otherwise ./.env. Do not copy keys: point to the .env that already has them.
Variables (in that .env or in the environment):
  GEMINI_API_KEY        required
  GEMINI_IMAGE_MODEL    optional, defaults to gemini-3.1-flash-image
  ILLUSTRATION_SIZE     optional, defaults to 2K`;

const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) { console.log(HELP); process.exit(0); }
const opt = (n, d) => {
  const i = args.indexOf(n);
  if (i < 0) return d;
  if (!args[i + 1] || args[i + 1].startsWith("--")) throw new Error(`Missing value after ${n}`);
  return args[i + 1];
};
const values = new Set(["--scenes", "--env", "--out"].map((n) => opt(n)).filter(Boolean));
const wanted = args.filter((a) => !a.startsWith("--") && !values.has(a));

const envPath = opt("--env", process.env.VIDEO_ENV_FILE || join(process.cwd(), ".env"));
const envTxt = envPath && existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const read = (k) => ((process.env[k] || undefined) ?? envTxt.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1] ?? "").trim().replace(/^["']|["']$/g, "");

const KEY = read("GEMINI_API_KEY");
if (!KEY) throw new Error(`Missing GEMINI_API_KEY (looked in ${envPath ?? "no .env"} and in the environment)`);
const MODEL = read("GEMINI_IMAGE_MODEL") || "gemini-3.1-flash-image";
const SIZE = read("ILLUSTRATION_SIZE") || "2K";

const { STYLE, SCENES } = await import(pathToFileURL(resolve(opt("--scenes", "./illustrations.mjs"))).href);
const OUT = opt("--out", "assets/illustrations");
mkdirSync(OUT, { recursive: true });

const unknown = wanted.filter((q) => !(q in SCENES));
if (unknown.length) throw new Error(`Scenes that do not exist: ${unknown.join(", ")}`);

let failures = 0;
for (const [name, scene] of Object.entries(SCENES)) {
  if (wanted.length && !wanted.includes(name)) continue;
  const target = join(OUT, `${name}.jpg`);
  if (existsSync(target) && !args.includes("--redo")) { console.log("already exists", name); continue; }
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "x-goog-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      input: `${scene} ${STYLE}`,
      response_format: { type: "image", mime_type: "image/jpeg", aspect_ratio: "16:9", image_size: SIZE },
    }),
  });
  const json = await res.json();
  const img = json.steps?.flatMap((s) => s.content ?? []).find((c) => c.type === "image");
  if (!img) {
    console.error("FAILED", name, res.status, JSON.stringify(json).slice(0, 400));
    failures++;
    continue;
  }
  if (img.mime_type && img.mime_type !== "image/jpeg") console.error(`warning: ${name} came back as ${img.mime_type}, not JPEG`);
  writeFileSync(target, Buffer.from(img.data, "base64"));
  console.log("ok", name);
}
if (failures) process.exitCode = 1;
