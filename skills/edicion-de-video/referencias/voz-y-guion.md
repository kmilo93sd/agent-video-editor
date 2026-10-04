# Voz y guion

Cómo escribir lo que se dice y cómo sacarlo de ElevenLabs para que suene natural y calce con la pantalla.
La mecánica general de narración de HyperFrames está en `hyperframes-creative/references/narration.md`.
Aquí va lo propio de tutoriales en español chileno.

## Contenido

- [Escribir el guion](#escribir-el-guion)
- [Escribir para la síntesis](#escribir-para-la-síntesis)
- [Generar con ElevenLabs](#generar-con-elevenlabs)
- [Medir el volumen por tramo (LUFS)](#medir-el-volumen-por-tramo-lufs)
- [Verificar con whisper](#verificar-con-whisper)
- [Fuentes](#fuentes)

## Escribir el guion

1. **Habla como quien muestra su pantalla, con los datos de la demo.** «Esta panadería tiene ocho
   trabajadores» y no «gestiona fácilmente tu equipo».
2. **Sin frases hechas ni textos pre armados**: suenan a publicidad y nadie los cree. Lista negra
   (ampliable), que se busca en el guion antes de generar la voz:
   - «de principio a fin», «en pocos clics», «así de fácil», «listo:»;
   - «olvídate de», «nunca fue tan fácil», «te mostramos cómo»;
   - «en este video vamos a ver», «sin más preámbulo», «potencia», «revoluciona».
   Pasar el texto por la skill `humanizer` ayuda a encontrar otras.
3. **Cada frase nombra lo que se ve en ese momento.** Si la frase habla de algo que la pantalla no muestra,
   falta un plano o falta un gráfico.
4. **Lenguaje simple y chileno, no argentino.** «Puedes», «tienes», no «podés». Verbos de cumplimiento con
   persona: la app calcula y propone; quien la usa revisa y confirma.
5. **Ritmo: 120–150 palabras por minuto (2–2,5 por segundo) para contenido técnico** **[ritmo de locución,
   creador]**.
   - HyperFrames toma 2,5 palabras por segundo como ritmo natural y pide dejar pausas **[hyperframes-creative]**.
   - En clases grabadas, hablar rápido y con entusiasmo retuvo más **[Guo 2014, estudio]**. En un tutorial,
     el que manda es el ritmo de la pantalla: la voz espera a la acción, no la apura.
6. **Una pasada por capítulo, no por frase.** Leída en trozos, cada corte cae como punto aparte y suena a
   lista. En una sola pasada la voz encadena y respeta las comas **[casa]**. Después se corta por frase usando
   la alineación.

## Escribir para la síntesis

ElevenLabs lee las siglas como palabras y los números a su manera. En el campo `vo` (lo que se lee) se
escriben como se pronuncian; en pantalla va la escritura normal **[casa]**.

| En pantalla | En `vo` | Por qué |
|---|---|---|
| SII | «ese i i» | la lee como palabra |
| ACHS | «a ce hache ese» | idem |
| AFP | «a efe pe» | idem |
| LRE | «ele erre e» | idem |
| UF | «u efe» | la leía «uff» |
| CSV, PDF | «ce ese uve», «pe de efe» | idem |
| Previred | «Previ Red» | separa bien las sílabas |
| RUT | «rut» | se dice como palabra |
| 1,70 % | «uno coma setenta por ciento» | los números se escriben en palabras |
| art. 50 | «artículo cincuenta» | idem |

Cada sigla nueva se prueba y se agrega a esta tabla.

## Generar con ElevenLabs

Plantilla: `plantillas/gen-voz.mjs`, copiada a la raíz del proyecto, más un `capitulos.mjs` con el formato de
`plantillas/capitulos.ejemplo.mjs`. Se corre desde la raíz: `node gen-voz.mjs --help`.

- **Configuración por referencia al `.env`, sin copiar claves.** Los scripts leen el `.env` de `--env`, si no
  el de `VIDEO_ENV_FILE`, si no el `./.env` del proyecto. No buscan hacia arriba, para no tomar el de otra app.
  - Variables: `ELEVENLABS_KEY` y el `voice_id` (en `ELEVENLABS_VOICE_ID`, u otro nombre con `--voz-var`).
    Opcionales: `ELEVENLABS_MODEL_ID` (por defecto `eleven_multilingual_v2`), `VOZ_ESTABILIDAD`,
    `VOZ_SIMILITUD` y `VOZ_ESTILO`.
  - Ejemplo, con el `.env` en otra carpeta y la voz guardada como `MI_VOZ_ID`:

    ```bash
    node gen-voz.mjs --env ../.env --voz-var MI_VOZ_ID
    node gen-ilustraciones.mjs --env ../.env
    ```
- **La voz no se resuelve por nombre.**
  - Una clave scopeada solo a text-to-speech responde 401 a `GET /v1/voices`.
  - El código que «resuelve el nombre» cae en la voz por defecto, que es inglesa y suena a gringo leyendo
    español.
- **Ajustes para locución informativa:** estabilidad 0,55, similitud 0,8, estilo 0,05. Con estilo alto la voz
  «actúa» y las cifras salen con énfasis raro **[casa]**.
- **Alineación:** se pide `/with-timestamps` y se guarda la alineación del texto **original**
  (`alignment`, no `normalized_alignment`). Los índices tienen que corresponder al guion, que es donde se
  buscan las anclas.
- **Anclas:** cada frase y cada elemento visual se ancla a un pedazo de texto que aparezca **una sola vez** en
  el capítulo. `gen-voz.mjs` falla si un ancla no está o está repetida.
- **Regenerar solo por capítulo:** `node gen-voz.mjs 03 --rehacer`. No se regenera todo por un cambio en
  una frase.

## Medir el volumen por tramo (LUFS)

Cada capítulo es una llamada distinta y sale con su propio nivel. Encadenados, suenan como si la voz subiera y
bajara **[casa]**. Por eso:

1. `gen-voz.mjs` mide cada capítulo con `loudnorm` (LUFS integrados, ITU-R BS.1770) y escribe
   `volumenes.json`.
2. La referencia es **el capítulo más suave**: todas las ganancias quedan ≤ 1. Solo se atenúa, porque
   amplificar levanta el siseo de la síntesis y `data-volume` > 1 puede saturar.
3. **No se re-codifica el mp3.** Re-encodear agrega un relleno de milisegundos al inicio y corre toda la
   alineación. La corrección se aplica con `data-volume` en cada `<audio>`.
4. Si un capítulo queda a **más de 4 dB de la mediana**, se regenera ese capítulo. No se acepta que arrastre a
   los otros.
5. El nivel final del video (-14 LUFS para YouTube) se ajusta **una vez, sobre el render** (ver
   `audio-y-sfx.md`).

## Verificar con whisper

Antes de montar, transcribir cada capítulo y comparar con el guion:

```bash
npx hyperframes transcribe assets/voz/cap03.mp3 --engine whisper --model small --language es -d tmp/trans-03
node verificar-voz.mjs 03 tmp/trans-03/transcript.json
```

- `transcribe` siempre escribe `<dir>/transcript.json`: un `-d` por capítulo, o el siguiente pisa al anterior.
- `--engine whisper` fija el motor: con `auto`, si Parakeet está instalado se usa ese y `--model` se ignora.
- **Nunca uses un modelo `.en`** (`small.en` es el defecto del CLI): traduce el español al inglés en silencio
  **[media-use/transcribe]**.
- `verificar-voz.mjs` lista los tramos donde lo oído difiere del guion.
- Las siglas deletreadas aparecerán como diferencia (whisper escribe «SII»): oír esas y confirmar que no
  suenen a palabra.
- Lo que sí es error: una sigla leída como palabra, un número dicho distinto, una palabra comida.

## Fuentes

- **[casa]**: correcciones al primer corte del tutorial de referencia (4-oct-2026).
- **[hyperframes-creative]**: `~/.claude/skills/hyperframes-creative/references/narration.md`.
- **[media-use/transcribe]**: `~/.claude/skills/media-use/audio/references/transcribe.md`.
- **[Guo 2014]**: https://pg.ucsd.edu/publications/edX-MOOC-video-production-and-engagement_LAS-2014.pdf
- **[ritmo de locución]**: https://thevoiceoverguy.com.au/words-to-minutes y https://goteleprompter.com/blog/words-per-minute-speaking-rate-guide/
- ElevenLabs, «Create speech with timing». https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
