import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

export const REGLAS = {
  respiro: 0.6,
  aireMin: 0.4,
  silencioAviso: 3,
  silencioMax: 6,
  planoMin: 5,
  velMax: 1.5,
  colaPlano: 1.0,
  colaGrafico: 1.2,
  entraGrafico: 0.4,
  graficoAntesMax: 0.5,
  graficoVacioMax: 1.0,
  toleranciaAncla: 0.6,
  zoomMax: 1.10,
  zoomEntraMin: 1.5,
  zoomSale: 0.9,
  fps: 30,
};

export const r3 = (x) => Math.round(x * 1000) / 1000;
export const f3 = (x) => r3(x).toFixed(3);
export const t1 = (desde, hasta, vel = 1) => ({ desde, hasta, vel });
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export function duracionMedia(archivo) {
  const s = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", archivo], { encoding: "utf8" }).trim();
  const n = Number(s);
  if (!Number.isFinite(n)) throw new Error(`ffprobe no dio la duración de ${archivo} (devolvió «${s}»); remuxea el archivo`);
  return n;
}

export function lectorDeMarcas(rutaMarcas) {
  const lineas = readFileSync(rutaMarcas, "utf8").split(/\r?\n/)
    .map((l) => l.match(/^\s*([\d.]+)s\s+(.*)$/)).filter(Boolean)
    .map(([, s, texto]) => ({ s: Number(s), texto: texto.trim() }));
  return (fragmento) => {
    const exactas = lineas.filter((x) => x.texto === fragmento);
    const hits = exactas.length ? exactas : lineas.filter((x) => x.texto.includes(fragmento));
    if (hits.length !== 1) throw new Error(`La marca "${fragmento}" calza con ${hits.length} líneas de ${rutaMarcas}`);
    return hits[0].s;
  };
}

export function cargarAlineacion(dirVoz, id) {
  return JSON.parse(readFileSync(join(dirVoz, `${id}.json`), "utf8"));
}

export function indiceAncla(alin, ancla, etiqueta = "") {
  const i = alin.texto.indexOf(ancla);
  if (i < 0) throw new Error(`${etiqueta}el ancla "${ancla}" no aparece en la voz`);
  if (alin.texto.indexOf(ancla, i + 1) >= 0) throw new Error(`${etiqueta}el ancla "${ancla}" aparece dos veces; alárgala`);
  return i;
}

export function cortarFrases(alin, anclas, durTotal, etiqueta = "") {
  const { texto, inicios } = alin;
  const idx = anclas.map((a) => indiceAncla(alin, a, etiqueta));
  if (idx[0] !== 0) throw new Error(`${etiqueta}la primera frase tiene que empezar al comienzo del texto`);
  idx.forEach((v, k) => { if (k && v <= idx[k - 1]) throw new Error(`${etiqueta}la frase "${anclas[k]}" está fuera de orden`); });
  return idx.map((i0, k) => {
    const i1 = k + 1 < idx.length ? idx[k + 1] : texto.length;
    let ult = i1 - 1;
    while (ult > i0 && /\s/.test(texto[ult])) ult--;
    const ms = Math.max(0, inicios[i0] - 0.06);
    const me = k + 1 < idx.length ? Math.min(inicios[idx[k + 1]] - 0.03, inicios[ult] + 0.25) : durTotal;
    if (me - ms < 0.3) throw new Error(`${etiqueta}la frase "${anclas[k]}" quedó de ${(me - ms).toFixed(2)} s`);
    return { ancla: anclas[k], i0, i1, ms: r3(ms), dur: r3(me - ms), texto: texto.slice(i0, i1).trim() };
  });
}

export function tPalabra(alin, frases, ancla, alFinal = false) {
  let i = indiceAncla(alin, ancla);
  if (alFinal) i += ancla.length - 1;
  const f = frases.find((x) => i >= x.i0 && i < x.i1);
  if (!f || f.inicio == null) throw new Error(`"${ancla}" no cae en ninguna frase ubicada`);
  const t = f.inicio + (alin.inicios[i] - f.ms) + (alFinal ? 0.15 : 0);
  return Math.min(Math.max(t, f.inicio), f.inicio + f.dur);
}

export function htmlFrase({ id, src, frase, track, volumen = 1, grupo = "voz" }) {
  return `<audio id="${id}" class="clip" src="${src}" data-start="${f3(frase.inicio)}" data-duration="${f3(frase.dur)}" data-media-start="${f3(frase.ms)}" data-track-index="${track}" data-hf-media-start-basis="local" data-volume="${volumen.toFixed(3)}" data-audio-group="${grupo}"></audio>`;
}

export function cuadroFijo({ fuente, t, dirSalida, prefijo }) {
  const dur = duracionMedia(fuente);
  const tt = Math.max(0, Math.min(t, dur) - 0.04);
  mkdirSync(dirSalida, { recursive: true });
  const ruta = join(dirSalida, `${prefijo}-${Math.round(tt * 1000)}.png`);
  if (!existsSync(ruta) || statSync(ruta).mtimeMs < statSync(fuente).mtimeMs) {
    const a = dur - tt < 0.2
      ? ["-v", "error", "-y", "-sseof", "-0.12", "-i", fuente, "-frames:v", "1", ruta]
      : ["-v", "error", "-y", "-ss", tt.toFixed(3), "-i", fuente, "-frames:v", "1", ruta];
    execFileSync("ffmpeg", a);
    if (!existsSync(ruta)) throw new Error(`ffmpeg no sacó el cuadro ${tt.toFixed(2)} s de ${fuente}`);
  }
  return { ruta, segundo: r3(tt + 0.04) };
}

/**
 * Pone pantalla y voz en el reloj de un capítulo.
 *
 * segmentos, en el orden en que se ven:
 *   { clip, tramos: [t1(desde, hasta, vel?)], frases: [["ancla", segundoDelClip] | ["ancla"]], corto?, esperarVoz? }
 *   { grafico: "nombre", frases: ["ancla", ...] }
 * ctx: { alin, durVoz, conPlaca, placa, fuenteDe(clip) -> ruta del archivo, srcDe(clip) -> src en el HTML,
 *        dirCongelados, srcCongelado(ruta) -> src en el HTML, reglas? }
 *
 * Devuelve { planos, frases, fin }. Cada plano de clip trae lo que revisar() necesita:
 *   { tipo: "clip", clip, fuente: [desde, hasta], inicio, fin, corto, velocidades, congelados: [{ segundo, esperado }],
 *     piezas: [{ tipo: "video", inicio, dur, desde, vel } | { tipo: "cuadro", inicio, dur, src }] }
 * y cada gráfico: { tipo: "grafico", grafico, inicio, fin, frases }. A los gráficos el emisor les agrega
 * palabra (cuándo suena su primera ancla) y entradas [{ que, en, tPalabra }] antes de revisar().
 */
export function construir(segmentos, ctx) {
  const R = { ...REGLAS, ...(ctx.reglas ?? {}) };
  const anclas = segmentos.flatMap((s) => (s.frases ?? []).map((f) => (Array.isArray(f) ? f[0] : f)));
  const frases = cortarFrases(ctx.alin, anclas, ctx.durVoz);
  let fi = 0;
  let T = ctx.conPlaca ? ctx.placa : 0;
  let libre = T + (ctx.conPlaca ? R.respiro : 0);
  const planos = [];
  const ponerFrase = (inicio) => {
    const f = frases[fi++];
    f.inicio = r3(inicio);
    libre = f.inicio + f.dur + R.aireMin;
    return f;
  };

  segmentos.forEach((seg, si) => {
    const sigEsGrafico = !!segmentos[si + 1]?.grafico;
    if (seg.grafico) {
      const inicio = Math.max(T, libre - R.entraGrafico);
      const mias = seg.frases.map((_, k) => ponerFrase(k === 0 ? inicio + R.entraGrafico : libre));
      const fin = libre - R.aireMin + R.colaGrafico;
      planos.push({ ...seg, tipo: "grafico", inicio: r3(inicio), fin: r3(fin), frases: mias });
      T = fin;
      return;
    }
    for (let k = 1; k < seg.tramos.length; k++) {
      if (Math.abs(seg.tramos[k].desde - seg.tramos[k - 1].hasta) > 1e-6) throw new Error(`segmento ${si + 1}: los tramos no son contiguos; un salto es otro segmento`);
    }
    const fuente = ctx.fuenteDe(seg.clip);
    const p = { ...seg, tipo: "clip", src: ctx.srcDe(seg.clip), inicio: r3(T), piezas: [], congelados: [], frases: [] };
    let cur = seg.tramos[0].desde;
    const fuenteFin = seg.tramos[seg.tramos.length - 1].hasta;
    const tramoEn = (s) => seg.tramos.find((tr) => s >= tr.desde - 1e-9 && s < tr.hasta - 1e-9);
    const avanzar = (hasta) => {
      while (cur < hasta - 1e-6) {
        const tr = tramoEn(cur);
        const fin = Math.min(hasta, tr.hasta);
        const d = (fin - cur) / tr.vel;
        const u = p.piezas[p.piezas.length - 1];
        if (u && u.tipo === "video" && u.vel === tr.vel && Math.abs(u.desde + u.dur * u.vel - cur) < 1e-6) u.dur += d;
        else p.piezas.push({ tipo: "video", inicio: T, dur: d, desde: cur, vel: tr.vel });
        T += d;
        cur = fin;
      }
    };
    const congelar = (d) => {
      if (d < 1 / R.fps) return;
      const c = cuadroFijo({ fuente, t: cur, dirSalida: ctx.dirCongelados, prefijo: String(seg.clip) });
      p.piezas.push({ tipo: "cuadro", inicio: T, dur: d, src: ctx.srcCongelado(c.ruta) });
      p.congelados.push({ segundo: c.segundo, esperado: r3(Math.min(cur, duracionMedia(fuente))) });
      T += d;
    };
    for (const fr of seg.frases ?? []) {
      const [ancla, en] = Array.isArray(fr) ? fr : [fr];
      if (en == null) { p.frases.push(ponerFrase(libre)); continue; }
      if (en < cur - 1e-6) throw new Error(`la frase "${ancla}" cae en ${en} s del clip ${seg.clip}, que ya pasó`);
      if (en > fuenteFin) throw new Error(`la frase "${ancla}" cae después del final del segmento`);
      avanzar(en);
      if (T < libre) congelar(libre - T);
      p.frases.push(ponerFrase(Math.max(T, libre)));
    }
    avanzar(fuenteFin);
    if (seg.esperarVoz !== false && libre - R.aireMin > T - (sigEsGrafico ? 0 : R.colaPlano)) {
      congelar(libre - R.aireMin + (sigEsGrafico ? 0.1 : R.colaPlano) - T);
    }
    p.fin = r3(T);
    for (const x of p.piezas) { x.inicio = r3(x.inicio); x.dur = r3(x.dur); if (x.desde != null) x.desde = r3(x.desde); }
    p.fuente = [seg.tramos[0].desde, fuenteFin];
    p.velocidades = [...new Set(seg.tramos.map((tr) => tr.vel))];
    planos.push(p);
  });

  if (fi !== frases.length) throw new Error(`${frases.length - fi} frases sin ubicar`);
  return { planos, frases, fin: r3(Math.max(T, libre - R.aireMin + 0.3)) };
}

/**
 * Revisa las reglas de montaje. capitulos: [{ cap, planos, frases, zooms? }]
 *   planos: lo que devuelve construir(), con id ("p01") y, en los gráficos, palabra y entradas.
 *   frases[k].silencioJustificado = true deja pasar un hueco largo antes de esa frase.
 *   zooms: [{ escala, entra, sale, ini, fin, plano }] con tiempos del capítulo.
 * Devuelve { fallas, avisos }. Con alguna falla, el generador no escribe nada.
 */
export function revisar(capitulos, reglas = {}) {
  const R = { ...REGLAS, ...reglas };
  const fallas = [];
  const avisos = [];
  for (const ch of capitulos) {
    const tag = `cap ${ch.cap}`;
    const finDe = {};
    const usados = [];
    let ultimo = null;
    for (const p of ch.planos.filter((x) => x.tipo === "clip")) {
      if (p.clip !== ultimo && usados.includes(p.clip)) fallas.push(`${tag} ${p.id}: vuelve al clip ${p.clip} después de haberlo dejado`);
      if (finDe[p.clip] != null && p.fuente[0] < finDe[p.clip] - 1e-6) fallas.push(`${tag} ${p.id}: el clip ${p.clip} retrocede de ${finDe[p.clip].toFixed(2)} s a ${p.fuente[0].toFixed(2)} s`);
      finDe[p.clip] = p.fuente[1];
      if (!usados.includes(p.clip)) usados.push(p.clip);
      ultimo = p.clip;
      const d = p.fin - p.inicio;
      if (!p.corto && d < R.planoMin - 1e-6) fallas.push(`${tag} ${p.id}: plano de ${d.toFixed(2)} s (mínimo ${R.planoMin} s)`);
      for (const v of p.velocidades ?? []) if (v > R.velMax + 1e-9) fallas.push(`${tag} ${p.id}: tramo a ×${v} (máximo ×${R.velMax})`);
      for (const c of p.congelados ?? []) {
        if (Math.abs(c.segundo - c.esperado) > 0.1) fallas.push(`${tag} ${p.id}: el congelado salió del segundo ${c.segundo} y el clip iba en ${c.esperado}`);
      }
    }
    ch.frases.forEach((f, k) => {
      const sig = ch.frases[k + 1];
      if (!sig) return;
      const hueco = sig.inicio - (f.inicio + f.dur);
      if (hueco < R.aireMin - 1e-3) fallas.push(`${tag}: entre "${f.ancla}" y "${sig.ancla}" hay ${hueco.toFixed(2)} s (mínimo ${R.aireMin})`);
      else if (hueco > R.silencioMax && !sig.silencioJustificado) fallas.push(`${tag}: ${hueco.toFixed(1)} s sin voz antes de "${sig.ancla}" (tope ${R.silencioMax} s; si la pantalla muestra una acción que se explica sola, marca silencioJustificado)`);
      else if (hueco > R.silencioAviso && !sig.silencioJustificado) avisos.push(`${tag}: ${hueco.toFixed(1)} s sin voz antes de "${sig.ancla}": mirar que pase algo en pantalla`);
    });
    for (const g of ch.planos.filter((x) => x.tipo === "grafico")) {
      if (!g.entradas?.length) { fallas.push(`${tag} ${g.id}: el gráfico no declara entradas; no se puede revisar`); continue; }
      const primero = Math.min(...g.entradas.map((e) => e.en));
      if (primero - g.inicio > R.graficoVacioMax + 1e-6) fallas.push(`${tag} ${g.id}: el gráfico queda ${(primero - g.inicio).toFixed(2)} s sin contenido`);
      if (g.palabra - g.inicio > R.graficoAntesMax + 1e-6) fallas.push(`${tag} ${g.id}: el gráfico entra ${(g.palabra - g.inicio).toFixed(2)} s antes de su palabra`);
      if (g.inicio - g.palabra > R.toleranciaAncla + 1e-6) fallas.push(`${tag} ${g.id}: el gráfico entra ${(g.inicio - g.palabra).toFixed(2)} s después de su palabra`);
      for (const e of g.entradas) {
        if (Math.abs(e.en - e.tPalabra) > R.toleranciaAncla) fallas.push(`${tag} ${g.id}: «${e.que}» entra a ${(e.en - e.tPalabra).toFixed(2)} s de su palabra`);
      }
    }
    const zooms = ch.zooms ?? [];
    zooms.forEach((z, k) => {
      if (z.escala > R.zoomMax + 1e-9) fallas.push(`${tag}: zoom a ${z.escala} (máximo ${R.zoomMax})`);
      if (z.entra < R.zoomEntraMin - 1e-9) fallas.push(`${tag}: zoom que entra en ${z.entra} s (mínimo ${R.zoomEntraMin} s)`);
      if (z.ini < z.plano.inicio - 1e-6 || z.fin > z.plano.fin - 0.05) fallas.push(`${tag} ${z.plano.id}: el zoom (${z.ini.toFixed(2)}–${z.fin.toFixed(2)}) no cabe en el plano (${z.plano.inicio.toFixed(2)}–${z.plano.fin.toFixed(2)})`);
      const frasesEntre = ch.frases.filter((f) => f.inicio >= (zooms[k - 1]?.ini ?? -Infinity) && f.inicio < z.ini).length;
      if (k > 0 && frasesEntre < 2) fallas.push(`${tag}: zoom en ${z.ini.toFixed(2)} s con ${frasesEntre} frase(s) desde el anterior (mínimo dos)`);
    });
  }
  return { fallas, avisos };
}
