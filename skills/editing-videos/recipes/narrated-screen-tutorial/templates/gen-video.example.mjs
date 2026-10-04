/**
 * Example generator for a tutorial. Copy it into the project as gen-video.mjs and change what is under
 * "what is specific to this video": STEPS, EDIT, ZOOMS, GRAPHICS and the skin's texts. The rest is the engine.
 *
 *   node gen-video.mjs
 *
 * Reads: chapters.mjs (script), assets/voice/chNN.{mp3,json} + volumes.json + durations.json (from gen-voice.mjs),
 *      assets/clips/NN-*.mp4 with their NN-*.marks.txt (from record.mjs, already converted to H.264).
 * Writes, only if no rule is broken: compositions/chNN.html, compositions/chNN.motion.json,
 *      index.html and data/timeline.json.
 * Needs styles.css with the classes it uses (title-card, badge, cam, graphic, row) in the frame.md skin.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { chapters as scriptChapters, chapterId } from "./chapters.mjs";
import { build, review, markReader, loadAlignment, wordTime, phraseHtml, t1, f3, r3, esc, RULES } from "./edit-engine.mjs";

const ROOT = import.meta.dirname;
const W = 1920, H = 1080, FPS = 30;
const CARD = 3.0;
const VOICE_DIR = join(ROOT, "assets/voice");
const CLIPS_DIR = join(ROOT, "assets/clips");
const DUR = JSON.parse(readFileSync(join(VOICE_DIR, "durations.json"), "utf8"));
const VOL = JSON.parse(readFileSync(join(VOICE_DIR, "volumes.json"), "utf8"));

const FILES = Object.fromEntries(readdirSync(CLIPS_DIR).filter((f) => f.endsWith(".mp4")).map((f) => [f.slice(0, 2), f]));
const clipFile = (clip) => { const f = FILES[clip]; if (!f) throw new Error(`Clip ${clip}.mp4 does not exist in ${CLIPS_DIR}`); return f; };
const readers = {};
const m = (clip, fragment) => (readers[clip] ??= markReader(join(CLIPS_DIR, clipFile(clip).replace(/\.mp4$/, ".marks.txt"))))(fragment);

// ── what is specific to this video ───────────────────────────────────────────────────────────────

const STEPS = [{ ch: "01", title: "Load the bank statement" }];

const EDIT = {
  "00": [
    { clip: "09", spans: [t1(m("09", "report closed") - 1, m("09", "report closed") + 4)],
      phrases: [["This is the report", m("09", "report closed")], ["We are going to get here"]] },
  ],
  "01": [
    { clip: "01", spans: [t1(m("01", "opens Banking"), m("01", "picker open"))],
      phrases: [["In Banking", m("01", "opens Banking")]] },
    { clip: "01", spans: [t1(m("01", "file chosen"), m("01", "table loaded"))],
      phrases: [["The file your bank exports", m("01", "file chosen")]] },
    { graphic: "transaction", phrases: ["Once you upload it"] },
  ],
};

const ZOOMS = {
  "01": [{ from: "format", to: "as is", focus: [62, 40] }],
};

const GRAPHICS = {
  transaction: {
    rows: [{ what: "A transaction", anchor: "Once you upload it" }, { what: "Date", anchor: "its date" }, { what: "Amount", anchor: "its amount" }],
    html: (g) => `<div class="card">${g.rows.map((f, k) => `<p class="row" id="${g.id}-f${k}">${esc(f.what)}</p>`).join("")}</div>`,
  },
};

// ── engine ───────────────────────────────────────────────────────────────────────────────────────

const chapters = [];
let base = 0;
for (const c of scriptChapters) {
  const id = chapterId(c.ch);
  const align = loadAlignment(VOICE_DIR, id);
  const step = STEPS.findIndex((p) => p.ch === c.ch);
  const withCard = step >= 0;
  const r = build(EDIT[c.ch], {
    align, voiceDur: DUR[id], withCard, cardDur: CARD,
    sourceOf: (clip) => join(CLIPS_DIR, clipFile(clip)),
    srcOf: (clip) => `assets/clips/${clipFile(clip)}`,
    freezeDir: join(ROOT, "assets/freezes"),
    freezeSrc: (path) => relative(ROOT, path).replaceAll("\\", "/"),
  });
  chapters.push({ ch: c.ch, id, title: c.title, step, withCard, align, base: r3(base), ...r });
  base += r.end;
}
const TOTAL = r3(base);
let n = 0;
for (const ch of chapters) for (const p of ch.shots) p.id = `p${String(++n).padStart(2, "0")}`;

for (const ch of chapters) {
  ch.zooms = (ZOOMS[ch.ch] ?? []).map((z) => {
    const start = wordTime(ch.align, ch.phrases, z.from) - 0.3;
    const outAt = Math.max(wordTime(ch.align, ch.phrases, z.to, true), start + RULES.zoomInMin + 0.3);
    const shot = ch.shots.find((p) => p.type === "clip" && start >= p.start - 1e-6 && start < p.end) ?? ch.shots[0];
    return { ...z, scale: RULES.zoomMax, inDur: 1.6, outDur: RULES.zoomOut, start, outAt, end: outAt + RULES.zoomOut, shot };
  });
  for (const g of ch.shots.filter((p) => p.type === "graphic")) {
    const def = GRAPHICS[g.graphic];
    g.wordAt = wordTime(ch.align, ch.phrases, g.phrases[0].anchor);
    g.entries = def.rows.map((f, k) => ({ what: f.what, sel: `#${g.id}-f${k}`, at: wordTime(ch.align, ch.phrases, f.anchor) - 0.1, wordTime: wordTime(ch.align, ch.phrases, f.anchor) }));
  }
}

const { failures, warnings } = review(chapters);
for (const a of warnings) console.log(`warning: ${a}`);
if (failures.length) {
  console.error(`\n${failures.length} broken rule(s); nothing was written:\n  - ${failures.join("\n  - ")}`);
  process.exit(1);
}

function emit(ch) {
  const body = [];
  const motion = [];
  const assertions = [];
  if (ch.withCard) {
    body.push(`<section class="clip title-card" id="card-${ch.ch}" data-start="0" data-duration="${f3(CARD)}" data-track-index="4"><div class="title-card-body"><p>Step ${ch.step + 1} of ${STEPS.length}</p><h2>${esc(ch.title)}</h2></div></section>`);
    motion.push(`tl.fromTo("#card-${ch.ch} .title-card-body", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, 0.1);`);
    body.push(`<div class="clip badge" id="badge-${ch.ch}" style="z-index:500" data-start="${f3(CARD)}" data-duration="${f3(ch.end - CARD)}" data-track-index="5"><span>${ch.step + 1} · ${esc(ch.title)}</span></div>`);
  }
  ch.shots.forEach((p, i) => {
    if (p.type === "graphic") {
      const def = GRAPHICS[p.graphic];
      body.push(`<section class="clip graphic" id="${p.id}" style="z-index:${10 + i}" data-start="${f3(p.start)}" data-duration="${f3(p.end - p.start)}" data-track-index="3">${def.html({ ...def, id: p.id })}</section>`);
      for (const e of p.entries) {
        motion.push(`tl.fromTo("${e.sel}", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, ${f3(e.at)});`);
        assertions.push({ kind: "appearsBy", selector: e.sel, bySec: r3(e.at + 0.4) });
      }
      p.entries.slice(1).forEach((e, k) => assertions.push({ kind: "before", a: p.entries[k].sel, b: e.sel }));
      return;
    }
    const pieces = p.pieces.map((x, k) => x.type === "video"
      ? `<video id="${p.id}v${k}" class="clip media" src="${p.src}" data-start="${f3(x.start)}" data-duration="${f3(x.dur)}" data-media-start="${f3(x.from)}"${x.speed !== 1 ? ` data-playback-rate="${x.speed}"` : ""} data-track-index="1" data-hf-media-start-basis="local" muted playsinline></video>`
      : `<img id="${p.id}f${k}" class="clip media" src="${x.src}" data-start="${f3(x.start)}" data-duration="${f3(x.dur)}" data-track-index="2" data-hf-media-start-basis="local" alt="" />`).join("\n        ");
    body.push(`<div class="cam" id="${p.id}" style="z-index:${10 + i}">\n        ${pieces}\n      </div>`);
    for (const z of ch.zooms.filter((zz) => zz.shot === p)) {
      motion.push(`tl.set("#${p.id}", { transformOrigin: "${z.focus[0]}% ${z.focus[1]}%" }, ${f3(z.start)});`);
      motion.push(`tl.fromTo("#${p.id}", { scale: 1 }, { scale: ${z.scale}, duration: ${z.inDur}, ease: "sine.inOut", immediateRender: false }, ${f3(z.start)});`);
      motion.push(`tl.to("#${p.id}", { scale: 1, duration: ${z.outDur}, ease: "sine.inOut" }, ${f3(z.outAt)});`);
    }
  });
  ch.phrases.forEach((f, k) => body.push(phraseHtml({ id: `voice-${ch.ch}-${String(k + 1).padStart(2, "0")}`, src: `assets/voice/${ch.id}.mp3`, phrase: f, track: 20 + chapters.indexOf(ch), volume: VOL[ch.id] ?? 1 })));

  const cid = `ch${ch.ch}`;
  const html = `<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /><title>${esc(ch.title)}</title></head>
  <body>
    <template id="${cid}-template">
      <div id="root" data-composition-id="${cid}" data-start="0" data-width="${W}" data-height="${H}" data-duration="${f3(ch.end)}">
      ${body.join("\n      ")}
      </div>
      <script>
        (() => {
          const tl = gsap.timeline({ paused: true });
          ${motion.join("\n          ")}
          window.__timelines["${cid}"] = tl;
        })();
      </script>
    </template>
  </body>
</html>
`;
  return { html, motionJson: assertions.length ? { duration: ch.end, assertions } : null };
}

mkdirSync(join(ROOT, "compositions"), { recursive: true });
mkdirSync(join(ROOT, "data"), { recursive: true });
const hosts = [];
for (const ch of chapters) {
  const { html, motionJson } = emit(ch);
  writeFileSync(join(ROOT, `compositions/ch${ch.ch}.html`), html, "utf8");
  if (motionJson) writeFileSync(join(ROOT, `compositions/ch${ch.ch}.motion.json`), JSON.stringify(motionJson, null, 2) + "\n");
  hosts.push(`<div id="ch${ch.ch}" data-composition-id="ch${ch.ch}" data-composition-src="compositions/ch${ch.ch}.html" data-start="${f3(ch.base)}" data-duration="${f3(ch.end)}" data-track-index="1" data-width="${W}" data-height="${H}"></div>`);
}
writeFileSync(join(ROOT, "index.html"), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div id="root" data-composition-id="video" data-start="0" data-width="${W}" data-height="${H}" data-fps="${FPS}" data-duration="${f3(TOTAL)}">
      ${hosts.join("\n      ")}
    </div>
    <script>window.__timelines["video"] = gsap.timeline({ paused: true });</script>
  </body>
</html>
`, "utf8");

const mmss = (t) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
writeFileSync(join(ROOT, "data/timeline.json"), JSON.stringify({
  total: TOTAL,
  chapters: chapters.map((ch) => ({
    ch: ch.ch, title: ch.title, start: ch.base, end: r3(ch.base + ch.end), timestamp: mmss(ch.base),
    phrases: ch.phrases.map((f) => ({ start: r3(ch.base + f.start), dur: f.dur, text: f.text })),
    shots: ch.shots.map((p) => ({
      id: p.id, start: r3(ch.base + p.start), end: r3(ch.base + p.end),
      ...(p.type === "graphic"
        ? { graphic: p.graphic, firstContent: r3(ch.base + Math.min(...p.entries.map((e) => e.at))) }
        : { clip: p.clip, source: p.source.map(r3), speeds: p.speeds,
            frozen: r3(p.pieces.filter((x) => x.type === "frame").reduce((s, x) => s + x.dur, 0)) }),
    })),
  })),
}, null, 2) + "\n");

console.log(`Video: ${mmss(TOTAL)} (${TOTAL} s) · ${chapters.reduce((s, c) => s + c.shots.length, 0)} shots · ${chapters.reduce((s, c) => s + c.phrases.length, 0)} phrases`);
console.log("Chapters for the description:");
for (const ch of chapters) console.log(`  ${mmss(ch.base)} ${ch.title}`);
