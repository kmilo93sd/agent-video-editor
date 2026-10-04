/**
 * Ejemplo de generador de un tutorial. Se copia al proyecto como gen-video.mjs y se cambia lo que está en
 * «lo propio de este video»: PASOS, MONTAJE, ZOOMS, GRAFICOS y los textos de la piel. El resto es el motor.
 *
 *   node gen-video.mjs
 *
 * Lee: capitulos.mjs (guion), assets/voz/capNN.{mp3,json} + volumenes.json + duraciones.json (de gen-voz.mjs),
 *      assets/clips/NN-*.mp4 con su NN-*.marcas.txt (de grabar.mjs, ya pasados a H.264).
 * Escribe, solo si no se rompe ninguna regla: compositions/capNN.html, compositions/capNN.motion.json,
 *      index.html y datos/montaje.json.
 * Requiere estilos.css con las clases que usa (placa, ancla, cam, grafico, fila) en la piel de frame.md.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { caps, idCap } from "./capitulos.mjs";
import { construir, revisar, lectorDeMarcas, cargarAlineacion, tPalabra, htmlFrase, t1, f3, r3, esc, REGLAS } from "./montaje-base.mjs";

const RAIZ = import.meta.dirname;
const W = 1920, H = 1080, FPS = 30;
const PLACA = 3.0;
const DIR_VOZ = join(RAIZ, "assets/voz");
const DIR_CLIPS = join(RAIZ, "assets/clips");
const DUR = JSON.parse(readFileSync(join(DIR_VOZ, "duraciones.json"), "utf8"));
const VOL = JSON.parse(readFileSync(join(DIR_VOZ, "volumenes.json"), "utf8"));

const ARCHIVOS = Object.fromEntries(readdirSync(DIR_CLIPS).filter((f) => f.endsWith(".mp4")).map((f) => [f.slice(0, 2), f]));
const archivoClip = (clip) => { const f = ARCHIVOS[clip]; if (!f) throw new Error(`No existe el clip ${clip}.mp4 en ${DIR_CLIPS}`); return f; };
const lectores = {};
const m = (clip, fragmento) => (lectores[clip] ??= lectorDeMarcas(join(DIR_CLIPS, archivoClip(clip).replace(/\.mp4$/, ".marcas.txt"))))(fragmento);

// ── lo propio de este video ──────────────────────────────────────────────────────────────────────

const PASOS = [{ cap: "01", titulo: "Cargar la cartola" }];

const MONTAJE = {
  "00": [
    { clip: "09", tramos: [t1(m("09", "informe cerrado") - 1, m("09", "informe cerrado") + 4)],
      frases: [["Este es el informe", m("09", "informe cerrado")], ["Vamos a llegar"]] },
  ],
  "01": [
    { clip: "01", tramos: [t1(m("01", "abre «Bancos»"), m("01", "selector abierto"))],
      frases: [["En Bancos", m("01", "abre «Bancos»")]] },
    { clip: "01", tramos: [t1(m("01", "archivo elegido"), m("01", "tabla cargada"))],
      frases: [["El archivo que baja", m("01", "archivo elegido")]] },
    { grafico: "movimiento", frases: ["Al subirlo"] },
  ],
};

const ZOOMS = {
  "01": [{ desde: "formato", hasta: "tal cual", foco: [62, 40] }],
};

const GRAFICOS = {
  movimiento: {
    filas: [{ que: "Un movimiento", ancla: "Al subirlo" }, { que: "Fecha", ancla: "su fecha" }, { que: "Monto", ancla: "su monto" }],
    html: (g) => `<div class="tarjeta">${g.filas.map((f, k) => `<p class="fila" id="${g.id}-f${k}">${esc(f.que)}</p>`).join("")}</div>`,
  },
};

// ── motor ────────────────────────────────────────────────────────────────────────────────────────

const capitulos = [];
let base = 0;
for (const c of caps) {
  const id = idCap(c.cap);
  const alin = cargarAlineacion(DIR_VOZ, id);
  const paso = PASOS.findIndex((p) => p.cap === c.cap);
  const conPlaca = paso >= 0;
  const r = construir(MONTAJE[c.cap], {
    alin, durVoz: DUR[id], conPlaca, placa: PLACA,
    fuenteDe: (clip) => join(DIR_CLIPS, archivoClip(clip)),
    srcDe: (clip) => `assets/clips/${archivoClip(clip)}`,
    dirCongelados: join(RAIZ, "assets/congelados"),
    srcCongelado: (ruta) => relative(RAIZ, ruta).replaceAll("\\", "/"),
  });
  capitulos.push({ cap: c.cap, id, titulo: c.titulo, paso, conPlaca, alin, base: r3(base), ...r });
  base += r.fin;
}
const TOTAL = r3(base);
let n = 0;
for (const ch of capitulos) for (const p of ch.planos) p.id = `p${String(++n).padStart(2, "0")}`;

for (const ch of capitulos) {
  ch.zooms = (ZOOMS[ch.cap] ?? []).map((z) => {
    const ini = tPalabra(ch.alin, ch.frases, z.desde) - 0.3;
    const salida = Math.max(tPalabra(ch.alin, ch.frases, z.hasta, true), ini + REGLAS.zoomEntraMin + 0.3);
    const plano = ch.planos.find((p) => p.tipo === "clip" && ini >= p.inicio - 1e-6 && ini < p.fin) ?? ch.planos[0];
    return { ...z, escala: REGLAS.zoomMax, entra: 1.6, sale: REGLAS.zoomSale, ini, salida, fin: salida + REGLAS.zoomSale, plano };
  });
  for (const g of ch.planos.filter((p) => p.tipo === "grafico")) {
    const def = GRAFICOS[g.grafico];
    g.palabra = tPalabra(ch.alin, ch.frases, g.frases[0].ancla);
    g.entradas = def.filas.map((f, k) => ({ que: f.que, sel: `#${g.id}-f${k}`, en: tPalabra(ch.alin, ch.frases, f.ancla) - 0.1, tPalabra: tPalabra(ch.alin, ch.frases, f.ancla) }));
  }
}

const { fallas, avisos } = revisar(capitulos);
for (const a of avisos) console.log(`aviso: ${a}`);
if (fallas.length) {
  console.error(`\n${fallas.length} regla(s) rotas; no se escribió nada:\n  - ${fallas.join("\n  - ")}`);
  process.exit(1);
}

function emitir(ch) {
  const cuerpo = [];
  const motion = [];
  const asertos = [];
  if (ch.conPlaca) {
    cuerpo.push(`<section class="clip placa" id="placa-${ch.cap}" data-start="0" data-duration="${f3(PLACA)}" data-track-index="4"><div class="placa-cuerpo"><p>Paso ${ch.paso + 1} de ${PASOS.length}</p><h2>${esc(ch.titulo)}</h2></div></section>`);
    motion.push(`tl.fromTo("#placa-${ch.cap} .placa-cuerpo", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, 0.1);`);
    cuerpo.push(`<div class="clip ancla" id="ancla-${ch.cap}" style="z-index:500" data-start="${f3(PLACA)}" data-duration="${f3(ch.fin - PLACA)}" data-track-index="5"><span>${ch.paso + 1} · ${esc(ch.titulo)}</span></div>`);
  }
  ch.planos.forEach((p, i) => {
    if (p.tipo === "grafico") {
      const def = GRAFICOS[p.grafico];
      cuerpo.push(`<section class="clip grafico" id="${p.id}" style="z-index:${10 + i}" data-start="${f3(p.inicio)}" data-duration="${f3(p.fin - p.inicio)}" data-track-index="3">${def.html({ ...def, id: p.id })}</section>`);
      for (const e of p.entradas) {
        motion.push(`tl.fromTo("${e.sel}", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, ${f3(e.en)});`);
        asertos.push({ kind: "appearsBy", selector: e.sel, bySec: r3(e.en + 0.4) });
      }
      p.entradas.slice(1).forEach((e, k) => asertos.push({ kind: "before", a: p.entradas[k].sel, b: e.sel }));
      return;
    }
    const piezas = p.piezas.map((x, k) => x.tipo === "video"
      ? `<video id="${p.id}v${k}" class="clip media" src="${p.src}" data-start="${f3(x.inicio)}" data-duration="${f3(x.dur)}" data-media-start="${f3(x.desde)}"${x.vel !== 1 ? ` data-playback-rate="${x.vel}"` : ""} data-track-index="1" data-hf-media-start-basis="local" muted playsinline></video>`
      : `<img id="${p.id}f${k}" class="clip media" src="${x.src}" data-start="${f3(x.inicio)}" data-duration="${f3(x.dur)}" data-track-index="2" data-hf-media-start-basis="local" alt="" />`).join("\n        ");
    cuerpo.push(`<div class="cam" id="${p.id}" style="z-index:${10 + i}">\n        ${piezas}\n      </div>`);
    for (const z of ch.zooms.filter((zz) => zz.plano === p)) {
      motion.push(`tl.set("#${p.id}", { transformOrigin: "${z.foco[0]}% ${z.foco[1]}%" }, ${f3(z.ini)});`);
      motion.push(`tl.fromTo("#${p.id}", { scale: 1 }, { scale: ${z.escala}, duration: ${z.entra}, ease: "sine.inOut", immediateRender: false }, ${f3(z.ini)});`);
      motion.push(`tl.to("#${p.id}", { scale: 1, duration: ${z.sale}, ease: "sine.inOut" }, ${f3(z.salida)});`);
    }
  });
  ch.frases.forEach((f, k) => cuerpo.push(htmlFrase({ id: `voz-${ch.cap}-${String(k + 1).padStart(2, "0")}`, src: `assets/voz/${ch.id}.mp3`, frase: f, track: 20 + capitulos.indexOf(ch), volumen: VOL[ch.id] ?? 1 })));

  const cid = `cap${ch.cap}`;
  const html = `<!doctype html>
<html lang="es">
  <head><meta charset="UTF-8" /><title>${esc(ch.titulo)}</title></head>
  <body>
    <template id="${cid}-template">
      <div id="root" data-composition-id="${cid}" data-start="0" data-width="${W}" data-height="${H}" data-duration="${f3(ch.fin)}">
      ${cuerpo.join("\n      ")}
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
  return { html, motionJson: asertos.length ? { duration: ch.fin, assertions: asertos } : null };
}

mkdirSync(join(RAIZ, "compositions"), { recursive: true });
mkdirSync(join(RAIZ, "datos"), { recursive: true });
const hosts = [];
for (const ch of capitulos) {
  const { html, motionJson } = emitir(ch);
  writeFileSync(join(RAIZ, `compositions/cap${ch.cap}.html`), html, "utf8");
  if (motionJson) writeFileSync(join(RAIZ, `compositions/cap${ch.cap}.motion.json`), JSON.stringify(motionJson, null, 2) + "\n");
  hosts.push(`<div id="cap${ch.cap}" data-composition-id="cap${ch.cap}" data-composition-src="compositions/cap${ch.cap}.html" data-start="${f3(ch.base)}" data-duration="${f3(ch.fin)}" data-track-index="1" data-width="${W}" data-height="${H}"></div>`);
}
writeFileSync(join(RAIZ, "index.html"), `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <link rel="stylesheet" href="estilos.css" />
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
writeFileSync(join(RAIZ, "datos/montaje.json"), JSON.stringify({
  total: TOTAL,
  capitulos: capitulos.map((ch) => ({
    cap: ch.cap, titulo: ch.titulo, inicio: ch.base, fin: r3(ch.base + ch.fin), timestamp: mmss(ch.base),
    frases: ch.frases.map((f) => ({ inicio: r3(ch.base + f.inicio), dur: f.dur, texto: f.texto })),
    planos: ch.planos.map((p) => ({
      id: p.id, inicio: r3(ch.base + p.inicio), fin: r3(ch.base + p.fin),
      ...(p.tipo === "grafico"
        ? { grafico: p.grafico, primerContenido: r3(ch.base + Math.min(...p.entradas.map((e) => e.en))) }
        : { clip: p.clip, fuente: p.fuente.map(r3), velocidades: p.velocidades,
            congelado: r3(p.piezas.filter((x) => x.tipo === "cuadro").reduce((s, x) => s + x.dur, 0)) }),
    })),
  })),
}, null, 2) + "\n");

console.log(`Video: ${mmss(TOTAL)} (${TOTAL} s) · ${capitulos.reduce((s, c) => s + c.planos.length, 0)} planos · ${capitulos.reduce((s, c) => s + c.frases.length, 0)} frases`);
console.log("Capítulos para la descripción:");
for (const ch of capitulos) console.log(`  ${mmss(ch.base)} ${ch.titulo}`);
