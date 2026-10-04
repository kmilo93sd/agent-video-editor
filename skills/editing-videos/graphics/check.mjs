#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";
import { buildPreview } from "./build-preview.mjs";

const HELP = `Usage: node check.mjs

Checks graphics/ and memes/ and exits 1 on any failure:
  - node --check on every .mjs
  - catalog.json files parse and have the required fields
  - every file listed in graphics/catalog.json exists, and every asset file is listed
  - each snippet follows the HyperFrames rules (timed .clip, no clocks or Math.random,
    no infinite repeat, no visibility tweens, no tween on the .clip itself)
  - themable_vars and the function named in "call" exist in the snippet
  - preview.html matches what build-preview.mjs generates
  - memes/ holds no media and its catalog has 40 to 60 complete entries`;

if (process.argv.includes("-h") || process.argv.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const GFX = import.meta.dirname;
const MEMES = join(GFX, "..", "memes");
const errors = [];
let checks = 0;
const ok = (cond, msg) => {
  checks++;
  if (!cond) errors.push(msg);
};
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const rel = (p) => relative(GFX, p).replaceAll("\\", "/");

for (const f of [...walk(GFX), ...walk(MEMES)].filter((f) => f.endsWith(".mjs"))) {
  try {
    execFileSync(process.execPath, ["--check", f], { stdio: "pipe" });
    ok(true);
  } catch (e) {
    ok(false, `node --check failed: ${f}\n${e.stderr}`);
  }
}

const parse = (p) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    ok(false, `${p} does not parse: ${e.message}`);
    return null;
  }
};

const gcat = parse(join(GFX, "catalog.json"));
const CATEGORIES = ["arrows", "highlights", "underlines", "focus", "callouts", "text", "progress", "status", "layouts", "overlays", "cta"];
const LICENSES = ["CC0-1.0", "MIT", "Apache-2.0", "OFL-1.1", "CC-BY-4.0"];
const FIELDS = ["id", "category", "files", "description", "when_to_use", "when_not_to_use", "default_duration_s", "animation_in_s", "animation_out_s", "themable_vars", "license", "source"];
const BANNED = [
  [/Math\.random/, "Math.random"],
  [/Date\.now|new Date\(|performance\.now/, "a clock"],
  [/setTimeout|setInterval|requestAnimationFrame/, "a timer"],
  [/repeat:\s*-1/, "repeat: -1"],
  [/(visibility|autoAlpha|display)\s*:/, "a visibility/display tween"],
];

if (gcat) {
  const listed = new Set();
  const ids = new Set();
  for (const a of gcat.assets) {
    for (const k of FIELDS) ok(a[k] !== undefined && a[k] !== "", `${a.id}: missing field ${k}`);
    ok(!ids.has(a.id), `${a.id}: duplicate id`);
    ids.add(a.id);
    ok(CATEGORIES.includes(a.category), `${a.id}: unknown category ${a.category}`);
    ok(LICENSES.includes(a.license), `${a.id}: license ${a.license} not allowed`);
    ok(a.license !== "CC-BY-4.0" || a.attribution_required === true, `${a.id}: CC BY needs attribution_required: true`);
    ok(a.animation_in_s + a.animation_out_s <= a.default_duration_s, `${a.id}: in + out longer than the default duration`);
    for (const f of a.files) {
      listed.add(f);
      ok(existsSync(join(GFX, f)), `${a.id}: listed file missing: ${f}`);
      ok(f.startsWith(`${a.category}/`), `${a.id}: ${f} is not in its category folder`);
    }
    const html = a.files.find((f) => f.endsWith(".html"));
    ok(html, `${a.id}: no .html snippet`);
    if (!html || !existsSync(join(GFX, html))) continue;
    const s = readFileSync(join(GFX, html), "utf8");
    const script = s.slice(s.indexOf("<script>"), s.indexOf("</script>"));
    ok(new RegExp(`class="clip gfx-${a.id}"`).test(s), `${a.id}: no .clip element with class gfx-${a.id}`);
    const dur = s.match(/class="clip[^>]*data-duration="([\d.]+)"/);
    ok(/class="clip[^>]*data-start="/.test(s) && dur, `${a.id}: the .clip needs data-start and data-duration`);
    ok(dur && Number(dur[1]) === a.default_duration_s, `${a.id}: data-duration ${dur?.[1]} differs from default_duration_s ${a.default_duration_s}`);
    for (const [re, what] of BANNED) ok(!re.test(script), `${a.id}: script uses ${what}`);
    ok(!/tl\.(to|from|fromTo|set)\(\s*el\s*,/.test(script), `${a.id}: tweens the .clip element itself`);
    const fn = a.call?.match(/^gfx\.(\w+)\(/)?.[1];
    ok(fn && script.includes(`window.gfx.${fn} = function`), `${a.id}: function ${fn} not defined in the snippet`);
    for (const v of a.themable_vars) ok(s.includes(`${v}:`) && s.includes(`var(${v}`), `${a.id}: themable var ${v} not declared and used`);
    ok(!/https?:\/\/(?!www\.w3\.org)/.test(s), `${a.id}: snippet loads something remote`);
  }
  for (const f of walk(GFX).map(rel).filter((f) => CATEGORIES.includes(f.split("/")[0]))) {
    ok(listed.has(f), `asset file not in catalog.json: ${f}`);
  }
  for (const f of walk(GFX).map(rel).filter((f) => f.endsWith(".svg"))) {
    const s = readFileSync(join(GFX, f), "utf8");
    ok(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(s) && s.trim().endsWith("</svg>") && /<title>[^<]*CC0-1\.0/.test(s), `${f}: not a standalone SVG with a CC0 title`);
  }
  ok(readFileSync(join(GFX, "preview.html"), "utf8") === buildPreview(), "preview.html is stale: run node build-preview.mjs");
}

const mcat = parse(join(MEMES, "catalog.json"));
const MFIELDS = ["id", "name", "format", "what_it_means", "when_to_use", "timing_s", "how_to_recreate", "origin", "rights", "content_id_risk", "sourcing", "tone_warnings"];
if (mcat) {
  const n = mcat.memes.length;
  ok(n >= 40 && n <= 60, `memes: ${n} entries, expected 40 to 60`);
  const ids = new Set();
  for (const m of mcat.memes) {
    for (const k of MFIELDS) ok(m[k] !== undefined && m[k] !== "", `meme ${m.id}: missing field ${k}`);
    ok(!ids.has(m.id), `meme ${m.id}: duplicate id`);
    ids.add(m.id);
    ok(["image", "gif", "video", "sound"].includes(m.format), `meme ${m.id}: bad format ${m.format}`);
    ok(["low", "medium", "high"].includes(m.content_id_risk?.level) && m.content_id_risk?.reason, `meme ${m.id}: content_id_risk needs level and reason`);
    ok(Array.isArray(m.timing_s) && m.timing_s.length === 2 && m.timing_s[0] <= m.timing_s[1], `meme ${m.id}: timing_s must be [min, max]`);
    ok(m.rights?.likely_owner && m.rights?.kind, `meme ${m.id}: rights needs likely_owner and kind`);
    ok(Array.isArray(m.sourcing) && m.sourcing.length > 0, `meme ${m.id}: sourcing is empty`);
    ok(Array.isArray(m.tone_warnings), `meme ${m.id}: tone_warnings must be a list`);
  }
  const allowed = new Set(["README.md", "catalog.json", "search.mjs"]);
  for (const f of walk(MEMES)) ok(allowed.has(relative(MEMES, f)), `memes/ must not ship media or extra files: ${relative(MEMES, f)}`);
}

if (errors.length) {
  console.error(`FAIL: ${errors.length} of ${checks} checks failed`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`OK: ${checks} checks passed (${gcat.assets.length} graphics assets, ${mcat.memes.length} memes)`);
