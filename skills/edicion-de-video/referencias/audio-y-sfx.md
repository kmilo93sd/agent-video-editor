# Audio y efectos de sonido

Niveles, mezcla y cuándo usar efectos. La mecánica se reparte así:

- `media-use` busca y resuelve BGM y SFX;
- `hyperframes-audio` mezcla: fundidos, carve, automatización;
- la biblioteca propia (`../biblioteca/`) trae efectos y música CC0 ya normalizados.

Fuentes al final.

## Contenido

- [Niveles objetivo](#niveles-objetivo)
- [Cómo se aplica en un proyecto HyperFrames](#cómo-se-aplica-en-un-proyecto-hyperframes)
- [¿Música en un tutorial?](#música-en-un-tutorial)
- [Efectos de sonido: cuándo sí y cuándo no](#efectos-de-sonido-cuándo-sí-y-cuándo-no)
- [Fuentes](#fuentes)

## Niveles objetivo

| Qué | Objetivo | Fuente |
|---|---|---|
| Master del video para YouTube | **-14 LUFS integrados**, **true peak ≤ -1 dBTP** | YouTube baja lo que suena más fuerte que ~-14 LUFS y no sube lo que suena más bajo; no lo publica en su Help, se mide en «Estadísticas para nerds» **[Frame.io; creador: Pure Audio Insight]** |
| Distribución de contenido hablado (referencia) | -18 LUFS | AES TD1008 para «speech-only» **[AES TD1008 vía Production Advice]** |
| Voz sola durante el montaje | -16 LUFS, LRA 4–8 LU | **[Sweetwater; Pure Audio Insight, creador]** |
| Música de fondo bajo voz | **18–25 dB bajo la voz** (con voz a -16: música a -34/-41 LUFS) | **[Pure Audio Insight, creador]** |
| Ducking de la música mientras hay voz | 6–12 dB típico; Auphonic aplica 18 dB por defecto; ataque 10–50 ms, release 250–700 ms | **[Zella; Auphonic, oficial]** |
| Efectos bajo la voz | 12–24 dB bajo la voz. `media-use` usa `volume: 0.35` (≈ -9 dB sobre un SFX ya nivelado) | **[Storyblocks, creador; media-use/sfx]** |

**Por qué -14 y no más fuerte:** subir más no gana nada, YouTube lo baja igual. Quedar bajo -14 sí pierde:
el video suena más bajo que los vecinos. La regla de la casa es masterizar a -14 LUFS / -1 dBTP sobre el render.

## Cómo se aplica en un proyecto HyperFrames

1. **Voz:** cada `<audio>` de frase lleva `data-volume` desde `volumenes.json`, nunca > 1 (ver
   `voz-y-guion.md`). Con esas ganancias toda la voz queda al nivel del capítulo más suave, que
   `volumenes.json` anota en `voz_lufs`. Normalmente queda entre -18 y -14.
2. **Efectos:** el `data-volume` se calcula con el nivel real de la voz y el del efecto, no con un rango fijo:

   ```
   data-volume = 10 ^ ((voz_lufs - bajo_la_voz - lufs_del_efecto) / 20)    tope 1
   ```

   - `lufs_del_efecto` está en `catalogo.json` (los de la biblioteca rondan -22 a -27; los clics quedan más
     bajos a propósito).
   - `bajo_la_voz`: 15 dB por defecto, dentro del rango de 12–24 dB de la tabla.
   - Ejemplo: voz a -17, `pop-1` a -23,7 → `10^((-17 - 15 + 23.7)/20)` = 0,38.
   - Si da más de 1, el efecto es demasiado suave para ese uso: elige otro.
3. **Música de la biblioteca:** viene a **-16 LUFS**.
   - Sin carve: `data-volume = 10^((voz_lufs - 20 - (-16))/20)`, unos 20 dB bajo la voz. Con la voz a -16 da 0,10.
   - `media-use` usa 0,12 (≈ -18 dB) por defecto **[media-use/bgm]**.
   - Con carve, dejar `data-volume` en 1: el carve escribe su propia ganancia y no hay que sumarle otra a mano.
4. **Que la música no pelee con la voz:** el **voiceover carve** de `hyperframes-audio` hunde la cama solo en
   las bandas que ocupa la voz, y sigue la voz en el tiempo.
   - **Se hace con el script**:
     `node <hyperframes-audio>/scripts/carve.mjs --comp compositions/capNN.html --bed <id-de-la-cama>`.
     Escribir `data-fx-carve` a mano no mezcla nada: lo que suena es el `data-fx-chain` y los carriles que
     escribe el script **[hyperframes-audio]**.
   - Necesita `ffmpeg` y `npm i -D @hyperframes/core` en el proyecto.
   - Analiza un archivo: la cama tiene que estar en la misma composición que las frases. En un tutorial con
     un archivo por capítulo, va una cama por capítulo (o la música solo en intro, placas y cierre, que es lo
     que se recomienda abajo).
   - Pasar `--bed` siempre: el detector reconoce la cama por nombre (`music`, `bgm`, `bed`…), y `musica-*` no
     calza.
   - Cada frase de voz lleva `data-audio-group="voz"`, y el grupo de voz no lleva música ni efectos
     **[hyperframes-audio]**.
   - Confirmar con `npx hyperframes check` antes de renderizar.
   - Un ducking clásico (carril `volume` en `data-automation` de la música) no reemplaza al carve
     **[hyperframes-audio]**.
   - Una pista lleva carril o tween de volumen, **nunca los dos**: el carril gana y el tween se ignora.
5. **Master final, una vez, sobre el render** (dos pasadas de `loudnorm`; el video se copia sin re-codificar):

```bash
ffmpeg -hide_banner -i render.mp4 -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2> medida.txt
# leer input_i, input_tp, input_lra, input_thresh y target_offset del JSON al final de medida.txt
ffmpeg -i render.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=<input_i>:measured_TP=<input_tp>:measured_LRA=<input_lra>:measured_thresh=<input_thresh>:offset=<target_offset>:linear=true" -c:a aac -b:a 192k -ar 48000 final.mp4
```

   El informe de `loudnorm` sale por **stderr**, no por stdout; leer stdout da vacío. Verificar el resultado
   con `ffmpeg -i final.mp4 -af ebur128=peak=true -f null -`: I cerca de -14, true peak ≤ -1.

## ¿Música en un tutorial?

Es decisión del brief, no un relleno por defecto.

- El tutorial de referencia va **sin música**: la voz sola, porque quien mira está escuchando instrucciones
  **[casa]**.
- El principio de coherencia de Mayer va en la misma línea: música de fondo que no aporta empeora el
  aprendizaje **[Mayer, estudio]**.
- Usa música en la intro, las placas y el cierre, o en explicativos y shorts.
- Si va bajo toda la voz, que sea ambiente sin melodía y al nivel de cama.

## Efectos de sonido: cuándo sí y cuándo no

**Sí**, con moderación, cuando el sonido confirma algo que pasa en pantalla:

| Momento | Efecto (biblioteca) | Nota |
|---|---|---|
| Entra una placa de capítulo | `whoosh-suave` o `pasar-pagina`, más `impacto-suave-1` al asentarse | Uno por placa |
| Entra un gráfico o tarjeta | `deslizar-1` / `deslizar-2` | Alternar para no repetir |
| Aparece una fila de un gráfico cuando la voz la nombra | `pop-1` / `pop-2` | Unos 18–20 dB bajo la voz, y no en cada fila si son más de 4 |
| Un total cuadra, un paso queda listo | `exito-1` | Uno por capítulo como mucho |
| Un error o una validación que se muestra a propósito | `error-1` | Suave, nunca en loop |
| Tipeo animado en un gráfico | `tipeo-3s` recortado con `data-duration` | En la grabación real, el sonido no se agrega |
| Cierre o alejamiento final | `barrido-largo` | |

- **Colocar el transiente 2–4 cuadros antes del cambio visual**, para que el pico coincida con lo que se ve
  **[Storyblocks, creador]**.
- En HyperFrames, si el archivo tiene silencio al inicio, restarlo al `data-start` o recortarlo con
  `data-media-start` **[hyperframes-core/creator-editing-recipes, «Align a sound to an on-screen event»]**.

**No:**

- clics sobre la grabación real de pantalla en cada clic: ensucia, y la voz ya los nombra;
- whoosh en cada corte dentro de un capítulo: los cortes de un tutorial son continuidad, no transición;
- el mismo sonido más de 3 veces seguidas: se nota la repetición y cansa **[Storyblocks, creador]**;
- efectos más fuertes que la voz, o encima de una palabra clave (una cifra, una sigla).

## Fuentes

- **[Frame.io]**: «Loudness for YouTube». https://workflow.frame.io/guide/loudness-for-youtube
- **[Pure Audio Insight]**: https://pureaudioinsight.com/blogs/content-production/perfect-youtube-audio-levels-creators-technical-guide
- **[AES TD1008 vía Production Advice]**: https://productionadvice.co.uk/td1008/
- **[Sweetwater]**: https://www.sweetwater.com/insync/how-to-master-audio-for-youtube/
- **[Zella]**: https://zellahq.com/blog/music-ducking-explained/
- **[Auphonic]**: https://auphonic.com/help/web/multitrack.html
- **[Storyblocks]**: https://www.storyblocks.com/resources/blog/pump-youtube-videos-stock-sfx
- **[Mayer]**: https://doi.org/10.1037/0003-066X.63.8.760
- **ffmpeg loudnorm**: https://ffmpeg.org/ffmpeg-filters.html#loudnorm; dos pasadas: https://dev.to/masonwritescode/two-pass-loudness-normalization-with-ffmpeg-loudnorm-the-right-way-1nm3
- **[media-use/sfx], [media-use/bgm]**: `~/.claude/skills/media-use/audio/references/{sfx,bgm}.md`.
- **[hyperframes-audio]**: `~/.claude/skills/hyperframes-audio/SKILL.md`, sección «Voiceover carve».
- **[hyperframes-core/creator-editing-recipes]**: `~/.claude/skills/hyperframes-core/references/creator-editing-recipes.md`.
- **[casa]**: BRIEF del tutorial de referencia («la voz va sola»).
