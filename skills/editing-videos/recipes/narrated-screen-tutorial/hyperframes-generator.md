# Narrated screen tutorial: the HyperFrames generator

Part of the [narrated screen tutorial recipe](../narrated-screen-tutorial.md). HyperFrames is one way to
build this kind of video, the one the templates here are tested with; the general map of HyperFrames skills,
and how the same rules look in an NLE, ffmpeg or Remotion, is in
[`../../references/tools.md`](../../references/tools.md).

The recipe decides **what** gets done and with which numbers; the HyperFrames skills decide **how** it is
written in their contract. HyperFrames wins on mechanics (attributes, determinism, CLI), the recipe on
editorial matters (pacing, speed, when to use a graphic). Say so in the delivery.

## Contents

- [1. Which HyperFrames skill to use at each step](#1-which-hyperframes-skill-to-use-at-each-step)
- [2. How each editorial rule is written in the contract](#2-how-each-editorial-rule-is-written-in-the-contract)
- [3. The generator pattern](#3-the-generator-pattern)
- [4. Pitfalls already hit](#4-pitfalls-already-hit)
- [5. Review loop with `npx hyperframes`](#5-review-loop-with-npx-hyperframes)
- [Sources](#sources)

## 1. Which HyperFrames skill to use at each step

Load order in a new or resumed project:

| Step | Skill | What for |
|---|---|---|
| 0. Entry | `hyperframes` | Always first. Runs `npx hyperframes usage --json`. Reads the project state. If there is a `BRIEF.md`, runs its `workflow`; if not, runs the interview and writes the brief. A long narrated tutorial falls under `general-video` |
| 0b. Install the workflow | `npx hyperframes skills update general-video` | Before reading the workflow. If it fails, show the error; do not continue from memory |
| 0c. Project | `npx hyperframes init "videos/<project>" --non-interactive --example=blank --skill=general-video` | Creates the folder, `hyperframes.json` and `package.json` with the pinned version. Add `"media": { "autoProxy": true }` |
| 1. Workflow | `general-video` | Owns the deliverable end to end: plan, storyboard, build, review |
| 2. Contract | `hyperframes-core` | **Before writing HTML**: `data-start`, `data-duration`, `data-media-start`, tracks, sub-compositions, determinism. Copyable recipes in `references/creator-editing-recipes.md` |
| 3. Direction | `hyperframes-creative` | `frame.md` / `design.md` (brand skin), narration, beat plan |
| 4. Media | `media-use` | Resolve BGM, SFX, images and icons; transcribe. TTS only if the brief does not set a brand voice |
| 5. Motion | `hyperframes-animation` | Animation rules, blueprints, transitions; `scripts/animation-map.mjs` to review the choreography |
| 5b. Camera | `hyperframes-keyframes` | Zoom, punch-in, reframing: always on an inner wrapper |
| 6. Blocks | `hyperframes-registry` | **Before hand-drawing** anything with a name (chart, terminal window, transition): `npx hyperframes catalog --query "<in English>" --json` |
| 7. Mix | `hyperframes-audio` | Fades, carving the music against the voice (`scripts/carve.mjs`), automation, buses |
| 8. Review and render | `hyperframes-cli` | `lint`, `check`, `snapshot`, `preview`, `render` |
| 9. Adjustments with the person | `hyperframes-studio` | Questions or notes on a cut that is already built (§ 0); track order and safe zones |

For requests that cross domains, the "Creator request" table in `hyperframes/SKILL.md` § 5 says what to load
together. Examples:

- a cut: `general-video` + `core`;
- a zoom: `+ keyframes`;
- a fade or ducking: `+ audio`.

### What `general-video` asks for and what covers it here

In a tutorial, the generator replaces the step of building scene by scene with subagents (the "frame
workers"). The artifacts the workflow expects are produced like this:

| `general-video` expects | In a tutorial with the generator |
|---|---|
| `STORYBOARD.md` with a `## Frame N` block per scene (`status`, `src:`, blueprint or rules citation, beat), even with `storyboard: no` | One block per chapter, with `src: compositions/chNN.html`. The rules citation points to `../narrated-screen-tutorial.md` and, for title cards and graphics, to the `hyperframes-animation` rules they use. The beat is the summary from `SCRIPT.md` |
| Per-scene packages and subagents that write `compositions/<frame>.html` | The generator writes every composition. No workers are dispatched |
| `compositions/<frame>.motion.json` | The generator writes one per chapter with graphics: `appearsBy` per row and `before` between rows. `check` verifies them |
| `audio_meta.json` from the `media-use` audio engine | Replaced by `gen-voice.mjs` (brand voice with alignment) and the library's `catalog.json`. If BGM or SFX from `media-use resolve` are used, that record still applies |
| Review with `animation-map.mjs` | Runs the same way on the generated compositions |
| Storyboard gates, final preview and render approval | Same. The generator does not skip them |

## 2. How each editorial rule is written in the contract

| Editorial rule | In HyperFrames |
|---|---|
| **Cutting and trimming a clip** | One `<video>` piece per span, with `data-start` (composition time), `data-duration` and `data-media-start` (second in the file). A forward jump in the clip is another piece. Recipes "Hard cut", "Trim in/out" and "Split / splice" |
| **Times inside a chapter** | Each chapter is a sub-composition, and its `data-start` values are local to it. Mark every `<video>`, `<img>` and `<audio>` with `data-hf-media-start-basis="local"`: without it, `lint` warns `nested_media_start_basis_ambiguous` |
| **No going back** | Inside a chapter, the `data-media-start` of each piece of a clip is ≥ the end of the previous one, and the edit never returns to a clip it already left. The generator checks this, not the CLI |
| **Speed** | Constant `data-playback-rate` per piece: `1` for navigation, clicks and results; **≤ 1.5** only for typing. Never a `rate` lane to rush a wait: the wait is cut. `source consumed = data-duration × rate` |
| **Freezing the result** | An `<img class="clip">` with the frame extracted **as PNG** at the exact second the clip is at (recipe "Freeze / hold"; a freeze in the middle of the file is preprocessed). As PNG, so that no compression jump between the video and the still frame is noticeable |
| **Voice per phrase over a single mp3** | One `<audio>` per phrase, all with the **same `src`**: `data-media-start` = start of the phrase in the mp3, `data-duration` = its length, `data-start` = when what it describes happens, `data-volume` = the chapter's gain, `data-audio-group="voice"`. No re-encoding. Every `<audio>` has an `id`: without an `id` the mixer ignores it and the render comes out silent |
| **Slow zoom on the detail** | Animate the **shot's wrapper** (`<div class="cam" id="p07">`, which wraps its pieces), **never the `.clip`** and **never the class** (`.cam` would zoom every shot). The wrapper has no `data-start`: `lint` rejects a video inside a timed element (`video_nested_in_timed_element`). `tl.set("#p07", {transformOrigin:"62% 40%"}, t)`, `tl.fromTo("#p07", {scale:1}, {scale:1.10, duration:1.6, ease:"sine.inOut", immediateRender:false}, t)`, and back to 1 in 0.9 s |
| **Title cards and graphics entering** | Tweens on inner elements of the `.clip` section (`fromTo` on `y` and `opacity`). The framework handles the `.clip`'s visibility, not a tween |
| **Fade or dissolve** | Two clips on different tracks that overlap, with opposite `opacity` envelopes on their wrappers and `volume` envelopes in `data-automation` (recipe "Crossfade"). Rarely used in a tutorial: hard cut within a step |
| **Level of each track** | `data-volume` = the track's fixed level. For changes over time, a `volume` lane in `data-automation`. **Never** a lane and a volume tween on the same track |
| **Music under the voice** | **Carve with the script**, not by writing attributes: `node <hyperframes-audio>/scripts/carve.mjs --comp compositions/chNN.html --bed <bed id>`. The `data-fx-carve` attribute only stores the configuration; what you hear is the `data-fx-chain` and the lanes the script writes. Requirements: `ffmpeg` and `npm i -D @hyperframes/core` in the project. The bed and the phrases have to be **in the same file**, because the script analyzes one. Always pass `--bed` with the bed's id: without it the script guesses the bed from ids and file names, and a guess can pick the wrong track. Do not adjust the bed's `data-volume` by hand afterwards: the carve writes its own gain. Confirm with `check` |
| **Sound effects** | With `media-use resolve --type sfx`, or copied from [`library/`](../../library/) to the project's `assets/sfx/`. Each one is an `<audio>` with an `id`, `data-start` on the event (2–4 frames before), a computed `data-volume` ([`audio-and-sfx.md`](../../references/audio-and-sfx.md)) and `data-audio-group="sfx"`, never in the voice group |
| **Safe zones** | Content within 90 % (action-safe) and text within 80 % (title-safe), the margins from `hyperframes-studio` § 4 |

### Levels in the project

- **Voice:** each phrase's `<audio>` takes its `data-volume` from `volumes.json`, never > 1 (see
  [`voice.md`](voice.md)). With those gains the whole voice sits at the level of the quietest chapter,
  recorded as `voice_lufs`; it usually lands between -18 and -14.
- **Sound effects and music:** `data-volume` is the gain formula in
  [`audio-and-sfx.md`](../../references/audio-and-sfx.md), computed from `voice_lufs`;
  `node library/search.mjs <term> --voice <voice_lufs>` prints it. `media-use` defaults to `volume: 0.35`
  for SFX and 0.12 for BGM **[media-use]**.
- **With carve**, leave the bed's `data-volume` at 1: the carve writes its own gain. Each voice phrase has
  `data-audio-group="voice"`, and that group carries no music or effects. Classic ducking (a `volume` lane)
  does not replace the carve, and a track has a volume lane or a volume tween, never both.

### Tracks (`data-track-index`)

One element type per track, so the timeline reads well in Studio (`hyperframes-studio`):

| Track | What goes there |
|---|---|
| 1 | product video pieces |
| 2 | freeze frames |
| 3 | graphics |
| 4 | chapter title cards |
| 5 | edge badge |
| 6 | labels |
| 10–19 | sound effects |
| 20 + n | voice for chapter n (one track per chapter; otherwise `lint` thinks the voices of two chapters overlap) |
| 40 | music |

## 3. The generator pattern

A tutorial several minutes long is not written by hand: the HTML is **generated** from data, so a clip can
be re-recorded or a phrase regenerated without redoing the edit.

```
chapters.mjs (script: what is read, with anchors)
   └─ gen-voice.mjs ───→ assets/voice/chNN.mp3 + chNN.json (alignment) + volumes.json + durations.json
record.mjs (Playwright)
   └─────────────────→ assets/clips/NN-*.webm → NN-*.mp4 (H.264) + NN-*.marks.txt
gen-video.mjs + edit-engine.mjs
   └─────────────────→ compositions/chNN.html + chNN.motion.json + index.html + data/timeline.json
                        (fails and writes nothing if a rule is broken)
```

**Templates** (copied to the project root):

- `templates/gen-video.example.mjs`: a complete, tested generator, with clean `lint` and `check` on
  synthetic data. Only the "what is specific to this video" section changes: `STEPS`, `EDIT`, `ZOOMS`,
  `GRAPHICS`.
- `templates/edit-engine.mjs`: the engine. `build()` places screen and voice on the chapter's clock,
  `review()` applies the rules, plus `markReader`, `splitPhrases`, `wordTime`, `freezeFrame` and
  `phraseHtml`. The input and output schema is documented in each function's comment.
- `templates/record.example.mjs`: Playwright at 1920×1080, with the marks measured from page creation and
  the conversion to H.264 with a short GOP.

**How a chapter is described** (`EDIT`):

```js
"01": [
  { clip: "01", spans: [t1(m("01", "opens Banking"), m("01", "picker open"))],
    phrases: [["In Banking", m("01", "opens Banking")]] },
  { clip: "01", spans: [t1(m("01", "file chosen"), m("01", "table loaded"), 1.5)],
    phrases: [["The file your bank exports", m("01", "file chosen")]] },
  { graphic: "transaction", phrases: ["Once you upload it"] },
],
```

- `m(clip, text)`: the second of the clip's mark that contains that text. Fails if it matches zero lines or
  more than one.
- `t1(from, to, speed)`: a contiguous span of the clip. Several spans in one segment have to be
  contiguous; a forward jump is another segment (a cut).
- A phrase with a second comes in when the clip reaches that point. If the previous one is still playing,
  the clip freezes until it ends. A phrase without a second follows the previous one.
- `short: true` allows a shot shorter than 5 s; `waitForVoice: false` lets the phrase keep playing over the
  next shot.
- A graphic declares its rows with each one's anchor. The generator works out when each row enters, passes
  it to `review()` and writes the `.motion.json`.

**What `review()` receives**: `[{ ch, shots, phrases, zooms }]`.

- Clip shots: `{ id, type: "clip", clip, source: [from, to], start, end, short, speeds,
  freezes: [{ second, expected }] }`. That is what `build()` returns, plus the `id`.
- Graphics: `{ id, type: "graphic", start, end, wordAt, entries: [{ what, at, wordTime }] }`.
- Zooms: `{ scale, inDur, start, end, shot }`.
- Phrases: the ones from `build()`; `silenceJustified: true` lets a long gap before that phrase through.

**Checks** (if any fails, it exits with an error and writes nothing):

| Check | Default threshold (`RULES`) |
|---|---|
| No going back or returning to an earlier clip | 0 s repeated |
| Minimum shot | 5 s (except `short`) |
| Maximum speed of a span | ×1.5 |
| Gap between phrases | ≥ 0.4 s |
| Silence without voice | warning > 3 s; fails > 6 s unless `silenceJustified` |
| Graphic before its word | ≤ 0.5 s (and not later than 0.6 s) |
| Graphic without content | ≤ 1 s |
| Element anchored to its word | ≤ 0.6 s away |
| Zoom | ≤ 1.10, ≥ 1.5 s to zoom in, at least two phrases since the previous zoom, fits entirely in its shot |
| Freeze from the right second | ≤ 0.1 s off the clip's second |
| Unique anchor, present and in order | `gen-voice.mjs` before paying for synthesis, and `splitPhrases` |

`data/timeline.json` stores the global times of each chapter (with its `timestamp` for the description), of
each phrase and of each shot. Also the `frozen` time of each shot and the `firstContent` of each graphic:
those are the seconds to look at in the review.

## 4. Pitfalls already hit

- **Freeze from the wrong second.** If the still frame comes from before an animation finishes (a modal
  opening), the modal seems to open and close. `freezeFrame` extracts at `t - 0.04 s` from the second the
  clip is at, and near the end of the file it uses `-sseof`. `review()` compares the second.
- **Windows: Chromium and Playwright are run with `node`, not with `bun`.** The `playwright` version has to
  match the Chromium installed in the `ms-playwright` folder of Playwright's cache. If not,
  `npx playwright install chromium`.
- **Playwright clips (`.webm` VP8/VP9).** They are not edited directly: `autoProxy` only makes a copy if
  Chrome says it cannot play the format, and with VP9 it usually says it can; the preview stutters when
  seeking. `record.mjs` leaves an H.264 `.mp4` with a 15-frame GOP, and the edit uses that one. Render with
  `--video-frame-format png`, as the CLI recommends for screen recordings.
- **The voice is regenerated only per chapter** (`node gen-voice.mjs 05 --redo`) and measured in LUFS. The
  mp3 is never re-encoded: it shifts the alignment.
- **The `loudnorm` report goes to stderr.** Reading stdout gives nothing, and the measurement is lost without
  an error.
- **An anchor repeated within the chapter** makes the visual come in at the wrong occurrence. Anchors have
  to be unique; if not, make them longer.
- **An `<audio>` without an `id`** is not picked up by the mixer: the render comes out silent. `lint` flags
  it as `media_missing_id`.
- **An even `stagger` on a graphic's rows** brings in rows the voice has not named yet. Each row is anchored
  to its word.
- **The edge badge gets covered by the video** if it does not have a `z-index` above the shots: `check`
  flags it as `text_occluded`.

## 5. Review loop with `npx hyperframes`

Use the version pinned in the project's `package.json`, and check once whether it is out of date
(`hyperframes/SKILL.md`, "Keep the project's CLI current").

1. `node gen-video.mjs`: it has to finish with no broken rules.
2. `npx hyperframes lint` while iterating.
3. `npx hyperframes check` as the final gate. **Do not chain `lint` before it**: `check` includes it. On the
   first full pass, add `--snapshots`.
4. **Snapshots every 0.5 s on each graphic**, with the times from `data/timeline.json`:

   ```bash
   npx hyperframes snapshot --at 258.0,258.5,259.0,259.5,260.0 --no-end --describe false -o tmp/snap-p13
   ```

   - `--no-end` keeps it from adding the final frame.
   - `--describe false` keeps it from calling Gemini, which costs money and runs by default if
     `GEMINI_API_KEY` is in the environment.
   - `-o` takes the images out of the project: `snapshots/` mixes old runs with the ones from `check`.
5. **Contact sheet** per group: `node contact-sheet.mjs tmp/snap-p13` writes `sheet-1.jpg`, `sheet-2.jpg`… (12 frames each, read by rows). Look at the sheets, not 20 loose images. One image per group and per phase, not one per frame:
   every attached image makes the context more expensive **[hyperframes/production-loop]**.
6. `npx hyperframes preview --background`: give the URL to the person and ask whether they will review it or
   it should be rendered.
7. **Render only with approval**, and with `--video-frame-format png`:
   - `--quality draft` while iterating;
   - `looks` for the first real render;
   - `delivery` for the final delivery.
   Then, the loudness master on the file ([`audio-and-sfx.md`](../../references/audio-and-sfx.md)), and `ffprobe` to confirm that the duration
   matches the root `data-duration`.

## Sources

- `~/.claude/skills/hyperframes/SKILL.md` (§ 1 state, § 2 routes, § 5 skills by need) and `references/production-loop.md`.
- `~/.claude/skills/general-video/SKILL.md` (plan, `STORYBOARD.md`, workers, `.motion.json`).
- `~/.claude/skills/hyperframes-core/references/creator-editing-recipes.md` and `variables-and-media.md`.
- `~/.claude/skills/hyperframes-audio/SKILL.md` ("Voiceover carve", "One bus for many tracks").
- `~/.claude/skills/hyperframes-cli/SKILL.md` and `references/lint-validate-inspect.md`; `npx hyperframes snapshot --help` and `render --help` (0.8.123).
- `~/.claude/skills/hyperframes-studio/SKILL.md` § 4.
- **[media-use]**: `~/.claude/skills/media-use/audio/references/{sfx,bgm}.md`.
