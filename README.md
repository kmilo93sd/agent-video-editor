# montaje

Una skill de edición de video para agentes de IA como Claude Code. Le da al agente el criterio de un editor de
YouTube: cuándo cortar, cada cuánto cambiar la pantalla, cuánto silencio aguanta una frase, cómo anclar un
gráfico a la palabra que lo nombra, a qué volumen va la música bajo la voz y cómo se arma una miniatura que se
lee a 160 px.

Nació armando tutoriales de software narrados: grabación de pantalla con Playwright, voz con ElevenLabs y
montaje con [HyperFrames](https://github.com/heygen-com/hyperframes). La parte editorial sirve para cualquier
video explicativo, Short o Reel.

## Qué trae

| Carpeta | Qué hay |
|---|---|
| `SKILL.md` | El punto de entrada: el proceso de punta a punta y cuándo abrir cada referencia. |
| `referencias/` | Ritmo y cortes, gancho y retención, voz y guion, gráficos y texto, audio y efectos, miniatura, título y descripción, tutoriales de pantalla, licencias, e integración con HyperFrames. |
| `checklist-de-revision.md` | La revisión que se pasa antes de mostrar un corte. |
| `plantillas/` | Generadores `.mjs`: voz con ElevenLabs y verificación de pronunciación, ilustraciones, grabación con Playwright, montaje con reglas que fallan si se rompen (sin retrocesos, topes de silencio, gráficos sin tiempo vacío) y hoja de contacto. |
| `biblioteca/` | 27 efectos y 3 pistas de música CC0, con `catalogo.json` (duración, LUFS y uso sugerido) y un buscador. |

## Instalar

```bash
npx skills add kmilo93sd/montaje
```

O a mano: copia `skills/edicion-de-video/` en `~/.claude/skills/`.

Buscar un sonido:

```bash
node ~/.claude/skills/edicion-de-video/biblioteca/buscar.mjs whoosh
node ~/.claude/skills/edicion-de-video/biblioteca/buscar.mjs --categoria musica --rutas
```

## Requisitos de las plantillas

- Node 20 o superior y `ffmpeg` en el PATH.
- Para la voz, una clave de ElevenLabs y el `voice_id` en un `.env`, que se pasa con `--env`. Las plantillas
  no buscan claves hacia arriba ni las copian.
- Para grabar, Playwright. Para montar y renderizar, HyperFrames y sus skills.

## Idioma

La skill está escrita en español, y las reglas de voz (siglas deletreadas, grafías fonéticas) son para
narración en español. El criterio de montaje no depende del idioma.

## Licencia

- El código y los textos usan la licencia [MIT](LICENSE).
- Los sonidos de `biblioteca/` son CC0 1.0. El detalle por archivo, con la fuente de cada uno, está en
  [`biblioteca/LICENCIAS.md`](skills/edicion-de-video/biblioteca/LICENCIAS.md).
