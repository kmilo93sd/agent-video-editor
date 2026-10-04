# Recipe: narrated screen tutorial

A software tutorial where the viewer **repeats the flow with the app open next to it**. Everything here
follows from that: people don't understand that fast. This recipe is also the reference pipeline the skill
was born from, and it ships tested templates for it:

- recording with Playwright;
- a synthetic voice (ElevenLabs) generated per chapter with word alignment;
- an edit generated from data with HyperFrames, which **fails if a rule is broken**.

The craft rules (sections 1–4) apply whatever the tools. If you record with OBS or Screen Studio and cut in
Premiere or Resolve, follow them and skip the template commands. Sources at the end; `[house]` means a rule
learned reviewing real cuts of this kind of video (see "Why the house rules win").

## Contents

- [1. Hard rules for this recipe](#1-hard-rules-for-this-recipe)
- [2. Process with the reference pipeline](#2-process-with-the-reference-pipeline)
- [3. Recording](#3-recording)
- [4. Editing](#4-editing)
- [5. Hook, chapters and structure](#5-hook-chapters-and-structure)
- [6. Audio in a tutorial](#6-audio-in-a-tutorial)
- [7. Why the house rules win](#7-why-the-house-rules-win)
- [8. Checklist for this recipe](#8-checklist-for-this-recipe)
- [Sources](#sources)

Supporting files, loaded only when that step comes up:

| File | When |
|---|---|
| [`narrated-screen-tutorial/voice.md`](narrated-screen-tutorial/voice.md) | Writing the script for a synthetic voice, generating it with ElevenLabs, LUFS per chapter, verifying with whisper |
| [`narrated-screen-tutorial/hyperframes-generator.md`](narrated-screen-tutorial/hyperframes-generator.md) | Building the edit with the HyperFrames generator: the data schema, tracks, its checks, pitfalls and the review loop |
| `narrated-screen-tutorial/templates/` | `record.example.mjs`, `gen-voice.mjs`, `verify-voice.mjs`, `gen-illustrations.mjs`, `gen-video.example.mjs` + `edit-engine.mjs`, `contact-sheet.mjs`, and examples of `chapters.mjs` and `illustrations.mjs`. Copied to the video project's root (`gen-video.example.mjs` as `gen-video.mjs`, `record.example.mjs` as `record.mjs`); each one has `--help` |

## 1. Hard rules for this recipe

These come on top of the core rules in `SKILL.md`.

1. **The screen leads and the voice adapts.** The clip never goes back or repeats a second, and never
   returns to a clip it already left. Each phrase comes in when what it describes happens; if the phrase
   lasts longer than the action, the result is frozen at the right second **[house]**.
2. **Speed: 1× for navigation, clicks and results; typing at 1.5× at most.** Whatever is left over is
   removed with a clean cut, not sped up further **[house]**.
3. **Shots of ≥ 5 s**, and never a cut in the middle of an app animation (a modal opening, a loading
   state) **[house]**.
4. **A form is never visibly cut.** Waits where no pixel changes are cut; the typing itself is shown, at
   1.5× at most **[house]**. Seeing a form get typed twice, or jump half-filled, confuses more than any
   silence.
5. **Zoom only on the detail the voice names**: up to 1.10, ≥ 1.5 s to zoom in, one every two phrases,
   always within a single shot **[house]**.
6. **Fake demo data only**: a fictional company and people, a local environment, never a production
   mirror, even if the data "looks" like test data. The labels the voice names match what the screen shows
   **[house]**.
7. **≥ 0.4 s between phrases**; a warning at 3 s without voice and a hard cap at 6 s, unless the screen
   shows a self-explanatory action **[house]**.
8. **Synthetic voice:** acronyms and numbers written as they are pronounced, verified with whisper; never
   re-encoded; keys and the voice id only in the `.env`. Detail in `voice.md`.
9. **Chapter cards**: each chapter opens with a 3 s title card ("Step 2 of 5"); hard cuts inside a
   chapter **[house]**.

## 2. Process with the reference pipeline

| # | Step | What happens | Where |
|---|---|---|---|
| 1 | **Brief** | Audience, destination, length, chapters, voice, music or not, brand skin. With HyperFrames, go through the `hyperframes` skill: it writes `BRIEF.md`, and a narrated tutorial goes to `general-video` | `hyperframes-generator.md` § 1 |
| 2 | **Script** | By chapter, with what is on screen in brackets. Demo data, no stock phrases, acronyms and numbers written as pronounced in the `vo` field. Hook: the result first | `voice.md`, § 5 here |
| 3 | **Recording** | `record.mjs` (Playwright) on the demo company: 1920×1080, one clip per block, marks by text, H.264 `.mp4`. On Windows, with `node` | § 3 here |
| 4 | **Voice** | `gen-voice.mjs`: one take per chapter with alignment, LUFS per chapter, verified anchors; then whisper and `verify-voice.mjs` | `voice.md` |
| 5 | **Edit** | `gen-video.mjs` (from `gen-video.example.mjs` + `edit-engine.mjs`) generates the compositions from the script, the marks and the alignment, and fails if a rule is broken. Graphics for concepts, illustrations with `gen-illustrations.mjs`, sound effects from [`library/`](../library/) | `hyperframes-generator.md` |
| 6 | **Review** | The generator's checks, `npx hyperframes check`, snapshots every 0.5 s on graphics, `contact-sheet.mjs`, listen with headphones; then the core checklist | § 8 here, [`../review-checklist.md`](../review-checklist.md) |
| 7 | **Render** | Only with approval. `draft` → `looks` → `delivery`, with `--video-frame-format png`. Master to -14 LUFS / -1 dBTP | `hyperframes-generator.md` § 5 |
| 8 | **Publishing** | Title with the search query first, thumbnail that shows the result, chapters from `data/timeline.json`, a linked written guide | [`../references/thumbnail-title-description.md`](../references/thumbnail-title-description.md) |

## 3. Recording

1. **Demo data, never real data** (rule 6).
2. **1920×1080 full-bleed** and text legible on a phone. Record with the browser or app zoom at 125–150 %
   when the UI is dense **[Envision; legibility.info]**. If something looks small in the recording, it cannot
   be read on a phone: fix it before recording, not with zoom in the edit.
3. **Playwright with marks**, with `templates/record.example.mjs` copied into the project.
   - Set `viewport` and `recordVideo.size` to 1920×1080. Without that, Playwright records at 800×450 and
     rescales without warning.
   - Each action writes a `12.34s opens Banking` line to `<clip>.marks.txt`, measured from when the page is
     created, which is when the video starts.
   - The generator finds marks by text, not by second. When a clip is re-recorded with the same file name,
     the edit readjusts itself, and fails saying which mark is gone **[house]**.
   - Playwright records `.webm` at a low bitrate. The template converts it to H.264 `.mp4` (CRF 14, 15-frame
     GOP): it looks sharper when zoomed and the preview seeks well.
4. **On Windows, Chromium and Playwright are run with `node`, not with `bun`** **[house: pitfall already
   hit]**.
5. **Cursor with a purpose.** Move it only to go to the next click and keep it still while the voice
   explains. If the cursor looks small at 1080p, enlarge it (≥ 20 px visible) **[Envision]**.
6. **Real typing, at human speed.** Record with a per-key `delay`; in the edit it can go up to 1.5× at most.
7. **One clip per action block**, not one clip per video. Re-recording a step does not force re-recording
   everything.

## 4. Editing

1. **The screen leads.** Voice per phrase, placed when what it describes happens. If the action lasts
   longer than the phrase, the screen plays on its own; if the phrase lasts longer, the result is frozen.
   This is temporal contiguity: word and image together, not one after the other **[Mayer, study]**.
2. **Freeze instead of repeating.** The frozen frame is taken from the exact second the clip is at.
   **Pitfall already hit:** a freeze taken from before the modal finished opening makes the modal seem to
   open and close.
3. **Remove dead time** (loading, waiting, searching for a button) with clean cuts, not speed-ups. Screen
   Studio and similar tools speed typing up 2–5× **[Screen Studio, creator]**; it was tried on a real cut and
   could not be followed **[house]**.
4. **Guide the eye with framing, not arrows.** The recording's cursor already marks the click. Screencast
   tools suggest zooms of 1.5×–4× entering in 100–500 ms **[Envision, creator]**; that makes viewers who
   follow on another screen dizzy, so this recipe uses 1.10 (rule 5).
5. **On-screen text only for what is typed or searched for**: an expanded acronym, a menu path, a key. Do
   not duplicate in text what the voice says (redundancy principle) **[Mayer, study]**.
6. **Graphics and illustrations for what the screen does not show** (how a journal entry is built, what a
   contribution is), then the data in the app: the graphic explains, the screen proves the app does it
   **[house; Mayer: multimedia principle]**. Context illustrations with `gen-illustrations.mjs`, always
   without text inside the image.
7. **J and L cuts** are rarely used: the voice should name what is already on screen. Where they help is on
   the way out of a chapter card, with a 0.6 s breath before the first phrase **[house]**.
8. **Nothing decorative.** Animation, music or b-roll that explains nothing distracts (coherence principle)
   **[Mayer, study]**.

## 5. Hook, chapters and structure

- **Hook of 10–20 s** that shows the end state first (the closed report, the confirmed month) and says what
  will be achieved with which data **[house]**. No logo intro: the logo goes on a card over the result.
- **Chapters**: a 3 s title card per chapter, its content entering in 0.55 s, plus an **edge badge** with
  the step's name for viewers who land mid-video. In tutorials people rewatch and jump to the part they
  need, and large text at transitions helps **[Guo 2014, study]**.
- **Blocks under 6 min**; people watch 2–3 min of each video on average whatever its length **[Guo 2014,
  study]**. For a long process, NN/g recommends one video per step **[NN/g]**.
- **A written guide** with the same content and the video embedded, for people who cannot have sound on
  **[NN/g]**.

## 6. Audio in a tutorial

- **No music by default**: the viewer is listening to instructions, and music that adds nothing hurts
  learning **[house; Mayer: coherence]**. Music, if any, in the intro, the title cards and the closing.
- **No sound effect on the real recording's clicks**, and no whoosh on cuts within a chapter: those cuts are
  continuity, not transitions **[house]**.
- Sound effects on title cards, graphics and rows: see the table in
  [`../references/audio-and-sfx.md`](../references/audio-and-sfx.md), with files from
  [`../library/`](../library/).

## 7. Why the house rules win

Creator figures (2–3 s per shot, an interrupt every 5–7 s) come from entertainment and talking-head videos.
In a software tutorial the bottleneck is that the viewer **follows the action and repeats it**.

The first cut of the reference tutorial tied the screen to the voice: 45 shots in 5 minutes, with spans at
×3 and ×10, and it could not be followed. The rules above come from that review (4-Oct-2026). When an
external figure clashes with them, the house rule wins in this recipe, and that is stated.

## 8. Checklist for this recipe

Run it before the core [`review-checklist.md`](../review-checklist.md). With the reference pipeline, the
first block is automatic; with other tools, check the same things by hand.

**Automatic**

- [ ] `node gen-voice.mjs` with nothing pending: every anchor matches, none repeated; no chapter more than
  4 dB from the median.
- [ ] `node verify-voice.mjs NN tmp/trans-NN/transcript.json` read span by span for every new or regenerated
  chapter: no acronym read as a word, no number said differently, no swallowed word. It exits 1 on any
  difference and spelled-out acronyms always differ, so it is read, not used as a gate.
- [ ] `node gen-video.mjs` finishes with no broken rules: no going back or return to a clip; shots ≥ 5 s
  (except `short`); no span above ×1.5; ≥ 0.4 s between phrases and no silence > 6 s without
  `silenceJustified`; graphics anchored (≤ 0.5 s before, content within 1 s, each element ≤ 0.6 s from its
  word); zooms ≤ 1.10, ≥ 1.5 s in, one every two phrases, never across a cut; each freeze ± 0.1 s from the
  clip's second.
- [ ] `npx hyperframes check` with no errors (first pass with `--snapshots`).
- [ ] Script free of the blocklist phrases in `voice.md`.

**In `data/timeline.json`**

- [ ] `frozen` per shot: above ~6 s, the voice says more than the screen shows. Add a graphic, split the
  phrase or re-record.
- [ ] Chapter length: blocks under 6 min if possible.

**By eye, with snapshots** (how to take them: `hyperframes-generator.md` § 5)

- [ ] Freezes show the finished result, with no visible jump from the last moving frame.
- [ ] Title cards inside title-safe; the edge badge visible over product footage, hidden under graphics.
- [ ] The zoom lands on the detail the voice names, and UI text stays sharp at 1.10.
- [ ] Every name, ID and amount belongs to the demo company; buttons the voice names say the same on screen.
- [ ] No form is seen jumping half-filled.

**Listen**

- [ ] The voice does not get louder or quieter between chapters; acronyms sound spelled out.
- [ ] No click from the real recording has a sound effect on top.

## Sources

- **[house]**: rules from the reference tutorial, reviewed on 4-Oct-2026.
- **[Mayer]**: Mayer (2008), "Applying the science of learning", *American Psychologist* 63(8): multimedia, coherence, signaling, redundancy, temporal contiguity and segmenting principles. https://doi.org/10.1037/0003-066X.63.8.760
- **[Guo 2014]**: Guo, Kim & Rubin, "How video production affects student engagement", L@S 2014. https://pg.ucsd.edu/publications/edX-MOOC-video-production-and-engagement_LAS-2014.pdf
- **[NN/g]**: "Instructional video guidelines". https://www.nngroup.com/articles/instructional-video-guidelines/
- **[Envision]**: "Best practices for screencast". https://www.envision.everspringpartners.com/build/best-practices-for-screencast
- **[legibility.info]**: https://legibility.info/rules-for-text-in-videos
- **[Screen Studio]**: "Speed up typing segments". https://screen.studio/guide/speed-up-typing-segments
