# Narrated screen tutorial: synthetic voice and script

Part of the [narrated screen tutorial recipe](../narrated-screen-tutorial.md). How to write what is said and
how to get it out of ElevenLabs so it sounds natural and lines up with the screen. HyperFrames' general narration mechanics are in `hyperframes-creative/references/narration.md`.
This file covers what is specific to tutorials narrated in Chilean Spanish, so the voice examples below are
in Spanish.

## Contents

- [Writing the script](#writing-the-script)
- [Writing for synthesis](#writing-for-synthesis)
- [Generating with ElevenLabs](#generating-with-elevenlabs)
- [Measuring loudness per span (LUFS)](#measuring-loudness-per-span-lufs)
- [Verifying with whisper](#verifying-with-whisper)
- [Sources](#sources)

## Writing the script

1. **Speak like someone showing their screen, with the demo data.** "This bakery has eight employees", not
   "easily manage your team".
2. **No stock phrases or canned copy**: they sound like advertising and nobody believes them. Blocklist
   (extendable), searched for in the script before generating the voice:
   - «de principio a fin» (from start to finish), «en pocos clics» (in just a few clicks), «así de fácil»
     (it's that easy), «listo:» (done:);
   - «olvídate de» (forget about), «nunca fue tan fácil» (it's never been so easy), «te mostramos cómo»
     (we'll show you how);
   - «en este video vamos a ver» (in this video we'll see), «sin más preámbulo» (without further ado),
     «potencia» (power up), «revoluciona» (revolutionize).
   Running the text through the `humanizer` skill helps find others.
3. **Each phrase names what is seen at that moment.** If the phrase talks about something the screen does
   not show, a shot or a graphic is missing.
4. **Simple Chilean Spanish, not Argentine.** «Puedes», «tienes», not «podés». Compliance verbs with a
   person: the app calculates and suggests; the person using it reviews and confirms.
5. **Pace: 120–150 words per minute (2–2.5 per second) for technical content** **[speaking rate,
   creator]**.
   - HyperFrames takes 2.5 words per second as a natural pace and asks for pauses **[hyperframes-creative]**.
   - In recorded lectures, speaking fast and with enthusiasm retained more **[Guo 2014, study]**. In a
     tutorial, the screen's pace leads: the voice waits for the action, it does not rush it.
6. **One take per chapter, not per phrase.** Read in pieces, each break lands like a full stop and it sounds
   like a list. In a single take the voice flows and respects the commas **[house]**. Afterwards it is cut
   per phrase using the alignment.

## Writing for synthesis

ElevenLabs reads acronyms as words and numbers in its own way. In the `vo` field (what is read aloud) they
are written as they are pronounced; on screen they keep their normal spelling **[house]**.

| On screen | In `vo` | Why |
|---|---|---|
| SII | «ese i i» | it reads it as a word |
| ACHS | «a ce hache ese» | same |
| AFP | «a efe pe» | same |
| LRE | «ele erre e» | same |
| UF | «u efe» | it read it as «uff» |
| CSV, PDF | «ce ese uve», «pe de efe» | same |
| Previred | «Previ Red» | splits the syllables properly |
| RUT | «rut» | said as a word |
| 1,70 % | «uno coma setenta por ciento» | numbers are written out in words |
| art. 50 | «artículo cincuenta» | same |

The `vo` column is the Spanish spelling of each letter or number as a Spanish narrator would say it. Every
new acronym is tested and added to this table.

## Generating with ElevenLabs

Template: `templates/gen-voice.mjs`, copied to the project root, plus a `chapters.mjs` in the format of
`templates/chapters.example.mjs`. Run it from the root: `node gen-voice.mjs --help`.

- **Configuration by reference to the `.env`, without copying keys.** The scripts read the `.env` from
  `--env`, otherwise the one in `VIDEO_ENV_FILE`, otherwise the project's `./.env`. They do not search
  upwards, so they never pick up another app's file.
  - Variables: `ELEVENLABS_KEY` and the `voice_id` (in `ELEVENLABS_VOICE_ID`, or another name with
    `--voice-var`). Optional: `ELEVENLABS_MODEL_ID` (defaults to `eleven_multilingual_v2`),
    `VOICE_STABILITY`, `VOICE_SIMILARITY` and `VOICE_STYLE`.
  - Example, with the `.env` in another folder and the voice stored as `MY_VOICE_ID`:

    ```bash
    node gen-voice.mjs --env ../.env --voice-var MY_VOICE_ID
    node gen-illustrations.mjs --env ../.env
    ```
- **The voice is not resolved by name.**
  - A key scoped only to text-to-speech gets a 401 from `GET /v1/voices`.
  - Code that "resolves the name" falls back to the default voice, which is English and sounds like an
    American reading Spanish.
- **Settings for informative narration:** stability 0.55, similarity 0.8, style 0.05. With a high style the
  voice "acts" and figures come out with odd emphasis **[house]**.
- **Alignment:** request `/with-timestamps` and store the alignment of the **original** text (`alignment`,
  not `normalized_alignment`). The indices have to match the script, which is where anchors are searched.
- **Anchors:** each phrase and each visual element is anchored to a piece of text that appears **only once**
  in the chapter. `gen-voice.mjs` fails if an anchor is missing or repeated.
- **Regenerate per chapter only:** `node gen-voice.mjs 03 --redo`. Everything is not regenerated because
  one phrase changed.

## Measuring loudness per span (LUFS)

Each chapter is a separate call and comes out at its own level. Chained together, the voice sounds like it
rises and falls **[house]**. So:

1. `gen-voice.mjs` measures each chapter with `loudnorm` (integrated LUFS, ITU-R BS.1770) and writes
   `volumes.json`.
2. The reference is **the quietest chapter**: every gain ends up ≤ 1. It only attenuates, because
   amplifying raises the synthesis hiss and `data-volume` > 1 can clip.
3. **The mp3 is not re-encoded.** Re-encoding adds a few milliseconds of padding at the start and shifts the
   whole alignment. The correction is applied with `data-volume` on each `<audio>`.
4. If a chapter ends up **more than 4 dB from the median**, that chapter is regenerated. It is not allowed
   to drag the others along.
5. The video's final level (-14 LUFS for YouTube) is set **once, on the render** (see [`audio-and-sfx.md`](../../references/audio-and-sfx.md)).

## Verifying with whisper

Before editing, transcribe each chapter and compare it with the script:

```bash
npx hyperframes transcribe assets/voice/ch03.mp3 --engine whisper --model small --language es -d tmp/trans-03
node verify-voice.mjs 03 tmp/trans-03/transcript.json
```

- `transcribe` always writes `<dir>/transcript.json`: one `-d` per chapter, or the next one overwrites the
  previous one.
- `--engine whisper` pins the engine: with `auto`, if Parakeet is installed that one is used and `--model` is
  ignored.
- **Never use a `.en` model** (`small.en` is the CLI default): it silently translates Spanish into English
  **[media-use/transcribe]**.
- `verify-voice.mjs` lists the spans where what is heard differs from the script.
- Spelled-out acronyms will show up as differences (whisper writes «SII»): listen to those and confirm they
  do not sound like a word.
- What is an error: an acronym read as a word, a number said differently, a swallowed word.

## Sources

- **[house]**: corrections to the first cut of the reference tutorial (4-Oct-2026).
- **[hyperframes-creative]**: `~/.claude/skills/hyperframes-creative/references/narration.md`.
- **[media-use/transcribe]**: `~/.claude/skills/media-use/audio/references/transcribe.md`.
- **[Guo 2014]**: https://pg.ucsd.edu/publications/edX-MOOC-video-production-and-engagement_LAS-2014.pdf
- **[speaking rate]**: https://thevoiceoverguy.com.au/words-to-minutes and https://goteleprompter.com/blog/words-per-minute-speaking-rate-guide/
- ElevenLabs, "Create speech with timing". https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
