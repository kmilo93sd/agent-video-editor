---
name: edicion-de-video
description: >
  Criterio editorial y proceso para videos de YouTube y redes, con foco en tutoriales de software y videos
  explicativos. Úsala al planificar, guionar, editar o revisar un video para YouTube, Shorts o Reels; al
  montar un tutorial con HyperFrames (grabación de pantalla con Playwright, voz con ElevenLabs, generador
  .mjs); al decidir ritmo, cortes, zoom, gráficos, texto en pantalla, niveles de audio, efectos de sonido,
  miniatura, título o capítulos; o al buscar efectos y música libres de derechos (biblioteca CC0 incluida).
  Es la capa editorial sobre las skills de HyperFrames: no las reemplaza, les dice qué hacer.
---

# Edición de video

Esta skill dice **qué** hacer y con qué números. **Cómo** escribirlo en HyperFrames lo dicen sus skills
(`hyperframes` como entrada, `hyperframes-core`, `media-use`, `hyperframes-audio`, `hyperframes-cli`…). El mapa
está en `referencias/hyperframes.md`. En lo mecánico (atributos, determinismo, CLI) manda HyperFrames; en lo
editorial (ritmo, velocidad, cuándo un gráfico), manda esta skill.

Quien mira un tutorial **lo repite con la app abierta al lado**. Todo sale de ahí: «las personas no entienden
tan rápido».

## Proceso

| # | Paso | Qué se hace | Dónde |
|---|---|---|---|
| 1 | **Brief** | Pasar por `hyperframes` (escribe `BRIEF.md`; un tutorial narrado va a `general-video`). Fijar audiencia, destino, largo, capítulos, voz, si lleva música, y la piel de marca (`frame.md`) | `hyperframes`, `hyperframes-creative` |
| 2 | **Guion** | Por capítulos, con lo que se ve entre corchetes. Datos de la demo, sin frases hechas, siglas y números escritos como se pronuncian en el campo `vo`. Gancho: el resultado primero | `referencias/voz-y-guion.md`, `gancho-y-retencion.md` |
| 3 | **Grabación** | `grabar.mjs` (Playwright) sobre una empresa demo ficticia: 1920×1080, un clip por bloque, marcas por texto y paso a `.mp4` H.264. En Windows, con `node` | `referencias/tutoriales-de-pantalla.md` |
| 4 | **Voz** | `gen-voz.mjs`: una pasada por capítulo con alineación, LUFS por capítulo, anclas verificadas. Luego `transcribe --engine whisper --model small --language es -d tmp/trans-NN` y `verificar-voz.mjs` | `referencias/voz-y-guion.md` |
| 5 | **Montaje** | `gen-video.mjs` (desde `gen-video.ejemplo.mjs` + `montaje-base.mjs`) genera las composiciones desde guion, marcas y alineación, y **falla si rompe una regla**. Gráficos para conceptos, ilustraciones con `gen-ilustraciones.mjs`, efectos desde `biblioteca/` | `referencias/hyperframes.md`, `ritmo-y-cortes.md`, `graficos-y-texto.md`, `audio-y-sfx.md` |
| 6 | **Revisión** | Checklist completa: reglas del generador, `npx hyperframes check`, snapshots cada 0,5 s en los gráficos (`--no-end --describe false`), `hoja-de-contacto.mjs`, oír con audífonos | `checklist-de-revision.md` |
| 7 | **Render** | Solo con aprobación de la persona tras la vista previa. `draft` → `looks` → `delivery`, con `--video-frame-format png`. Master a -14 LUFS / -1 dBTP sobre el archivo | `referencias/hyperframes.md` § 5, `audio-y-sfx.md` |
| 8 | **Publicación** | Título con la búsqueda al inicio, miniatura que muestra el resultado, capítulos desde `datos/montaje.json`, guía escrita enlazada, créditos si alguna pista es CC BY | `referencias/miniatura-titulo-descripcion.md`, `licencias.md` |

## Reglas duras (no se rompen)

1. **La pantalla manda y la voz se acomoda.**
   - El clip nunca retrocede ni repite un segundo, y no se vuelve a un clip ya dejado.
   - Cada frase entra cuando pasa lo que dice.
   - Si la frase dura más que la acción, se congela el resultado del segundo correcto.
2. **Velocidad: 1× en navegación, clics y resultados; tipeo como máximo a 1,5×.** Lo que sobra se corta con
   un corte limpio; no se acelera más.
3. **Planos de ≥ 5 s**, y nunca un corte en mitad de una animación de la app.
4. **Un gráfico nunca está vacío**:
   - entra ≤ 0,5 s antes de su palabra;
   - tiene contenido antes de 1 s;
   - cada elemento entra a ≤ 0,6 s de cuando la voz lo nombra.
5. **Zoom solo al dato que nombra la voz**: hasta 1,10, ≥ 1,5 s para entrar, uno cada dos frases, dentro de un
   mismo plano, sobre un wrapper interno y nunca sobre el `.clip`.
6. **Siglas deletreadas y números en palabras** en lo que se lee («ese i i», «u efe», «uno coma setenta por
   ciento»). Se verifica con whisper, nunca con un modelo `.en`.
7. **Sin frases hechas** («de principio a fin», «en pocos clics», «listo:»). Se habla como quien muestra su
   pantalla, con los datos de la demo.
8. **Nunca datos reales**: empresa y personas ficticias, ambiente local, jamás un espejo de producción.
9. **La voz no se re-codifica** (corre la alineación); el volumen se corrige con `data-volume` ≤ 1, y se
   regenera solo el capítulo que lo necesita.
10. **Claves y voces van en el `.env`**: `ELEVENLABS_KEY`, `ELEVENLABS_VOICE_ID`, `GEMINI_API_KEY`. Nunca se
    copian a un archivo del proyecto, y la voz nunca se resuelve por nombre.
11. **Solo audio CC0, de la Audio Library de YouTube, o con licencia escrita de uso comercial.** Nada NC, nada
    sin licencia. Cada sonido nuevo deja su evidencia en `biblioteca/LICENCIAS.md`.
12. **No se renderiza sin aprobación** y no se muestra un corte sin pasar `checklist-de-revision.md`.

## Ritmo en una línea por tipo

La tabla completa, con la fuente de cada número y los rangos en que las fuentes no coinciden, está en
`referencias/ritmo-y-cortes.md`.

| | Tutorial | Explicativo | Short |
|---|---|---|---|
| Cambio de lo que se ve | Cuando cambia la acción. Revisar si pasan 20–40 s sin cambio | Planos de 2–5 s (creadores); cine ≈ 4–5 s (estudio) | 2–3 s |
| Plano mín. | 5 s | sin fuente seria | ~2 s con texto |
| Gráfico o interrupt | Cuando hay un concepto que la pantalla no muestra | Primero a los 25–35 s; luego cada 2–3 min | Algo nuevo cada 5–7 s |
| Texto en pantalla | `max(1,5 s; palabras × 0,33 s + 0,5 s)` | igual | igual, 3–5 palabras por línea |
| Silencio | ≥ 0,4 s entre frases; aviso a los 3 s y tope de 6 s sin voz | 200–400 ms | 200–300 ms |
| Transiciones | Corte seco dentro del paso; placa de 3 s entre pasos; zoom de 1,5 s para entrar y 0,9 s para salir | Disolvencia de 1 s (por defecto en Premiere) para cambio de tiempo o tema | Corte seco |
| Corte o fundido | Corte = continuidad. Placa o fundido = cambio de bloque | Disolvencia = paso de tiempo o lugar; fundido a negro = fin de bloque | Corte |

## Audio en una línea

- **Master:** -14 LUFS y ≤ -1 dBTP.
- **`data-volume`** de efectos y música se calcula con el nivel real de la voz (`voz_lufs` en
  `volumenes.json`): `node biblioteca/buscar.mjs --voz <voz_lufs>` lo hace. Efectos unos 15 dB bajo la voz;
  música unos 20 dB.
- **Música bajo la voz:** carve con `hyperframes-audio/scripts/carve.mjs --bed <id>` (escribir el atributo a
  mano no mezcla nada), con la cama en la misma composición que las frases.
- **Efectos:** con moderación, uno por evento que la pantalla muestra (entra una placa, un gráfico o una
  fila; algo cuadra). Nunca en cada corte, nunca sobre los clics de la grabación real, nunca el mismo más de 3
  veces seguidas.
- **Tutorial:** sin música salvo que el brief la pida.

## Biblioteca de audio CC0

`biblioteca/` trae 27 efectos (Kenney CC0 más 3 propios) y 3 pistas de música (OpenGameArt CC0), en WAV o MP3
a 44,1 kHz y normalizados.

```bash
node ~/.claude/skills/edicion-de-video/biblioteca/buscar.mjs                       # categorías
node ~/.claude/skills/edicion-de-video/biblioteca/buscar.mjs --categoria transicion
node ~/.claude/skills/edicion-de-video/biblioteca/buscar.mjs placa --rutas         # rutas para copiar
node ~/.claude/skills/edicion-de-video/biblioteca/buscar.mjs pop --voz -17         # con su data-volume
```

- Se copian a `assets/sfx/` del proyecto; no se enlazan fuera del proyecto.
- Si falta algo, `media-use resolve --type sfx`. Ojo: sus efectos sin credencial son de Pixabay, no CC0. Ver
  `referencias/licencias.md`.

## Índice

| Archivo | Qué trae |
|---|---|
| `referencias/hyperframes.md` | Qué skill de HyperFrames usar en cada paso y en qué orden; qué artefactos de `general-video` cubre el generador; cómo se escribe cada regla en el contrato; pistas; patrón del generador; tropiezos vividos; ciclo `lint`/`check`/`snapshot`/`preview`/`render` |
| `referencias/gancho-y-retencion.md` | Intro de 30 s según YouTube, gancho, capítulos, pantalla final |
| `referencias/ritmo-y-cortes.md` | **Tabla rápida de ritmo por tipo de video** con fuentes; cortes J/L; segmentación |
| `referencias/tutoriales-de-pantalla.md` | Grabar con Playwright, cursor, zoom, congelados, texto, gráficos y Mayer |
| `referencias/voz-y-guion.md` | Guion sin frases hechas, tabla de siglas, ElevenLabs, LUFS por capítulo, whisper |
| `referencias/audio-y-sfx.md` | Niveles, mezcla en HyperFrames, master final, cuándo sí y cuándo no un efecto |
| `referencias/graficos-y-texto.md` | Gráfico nunca vacío, duración del texto, entradas, zonas seguras, legibilidad |
| `referencias/miniatura-titulo-descripcion.md` | Especificación oficial, A/B, título, descripción, hashtags |
| `referencias/licencias.md` | Qué fuentes de audio sirven para un canal monetizado y Content ID |
| `checklist-de-revision.md` | Lo que se revisa antes de mostrar un corte, automático y a ojo |
| `plantillas/` | `grabar.ejemplo.mjs`, `gen-voz.mjs`, `verificar-voz.mjs`, `gen-ilustraciones.mjs`, `gen-video.ejemplo.mjs` + `montaje-base.mjs` (motor y comprobaciones; probado con `lint` y `check`), `hoja-de-contacto.mjs`, y ejemplos de `capitulos.mjs` e `ilustraciones.mjs` |
| `biblioteca/` | `catalogo.json`, `buscar.mjs`, `LICENCIAS.md`, `sfx/`, `musica/` |

Las plantillas se copian a la raíz del proyecto del video (`gen-video.ejemplo.mjs` como `gen-video.mjs`,
`grabar.ejemplo.mjs` como `grabar.mjs`) y se corren desde ahí. Cada una tiene `--help`.
