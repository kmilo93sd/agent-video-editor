/**
 * Example of recording a clip with Playwright. Copy it into the project and write one SCRIPT per clip.
 *
 *   node record.mjs 01          (on Windows with node, not with bun)
 *
 * Writes assets/clips/01-<name>.webm (what Playwright records), 01-<name>.mp4 (H.264, the one the edit
 * uses) and 01-<name>.marks.txt with one "12.34s text" line per action.
 *
 * Mark seconds are measured from when the page is created, which is when Playwright starts recording.
 * Never use real data: the URL points to the local environment with the demo company.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, renameSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const W = 1920, H = 1080;
const BASE = process.env.APP_URL ?? "http://localhost:3000";
const OUT = join(import.meta.dirname, "assets/clips");
const TMP = join(import.meta.dirname, ".recording");

const SCRIPTS = {
  "01": {
    name: "load-bank-statement",
    async run(page, mark) {
      await page.goto(`${BASE}/banking`);
      await page.waitForLoadState("networkidle");
      await pause(page, 1200);
      await mark("opens Banking");
      await click(page, page.getByRole("button", { name: "Upload statement" }));
      await mark("picker open");
      await page.getByLabel("File").setInputFiles(join(import.meta.dirname, "data/bank-statement-demo.csv"));
      await mark("file chosen");
      await page.getByRole("table").waitFor();
      await pause(page, 1500);
      await mark("table loaded");
      await pause(page, 2000);
    },
  },
};

async function pause(page, ms) { await page.waitForTimeout(ms); }

async function click(page, loc) {
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  if (b) {
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 25 });
    await pause(page, 350);
  }
  await loc.click();
  await pause(page, 600);
}

export async function typeText(loc, text) {
  await loc.click();
  await loc.pressSequentially(text, { delay: 90 });
}

const ch = process.argv[2];
const script = SCRIPTS[ch];
if (!script) throw new Error(`There is no recording script for "${ch}". Available: ${Object.keys(SCRIPTS).join(", ")}`);

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
const marks = [];
const mark = async (text) => { marks.push(`${((Date.now() - t0) / 1000).toFixed(2)}s ${text}`); };

try {
  await script.run(page, mark);
} finally {
  await context.close();
  await browser.close();
}

const webm = readdirSync(TMP).find((f) => f.endsWith(".webm"));
if (!webm) throw new Error("Playwright did not leave the video");
const base = join(OUT, `${ch}-${script.name}`);
renameSync(join(TMP, webm), `${base}.webm`);
writeFileSync(`${base}.marks.txt`, marks.join("\n") + "\n");
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", `${base}.webm`, "-c:v", "libx264", "-preset", "slow", "-crf", "14",
  "-pix_fmt", "yuv420p", "-g", "15", "-r", "30", "-an", `${base}.mp4`]);
rmSync(TMP, { recursive: true, force: true });
console.log(`ok ${base}.mp4 · ${marks.length} marks`);
