import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

export const RULES = {
  breath: 0.6,
  minGap: 0.4,
  silenceWarn: 3,
  silenceMax: 6,
  shotMin: 5,
  speedMax: 1.5,
  shotTail: 1.0,
  graphicTail: 1.2,
  graphicLead: 0.4,
  graphicEarlyMax: 0.5,
  graphicEmptyMax: 1.0,
  anchorTolerance: 0.6,
  zoomMax: 1.10,
  zoomInMin: 1.5,
  zoomOut: 0.9,
  fps: 30,
};

export const r3 = (x) => Math.round(x * 1000) / 1000;
export const f3 = (x) => r3(x).toFixed(3);
export const t1 = (from, to, speed = 1) => ({ from, to, speed });
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export function mediaDuration(file) {
  const s = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }).trim();
  const n = Number(s);
  if (!Number.isFinite(n)) throw new Error(`ffprobe did not return the duration of ${file} (it returned "${s}"); remux the file`);
  return n;
}

export function markReader(marksPath) {
  const lines = readFileSync(marksPath, "utf8").split(/\r?\n/)
    .map((l) => l.match(/^\s*([\d.]+)s\s+(.*)$/)).filter(Boolean)
    .map(([, s, text]) => ({ s: Number(s), text: text.trim() }));
  return (fragment) => {
    const exact = lines.filter((x) => x.text === fragment);
    const hits = exact.length ? exact : lines.filter((x) => x.text.includes(fragment));
    if (hits.length !== 1) throw new Error(`The mark "${fragment}" matches ${hits.length} lines of ${marksPath}`);
    return hits[0].s;
  };
}

export function loadAlignment(voiceDir, id) {
  return JSON.parse(readFileSync(join(voiceDir, `${id}.json`), "utf8"));
}

export function anchorIndex(align, anchor, label = "") {
  const i = align.text.indexOf(anchor);
  if (i < 0) throw new Error(`${label}the anchor "${anchor}" does not appear in the voice`);
  if (align.text.indexOf(anchor, i + 1) >= 0) throw new Error(`${label}the anchor "${anchor}" appears twice; make it longer`);
  return i;
}

export function splitPhrases(align, anchors, totalDur, label = "") {
  const { text, starts } = align;
  const idx = anchors.map((a) => anchorIndex(align, a, label));
  if (idx[0] !== 0) throw new Error(`${label}the first phrase must start at the beginning of the text`);
  idx.forEach((v, k) => { if (k && v <= idx[k - 1]) throw new Error(`${label}the phrase "${anchors[k]}" is out of order`); });
  return idx.map((i0, k) => {
    const i1 = k + 1 < idx.length ? idx[k + 1] : text.length;
    let last = i1 - 1;
    while (last > i0 && /\s/.test(text[last])) last--;
    const ms = Math.max(0, starts[i0] - 0.06);
    const me = k + 1 < idx.length ? Math.min(starts[idx[k + 1]] - 0.03, starts[last] + 0.25) : totalDur;
    if (me - ms < 0.3) throw new Error(`${label}the phrase "${anchors[k]}" came out at ${(me - ms).toFixed(2)} s`);
    return { anchor: anchors[k], i0, i1, ms: r3(ms), dur: r3(me - ms), text: text.slice(i0, i1).trim() };
  });
}

export function wordTime(align, phrases, anchor, atEnd = false) {
  let i = anchorIndex(align, anchor);
  if (atEnd) i += anchor.length - 1;
  const f = phrases.find((x) => i >= x.i0 && i < x.i1);
  if (!f || f.start == null) throw new Error(`"${anchor}" does not fall in any placed phrase`);
  const t = f.start + (align.starts[i] - f.ms) + (atEnd ? 0.15 : 0);
  return Math.min(Math.max(t, f.start), f.start + f.dur);
}

export function phraseHtml({ id, src, phrase, track, volume = 1, group = "voice" }) {
  return `<audio id="${id}" class="clip" src="${src}" data-start="${f3(phrase.start)}" data-duration="${f3(phrase.dur)}" data-media-start="${f3(phrase.ms)}" data-track-index="${track}" data-hf-media-start-basis="local" data-volume="${volume.toFixed(3)}" data-audio-group="${group}"></audio>`;
}

export function freezeFrame({ source, t, outDir, prefix }) {
  const dur = mediaDuration(source);
  const tt = Math.max(0, Math.min(t, dur) - 0.04);
  mkdirSync(outDir, { recursive: true });
  const path = join(outDir, `${prefix}-${Math.round(tt * 1000)}.png`);
  if (!existsSync(path) || statSync(path).mtimeMs < statSync(source).mtimeMs) {
    const a = dur - tt < 0.2
      ? ["-v", "error", "-y", "-sseof", "-0.12", "-i", source, "-frames:v", "1", path]
      : ["-v", "error", "-y", "-ss", tt.toFixed(3), "-i", source, "-frames:v", "1", path];
    execFileSync("ffmpeg", a);
    if (!existsSync(path)) throw new Error(`ffmpeg did not extract the frame at ${tt.toFixed(2)} s from ${source}`);
  }
  return { path, second: r3(tt + 0.04) };
}

/**
 * Places screen and voice on a chapter's clock.
 *
 * segments, in the order they are seen:
 *   { clip, spans: [t1(from, to, speed?)], phrases: [["anchor", clipSecond] | ["anchor"]], short?, waitForVoice? }
 *   { graphic: "name", phrases: ["anchor", ...] }
 * ctx: { align, voiceDur, withCard, cardDur, sourceOf(clip) -> file path, srcOf(clip) -> src in the HTML,
 *        freezeDir, freezeSrc(path) -> src in the HTML, rules? }
 *
 * Returns { shots, phrases, end }. Each clip shot carries what review() needs:
 *   { type: "clip", clip, source: [from, to], start, end, short, speeds, freezes: [{ second, expected }],
 *     pieces: [{ type: "video", start, dur, from, speed } | { type: "frame", start, dur, src }] }
 * and each graphic: { type: "graphic", graphic, start, end, phrases }. The emitter adds wordAt (when its first
 * anchor is heard) and entries [{ what, at, wordTime }] to each graphic before review().
 */
export function build(segments, ctx) {
  const R = { ...RULES, ...(ctx.rules ?? {}) };
  const anchors = segments.flatMap((s) => (s.phrases ?? []).map((f) => (Array.isArray(f) ? f[0] : f)));
  const phrases = splitPhrases(ctx.align, anchors, ctx.voiceDur);
  let fi = 0;
  let T = ctx.withCard ? ctx.cardDur : 0;
  let free = T + (ctx.withCard ? R.breath : 0);
  const shots = [];
  const placePhrase = (start) => {
    const f = phrases[fi++];
    f.start = r3(start);
    free = f.start + f.dur + R.minGap;
    return f;
  };

  segments.forEach((seg, si) => {
    const nextIsGraphic = !!segments[si + 1]?.graphic;
    if (seg.graphic) {
      const start = Math.max(T, free - R.graphicLead);
      const own = seg.phrases.map((_, k) => placePhrase(k === 0 ? start + R.graphicLead : free));
      const end = free - R.minGap + R.graphicTail;
      shots.push({ ...seg, type: "graphic", start: r3(start), end: r3(end), phrases: own });
      T = end;
      return;
    }
    for (let k = 1; k < seg.spans.length; k++) {
      if (Math.abs(seg.spans[k].from - seg.spans[k - 1].to) > 1e-6) throw new Error(`segment ${si + 1}: the spans are not contiguous; a jump is another segment`);
    }
    const source = ctx.sourceOf(seg.clip);
    const p = { ...seg, type: "clip", src: ctx.srcOf(seg.clip), start: r3(T), pieces: [], freezes: [], phrases: [] };
    let cur = seg.spans[0].from;
    const sourceEnd = seg.spans[seg.spans.length - 1].to;
    const spanAt = (s) => seg.spans.find((sp) => s >= sp.from - 1e-9 && s < sp.to - 1e-9);
    const advance = (to) => {
      while (cur < to - 1e-6) {
        const sp = spanAt(cur);
        const end = Math.min(to, sp.to);
        const d = (end - cur) / sp.speed;
        const u = p.pieces[p.pieces.length - 1];
        if (u && u.type === "video" && u.speed === sp.speed && Math.abs(u.from + u.dur * u.speed - cur) < 1e-6) u.dur += d;
        else p.pieces.push({ type: "video", start: T, dur: d, from: cur, speed: sp.speed });
        T += d;
        cur = end;
      }
    };
    const freeze = (d) => {
      if (d < 1 / R.fps) return;
      const c = freezeFrame({ source, t: cur, outDir: ctx.freezeDir, prefix: String(seg.clip) });
      p.pieces.push({ type: "frame", start: T, dur: d, src: ctx.freezeSrc(c.path) });
      p.freezes.push({ second: c.second, expected: r3(Math.min(cur, mediaDuration(source))) });
      T += d;
    };
    for (const fr of seg.phrases ?? []) {
      const [anchor, at] = Array.isArray(fr) ? fr : [fr];
      if (at == null) { p.phrases.push(placePhrase(free)); continue; }
      if (at < cur - 1e-6) throw new Error(`the phrase "${anchor}" falls at ${at} s of clip ${seg.clip}, which has already played`);
      if (at > sourceEnd) throw new Error(`the phrase "${anchor}" falls after the end of the segment`);
      advance(at);
      if (T < free) freeze(free - T);
      p.phrases.push(placePhrase(Math.max(T, free)));
    }
    advance(sourceEnd);
    if (seg.waitForVoice !== false && free - R.minGap > T - (nextIsGraphic ? 0 : R.shotTail)) {
      freeze(free - R.minGap + (nextIsGraphic ? 0.1 : R.shotTail) - T);
    }
    p.end = r3(T);
    for (const x of p.pieces) { x.start = r3(x.start); x.dur = r3(x.dur); if (x.from != null) x.from = r3(x.from); }
    p.source = [seg.spans[0].from, sourceEnd];
    p.speeds = [...new Set(seg.spans.map((sp) => sp.speed))];
    shots.push(p);
  });

  if (fi !== phrases.length) throw new Error(`${phrases.length - fi} phrases not placed`);
  return { shots, phrases, end: r3(Math.max(T, free - R.minGap + 0.3)) };
}

/**
 * Checks the editing rules. chapters: [{ ch, shots, phrases, zooms? }]
 *   shots: what build() returns, with an id ("p01") and, on graphics, wordAt and entries.
 *   phrases[k].silenceJustified = true lets a long gap before that phrase through.
 *   zooms: [{ scale, inDur, outDur, start, end, shot }] in chapter time.
 * Returns { failures, warnings }. With any failure, the generator writes nothing.
 */
export function review(chapters, rules = {}) {
  const R = { ...RULES, ...rules };
  const failures = [];
  const warnings = [];
  for (const ch of chapters) {
    const tag = `ch ${ch.ch}`;
    const endOf = {};
    const used = [];
    let last = null;
    for (const p of ch.shots.filter((x) => x.type === "clip")) {
      if (p.clip !== last && used.includes(p.clip)) failures.push(`${tag} ${p.id}: returns to clip ${p.clip} after leaving it`);
      if (endOf[p.clip] != null && p.source[0] < endOf[p.clip] - 1e-6) failures.push(`${tag} ${p.id}: clip ${p.clip} goes back from ${endOf[p.clip].toFixed(2)} s to ${p.source[0].toFixed(2)} s`);
      endOf[p.clip] = p.source[1];
      if (!used.includes(p.clip)) used.push(p.clip);
      last = p.clip;
      const d = p.end - p.start;
      if (!p.short && d < R.shotMin - 1e-6) failures.push(`${tag} ${p.id}: shot of ${d.toFixed(2)} s (minimum ${R.shotMin} s)`);
      for (const v of p.speeds ?? []) if (v > R.speedMax + 1e-9) failures.push(`${tag} ${p.id}: span at ×${v} (maximum ×${R.speedMax})`);
      for (const c of p.freezes ?? []) {
        if (Math.abs(c.second - c.expected) > 0.1) failures.push(`${tag} ${p.id}: the freeze came from second ${c.second} but the clip was at ${c.expected}`);
      }
    }
    ch.phrases.forEach((f, k) => {
      const next = ch.phrases[k + 1];
      if (!next) return;
      const gap = next.start - (f.start + f.dur);
      if (gap < R.minGap - 1e-3) failures.push(`${tag}: between "${f.anchor}" and "${next.anchor}" there are ${gap.toFixed(2)} s (minimum ${R.minGap})`);
      else if (gap > R.silenceMax && !next.silenceJustified) failures.push(`${tag}: ${gap.toFixed(1)} s without voice before "${next.anchor}" (cap ${R.silenceMax} s; if the screen shows a self-explanatory action, set silenceJustified)`);
      else if (gap > R.silenceWarn && !next.silenceJustified) warnings.push(`${tag}: ${gap.toFixed(1)} s without voice before "${next.anchor}": check that something happens on screen`);
    });
    for (const g of ch.shots.filter((x) => x.type === "graphic")) {
      if (!g.entries?.length) { failures.push(`${tag} ${g.id}: the graphic declares no entries; it cannot be checked`); continue; }
      const first = Math.min(...g.entries.map((e) => e.at));
      if (first - g.start > R.graphicEmptyMax + 1e-6) failures.push(`${tag} ${g.id}: the graphic stays empty for ${(first - g.start).toFixed(2)} s`);
      if (g.wordAt - g.start > R.graphicEarlyMax + 1e-6) failures.push(`${tag} ${g.id}: the graphic enters ${(g.wordAt - g.start).toFixed(2)} s before its word`);
      if (g.start - g.wordAt > R.anchorTolerance + 1e-6) failures.push(`${tag} ${g.id}: the graphic enters ${(g.start - g.wordAt).toFixed(2)} s after its word`);
      for (const e of g.entries) {
        if (Math.abs(e.at - e.wordTime) > R.anchorTolerance) failures.push(`${tag} ${g.id}: "${e.what}" enters ${(e.at - e.wordTime).toFixed(2)} s from its word`);
      }
    }
    const zooms = ch.zooms ?? [];
    zooms.forEach((z, k) => {
      if (z.scale > R.zoomMax + 1e-9) failures.push(`${tag}: zoom to ${z.scale} (maximum ${R.zoomMax})`);
      if (z.inDur < R.zoomInMin - 1e-9) failures.push(`${tag}: zoom that enters in ${z.inDur} s (minimum ${R.zoomInMin} s)`);
      if (z.start < z.shot.start - 1e-6 || z.end > z.shot.end - 0.05) failures.push(`${tag} ${z.shot.id}: the zoom (${z.start.toFixed(2)}–${z.end.toFixed(2)}) does not fit in the shot (${z.shot.start.toFixed(2)}–${z.shot.end.toFixed(2)})`);
      const phrasesBetween = ch.phrases.filter((f) => f.start >= (zooms[k - 1]?.start ?? -Infinity) && f.start < z.start).length;
      if (k > 0 && phrasesBetween < 2) failures.push(`${tag}: zoom at ${z.start.toFixed(2)} s with ${phrasesBetween} phrase(s) since the previous one (minimum two)`);
    });
  }
  return { failures, warnings };
}
