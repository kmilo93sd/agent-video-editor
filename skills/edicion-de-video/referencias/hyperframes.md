# Edición con HyperFrames

Esta skill decide **qué** se hace y con qué números. Las skills de HyperFrames deciden **cómo** se escribe en
su contrato. Si algo de aquí choca con una de ellas, gana la de HyperFrames en lo mecánico (atributos,
determinismo, CLI) y esta en lo editorial (ritmo, velocidad, cuándo un gráfico). Avísalo en la entrega.

## Contenido

- [1. Qué skill de HyperFrames usar en cada paso](#1-qué-skill-de-hyperframes-usar-en-cada-paso)
- [2. Cómo se escribe cada regla editorial en el contrato](#2-cómo-se-escribe-cada-regla-editorial-en-el-contrato)
- [3. El patrón del generador](#3-el-patrón-del-generador)
- [4. Tropiezos ya vividos](#4-tropiezos-ya-vividos)
- [5. Ciclo de revisión con `npx hyperframes`](#5-ciclo-de-revisión-con-npx-hyperframes)
- [Fuentes](#fuentes)

## 1. Qué skill de HyperFrames usar en cada paso

Orden de carga en un proyecto nuevo o retomado:

| Paso | Skill | Para qué |
|---|---|---|
| 0. Entrada | `hyperframes` | Siempre primero. Corre `npx hyperframes usage --json`. Lee el estado del proyecto. Si hay `BRIEF.md`, ejecuta su `workflow`; si no, corre la entrevista y escribe el brief. Un tutorial largo y narrado cae en `general-video` |
| 0b. Instalar el flujo | `npx hyperframes skills update general-video` | Antes de leer el flujo. Si falla, mostrar el error; no seguir de memoria |
| 0c. Proyecto | `npx hyperframes init "videos/<proyecto>" --non-interactive --example=blank --skill=general-video` | Crea la carpeta, `hyperframes.json` y `package.json` con la versión fijada. Agregar `"media": { "autoProxy": true }` |
| 1. Flujo | `general-video` | Dueño del entregable de punta a punta: plan, storyboard, construcción, revisión |
| 2. Contrato | `hyperframes-core` | **Antes de escribir HTML**: `data-start`, `data-duration`, `data-media-start`, tracks, sub-composiciones, determinismo. Recetas copiables en `references/creator-editing-recipes.md` |
| 3. Dirección | `hyperframes-creative` | `frame.md` / `design.md` (piel de marca), narración, plan de beats |
| 4. Medios | `media-use` | Resolver BGM, SFX, imágenes e íconos; transcribir. TTS solo si el brief no fija una voz de marca |
| 5. Movimiento | `hyperframes-animation` | Reglas de animación, blueprints, transiciones; `scripts/animation-map.mjs` para revisar la coreografía |
| 5b. Cámara | `hyperframes-keyframes` | Zoom, punch-in, reencuadre: siempre sobre un wrapper interno |
| 6. Bloques | `hyperframes-registry` | **Antes de dibujar a mano** algo con nombre (gráfico, ventana de terminal, transición): `npx hyperframes catalog --query "<en inglés>" --json` |
| 7. Mezcla | `hyperframes-audio` | Fundidos, carve de la música contra la voz (`scripts/carve.mjs`), automatización, buses |
| 8. Revisión y render | `hyperframes-cli` | `lint`, `check`, `snapshot`, `preview`, `render` |
| 9. Ajustes con la persona | `hyperframes-studio` | Preguntas o notas sobre un corte ya armado (§ 0); orden de pistas y zonas seguras |

Para pedidos que cruzan dominios, la tabla «Creator request» de `hyperframes/SKILL.md` § 5 dice qué cargar
junto. Ejemplos:

- un corte: `general-video` + `core`;
- un zoom: `+ keyframes`;
- un fundido o ducking: `+ audio`.

### Qué pide `general-video` y qué lo cubre aquí

En un tutorial el generador reemplaza el paso de construir escena por escena con subagentes (los
«frame workers»). Los artefactos que el flujo espera se producen así:

| `general-video` espera | En un tutorial con generador |
|---|---|
| `STORYBOARD.md` con un bloque `## Frame N` por escena (`status`, `src:`, cita de blueprint o reglas, beat), incluso con `storyboard: no` | Un bloque por capítulo, con `src: compositions/capNN.html`. La cita de reglas apunta a `ritmo-y-cortes.md` y, para placas y gráficos, a las reglas de `hyperframes-animation` que usan. El beat es el resumen del `GUION.md` |
| Paquetes por escena y subagentes que escriben `compositions/<frame>.html` | El generador escribe todas las composiciones. No se despachan workers |
| `compositions/<frame>.motion.json` | El generador escribe uno por capítulo con gráficos: `appearsBy` por fila y `before` entre filas. `check` los verifica |
| `audio_meta.json` del motor de audio de `media-use` | Lo reemplazan `gen-voz.mjs` (voz de marca con alineación) y `catalogo.json` de la biblioteca. Si se usan BGM o SFX de `media-use resolve`, ese registro sigue valiendo |
| Revisión con `animation-map.mjs` | Se corre igual sobre las composiciones generadas |
| Compuertas de storyboard, vista previa final y aprobación del render | Igual. El generador no las salta |

## 2. Cómo se escribe cada regla editorial en el contrato

| Regla editorial | En HyperFrames |
|---|---|
| **Cortar y recortar un clip** | Una pieza `<video>` por tramo, con `data-start` (tiempo de la composición), `data-duration` y `data-media-start` (segundo del archivo). Un salto hacia adelante en el clip es otra pieza. Recetas «Hard cut», «Trim in/out» y «Split / splice» |
| **Tiempos dentro de un capítulo** | Cada capítulo es una sub-composición, y sus `data-start` son locales a ella. Marca cada `<video>`, `<img>` y `<audio>` con `data-hf-media-start-basis="local"`: sin eso, `lint` avisa `nested_media_start_basis_ambiguous` |
| **Sin retrocesos** | Dentro de un capítulo, el `data-media-start` de cada pieza de un clip es ≥ al final de la anterior, y no se vuelve a un clip ya dejado. Lo verifica el generador, no el CLI |
| **Velocidad** | `data-playback-rate` constante por pieza: `1` en navegación, clics y resultados; **≤ 1,5** solo en tipeo. Nunca un carril `rate` para apurar una espera: la espera se corta. `fuente consumida = data-duration × rate` |
| **Congelar el resultado** | Un `<img class="clip">` con el cuadro extraído **en PNG** del segundo exacto en que va el clip (receta «Freeze / hold»; un congelado a mitad del archivo se preprocesa). En PNG, para que no se note un salto de compresión entre el video y el cuadro fijo |
| **Voz por frase sobre un mismo mp3** | Un `<audio>` por frase, todas con el **mismo `src`**: `data-media-start` = inicio de la frase en el mp3, `data-duration` = su largo, `data-start` = cuando pasa lo que dice, `data-volume` = ganancia del capítulo, `data-audio-group="voz"`. Sin re-encodear. Todo `<audio>` lleva `id`: sin `id` el mezclador lo ignora y el render sale mudo |
| **Zoom lento al dato** | Se anima el **wrapper del plano** (`<div class="cam" id="p07">`, que envuelve sus piezas), **nunca el `.clip`** y **nunca la clase** (`.cam` haría zoom a todos los planos). El wrapper no lleva `data-start`: `lint` rechaza un video dentro de un elemento con tiempo (`video_nested_in_timed_element`). `tl.set("#p07", {transformOrigin:"62% 40%"}, t)`, `tl.fromTo("#p07", {scale:1}, {scale:1.10, duration:1.6, ease:"sine.inOut", immediateRender:false}, t)`, y vuelta a 1 en 0,9 s |
| **Placa y gráficos que entran** | Tweens sobre elementos internos de la sección `.clip` (`fromTo` de `y` y `opacity`). La visibilidad del `.clip` la maneja el framework, no un tween |
| **Fundido o disolvencia** | Dos clips en pistas distintas que se traslapan, con envolventes opuestas de `opacity` en sus wrappers y de `volume` en `data-automation` (receta «Crossfade»). En un tutorial casi no se usa: corte seco dentro del paso |
| **Nivel de cada pista** | `data-volume` = nivel fijo de la pista. Para cambios en el tiempo, un carril `volume` en `data-automation`. **Nunca** carril y tween de volumen en la misma pista |
| **Música bajo la voz** | **Carve con el script**, no escribiendo atributos: `node <hyperframes-audio>/scripts/carve.mjs --comp compositions/capNN.html --bed <id de la cama>`. El atributo `data-fx-carve` solo guarda la configuración; lo que suena es el `data-fx-chain` y los carriles que escribe el script. Requisitos: `ffmpeg` y `npm i -D @hyperframes/core` en el proyecto. La cama y las frases tienen que estar **en el mismo archivo**, porque el script analiza uno. `--bed` es necesario porque `musica-*.mp3` no tiene un nombre que el detector reconozca. No ajustes `data-volume` de la cama a mano después: el carve escribe su propia ganancia. Confirmar con `check` |
| **Efectos de sonido** | Con `media-use resolve --type sfx`, o copiados desde `biblioteca/` a `assets/sfx/` del proyecto. Cada uno es un `<audio>` con `id`, `data-start` en el evento (2–4 cuadros antes), `data-volume` calculado (`audio-y-sfx.md`) y `data-audio-group="sfx"`, nunca en el grupo de voz |
| **Zonas seguras** | Contenido en el 90 % (action-safe) y texto en el 80 % (title-safe), los márgenes de `hyperframes-studio` § 4 |

### Pistas (`data-track-index`)

Un tipo de elemento por pista, para que el timeline se lea en Studio (`hyperframes-studio`):

| Pista | Qué va |
|---|---|
| 1 | piezas de video del producto |
| 2 | cuadros congelados |
| 3 | gráficos |
| 4 | placas de capítulo |
| 5 | ancla de borde |
| 6 | rótulos |
| 10–19 | efectos de sonido |
| 20 + n | voz del capítulo n (una pista por capítulo; si no, `lint` cree que las voces de dos capítulos se pisan) |
| 40 | música |

## 3. El patrón del generador

Un tutorial de varios minutos no se escribe a mano: se **genera** el HTML desde datos, para poder regrabar un
clip o regenerar una frase sin rehacer el montaje.

```
capitulos.mjs (guion: lo que se lee, con anclas)
   └─ gen-voz.mjs ─────→ assets/voz/capNN.mp3 + capNN.json (alineación) + volumenes.json + duraciones.json
grabar.mjs (Playwright)
   └─────────────────→ assets/clips/NN-*.webm → NN-*.mp4 (H.264) + NN-*.marcas.txt
gen-video.mjs + montaje-base.mjs
   └─────────────────→ compositions/capNN.html + capNN.motion.json + index.html + datos/montaje.json
                        (falla y no escribe nada si se rompe una regla)
```

**Plantillas** (se copian a la raíz del proyecto):

- `plantillas/gen-video.ejemplo.mjs`: generador completo y probado, con `lint` y `check` limpios sobre datos
  sintéticos. Se cambia solo la sección «lo propio de este video»: `PASOS`, `MONTAJE`, `ZOOMS`, `GRAFICOS`.
- `plantillas/montaje-base.mjs`: el motor. `construir()` pone pantalla y voz en el reloj del capítulo,
  `revisar()` aplica las reglas, y además `lectorDeMarcas`, `cortarFrases`, `tPalabra`, `cuadroFijo` y
  `htmlFrase`. El esquema de entrada y salida está documentado en el comentario de cada función.
- `plantillas/grabar.ejemplo.mjs`: Playwright a 1920×1080, con las marcas medidas desde la creación de la
  página y el paso a H.264 con GOP corto.

**Cómo se describe un capítulo** (`MONTAJE`):

```js
"01": [
  { clip: "01", tramos: [t1(m("01", "abre «Bancos»"), m("01", "selector abierto"))],
    frases: [["En Bancos", m("01", "abre «Bancos»")]] },
  { clip: "01", tramos: [t1(m("01", "archivo elegido"), m("01", "tabla cargada"), 1.5)],
    frases: [["El archivo que baja", m("01", "archivo elegido")]] },
  { grafico: "movimiento", frases: ["Al subirlo"] },
],
```

- `m(clip, texto)`: el segundo de la marca del clip que contiene ese texto. Falla si calza con cero o con
  más de una línea.
- `t1(desde, hasta, vel)`: un tramo contiguo del clip. Varios tramos de un segmento tienen que ser contiguos;
  un salto hacia adelante es otro segmento (un corte).
- Una frase con segundo entra cuando el clip llega ahí. Si la anterior sigue sonando, el clip se congela
  hasta que termine. Una frase sin segundo va seguida de la anterior.
- `corto: true` permite un plano de menos de 5 s; `esperarVoz: false` deja que la frase siga sonando sobre
  el plano siguiente.
- Un gráfico declara sus filas con el ancla de cada una. El generador calcula cuándo entra cada fila, se lo
  pasa a `revisar()` y escribe el `.motion.json`.

**Qué recibe `revisar()`**: `[{ cap, planos, frases, zooms }]`.

- Planos de clip: `{ id, tipo: "clip", clip, fuente: [desde, hasta], inicio, fin, corto, velocidades,
  congelados: [{ segundo, esperado }] }`. Es lo que devuelve `construir()`, más el `id`.
- Gráficos: `{ id, tipo: "grafico", inicio, fin, palabra, entradas: [{ que, en, tPalabra }] }`.
- Zooms: `{ escala, entra, ini, fin, plano }`.
- Frases: las de `construir()`; `silencioJustificado: true` deja pasar un hueco largo antes de esa frase.

**Comprobaciones** (si alguna falla, sale con error y no escribe nada):

| Comprobación | Umbral por defecto (`REGLAS`) |
|---|---|
| Sin retrocesos ni vuelta a un clip anterior | 0 s repetidos |
| Plano mínimo | 5 s (salvo `corto`) |
| Velocidad máxima de un tramo | ×1,5 |
| Aire entre frases | ≥ 0,4 s |
| Silencio sin voz | aviso > 3 s; falla > 6 s salvo `silencioJustificado` |
| Gráfico antes de su palabra | ≤ 0,5 s (y no después de 0,6 s) |
| Gráfico sin contenido | ≤ 1 s |
| Elemento anclado a su palabra | ≤ 0,6 s de distancia |
| Zoom | ≤ 1,10, ≥ 1,5 s para entrar, al menos dos frases desde el zoom anterior, cabe entero en su plano |
| Congelado del segundo correcto | ≤ 0,1 s de diferencia con el segundo del clip |
| Ancla única, presente y en orden | `gen-voz.mjs` antes de pagar la síntesis, y `cortarFrases` |

`datos/montaje.json` guarda los tiempos globales de cada capítulo (con su `timestamp` para la descripción),
de cada frase y de cada plano. También el `congelado` de cada plano y el `primerContenido` de cada gráfico:
son los segundos que hay que mirar en la revisión.

## 4. Tropiezos ya vividos

- **Congelado del segundo equivocado.** Si el cuadro fijo sale de antes de que termine una animación (un modal
  abriéndose), el modal parece abrirse y cerrarse. `cuadroFijo` extrae en `t - 0,04 s` del segundo en que va
  el clip, y cerca del final del archivo usa `-sseof`. `revisar()` compara el segundo.
- **Windows: Chromium y Playwright se corren con `node`, no con `bun`.** La versión de `playwright` tiene que
  calzar con el Chromium instalado en la carpeta `ms-playwright` del caché de Playwright. Si no, `npx playwright install chromium`.
- **Clips de Playwright (`.webm` VP8/VP9).** No se montan directo: `autoProxy` solo hace una copia si
  Chrome dice que no puede reproducir el formato, y con VP9 suele decir que sí; la vista previa se traba al
  buscar. `grabar.mjs` deja un `.mp4` H.264 con GOP de 15 cuadros, y el montaje usa ese. Renderizar con
  `--video-frame-format png`, como recomienda el CLI para grabaciones de pantalla.
- **La voz se regenera solo por capítulo** (`node gen-voz.mjs 05 --rehacer`) y se mide en LUFS. Nunca se
  re-codifica el mp3: corre la alineación.
- **El informe de `loudnorm` sale por stderr.** Leer stdout da vacío y la medición se pierde sin error.
- **Un ancla repetida en el capítulo** hace que el visual entre en la ocurrencia equivocada. Las anclas
  tienen que ser únicas; si no, se alargan.
- **Un `<audio>` sin `id`** no lo toma el mezclador: el render sale mudo. `lint` lo marca como
  `media_missing_id`.
- **Un `stagger` parejo en las filas de un gráfico** adelanta filas que la voz todavía no nombra. Cada fila se
  ancla a su palabra.
- **El ancla de borde queda tapada por el video** si no tiene `z-index` sobre los planos: `check` lo marca
  como `text_occluded`.

## 5. Ciclo de revisión con `npx hyperframes`

Usa la versión fijada en el `package.json` del proyecto, y revisa una vez si está atrasada
(`hyperframes/SKILL.md`, «Keep the project's CLI current»).

1. `node gen-video.mjs`: tiene que terminar sin reglas rotas.
2. `npx hyperframes lint` mientras iteras.
3. `npx hyperframes check` como compuerta final. **No encadenes `lint` antes**: `check` lo incluye. En la
   primera pasada completa, agrega `--snapshots`.
4. **Snapshots cada 0,5 s en cada gráfico**, con los tiempos de `datos/montaje.json`:

   ```bash
   npx hyperframes snapshot --at 258.0,258.5,259.0,259.5,260.0 --no-end --describe false -o tmp/snap-p13
   ```

   - `--no-end` evita que agregue el cuadro final.
   - `--describe false` evita que llame a Gemini, que cobra, y corre por defecto si `GEMINI_API_KEY` está en
     el entorno.
   - `-o` saca las imágenes del proyecto: `snapshots/` mezcla corridas viejas con las de `check`.
5. **Hoja de contacto** por grupo (`checklist-de-revision.md`). Una imagen por grupo y por fase, no una por
   cuadro: cada imagen adjunta encarece el contexto **[hyperframes/production-loop]**.
6. `npx hyperframes preview --background`: entregar la URL a la persona y preguntar si revisa o se renderiza.
7. **Render solo con aprobación**, y con `--video-frame-format png`:
   - `--quality draft` mientras se itera;
   - `looks` para el primer render real;
   - `delivery` para la entrega.
   Después, el master de loudness sobre el archivo (`audio-y-sfx.md`), y `ffprobe` para confirmar que la
   duración coincide con el `data-duration` raíz.

## Fuentes

- `~/.claude/skills/hyperframes/SKILL.md` (§ 1 estado, § 2 rutas, § 5 skills por necesidad) y `references/production-loop.md`.
- `~/.claude/skills/general-video/SKILL.md` (plan, `STORYBOARD.md`, workers, `.motion.json`).
- `~/.claude/skills/hyperframes-core/references/creator-editing-recipes.md` y `variables-and-media.md`.
- `~/.claude/skills/hyperframes-audio/SKILL.md` («Voiceover carve», «One bus for many tracks»).
- `~/.claude/skills/hyperframes-cli/SKILL.md` y `references/lint-validate-inspect.md`; `npx hyperframes snapshot --help` y `render --help` (0.8.123).
- `~/.claude/skills/hyperframes-studio/SKILL.md` § 4.
