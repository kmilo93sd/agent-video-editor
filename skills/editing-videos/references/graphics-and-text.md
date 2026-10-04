# Graphics, on-screen text and captions

When to add a graphic or text, how long it lasts, how it enters, how to caption, and how it reads on a
phone. The tool that draws it does not matter: the numbers hold in an NLE's titler, in ffmpeg, in Remotion or
in HyperFrames (`tools.md`). Sources at the end.

## Contents

- [When to use a graphic](#when-to-use-a-graphic)
- [Anchored to speech, never empty](#anchored-to-speech-never-empty)
- [How long on-screen text lasts](#how-long-on-screen-text-lasts)
- [Captions and subtitles](#captions-and-subtitles)
- [Zoom and punch-in](#zoom-and-punch-in)
- [Entrances and exits](#entrances-and-exits)
- [Safe zones](#safe-zones)
- [Legibility on a phone](#legibility-on-a-phone)
- [Brand consistency](#brand-consistency)
- [Sources](#sources)

## When to use a graphic

1. **To show what the camera cannot**: a concept, a comparison, a number, a timeline, a map. Words with
   images teach more than words alone **[Mayer, study]**.
2. **To mark structure**: a section title, a lower third with a name, a step counter.
3. **Never decorative.** If the graphic can be removed without losing anything, it is not needed
   **[Mayer: coherence]**.
4. **Do not repeat the voice in text.** Narration plus the same text on screen teaches worse than narration
   alone (redundancy) **[Mayer]**. Text for what is not said: a name, a number, a key term, a link.
   Captions are the exception: they are an accessibility layer, not a graphic.

## Anchored to speech, never empty

A graphic that sits empty waiting for the voice reads as a mistake. In the first cut of the reference
tutorial a journal entry graphic sat for about 5 s as an empty frame. The rules that came out of it hold for
any narrated video **[house]**:

| Rule | Number |
|---|---|
| The graphic enters before the word that introduces it | **at most 0.5 s** before |
| Its first element with content appears | **within the first second** |
| Each row or element enters when the voice names it | **≤ 0.6 s** from its word |
| No card, table or frame stays without content | **for more than 1 s** |
| It stays after its last phrase | ~1.2 s, then leaves |

Elements enter **anchored to the words that name them** (from a transcript with word timings), not with an
even stagger: an even stagger brings in elements the voice has not named yet. Any tool that gives word
timestamps works: whisper, the NLE's transcript, a TTS alignment.

## How long on-screen text lasts

- **0.33 s per word** (160–180 words/min) **[BBC]**, or **20 characters/s** for adults and 17 for children
  **[Netflix-style]**.
- Minimum **20 frames (≈ 0.83 s)** per event **[Netflix-timing]**.
- Practical formula: `duration = max(1.5 s; words × 0.33 s + 0.5 s)`. The extra half second is for finding
  the text before reading it **[derived from BBC; the extra is house]**.
- A label that goes with the voice enters with its word and stays **until 0.6 s after it has been said, and
  never less than the formula above** **[house]**.

## Captions and subtitles

**Why:** many people watch without sound, and captions are what makes a video accessible **[NN/g]**.
YouTube's automatic captions can misrepresent speech because of accents, dialects or background noise, so
review them before publishing **[YT-auto-captions]**.

**Delivery formats:** YouTube accepts uploaded caption files, including SubRip (`.srt`), WebVTT (`.vtt`),
SubViewer (`.sbv`) and TTML **[YT-caption-formats]**. An uploaded file is searchable and switchable; burned-in
captions are neither, but they are the norm on Shorts, Reels and TikTok, where the style is part of the edit.

**Timing and layout** (closed captions, standard style) **[Netflix-style; Netflix-timing]**:

| What | Value |
|---|---|
| Characters per line | **≤ 42** |
| Lines | **≤ 2** |
| Reading speed | ≤ 20 characters/s for adults, ≤ 17 for children |
| Minimum duration | 20 frames (≈ 0.83 s) |
| Gap between events | at least 2 frames; either 2 frames or ≥ 0.5 s |
| After the speech ends | the caption stays ~0.5 s if nothing follows |
| Shot changes | start on the cut if speech starts within 0.5 s of it; end on the cut if within 0.5 s; cross a cut only if the speech does |
| Line breaks | after punctuation, before conjunctions or prepositions; never split an article from its noun or a first name from a last name |

**Burned-in social captions** (Shorts, Reels, TikTok) **[creator practice]**:

- 1–5 words per page, timed to the words, often highlighting the active word;
- large, bold sans-serif with an outline or a box for contrast over any background;
- placed above the platform's bottom UI and away from the right-hand buttons (see Safe zones);
- every page still respects the 20-frame minimum.

## Zoom and punch-in

- **Motivated by what is said**: the zoom goes to the detail the voice names, or punches in to stress a
  line. A zoom that points at nothing is noise **[house]**.
- **A zoom never crosses a cut**: it starts and ends within one shot **[house]**.
- **One at a time.** Space them out; Envision suggests 5–7 s between screencast zooms **[Envision,
  creator]**. Constant zooming reads as nervous.
- **Punch-in on a talking head**: a cut to 110–120 % on every other jump cut, or a crop from a higher
  resolution recording, so the image stays sharp **[creator practice]**. Beyond the source's resolution it
  gets soft.
- **Slow push-in** (a scale that creeps over seconds) for emotion or emphasis; a **hard punch-in** for a
  joke or a beat. How far and how fast depends on the type; screen recordings need much less (see
  [`narrated-screen-tutorial.md`](../recipes/narrated-screen-tutorial.md)).

## Entrances and exits

- **In UI**, Material Design uses 225 ms to enter, 195 ms to exit and 375 ms for large transitions, and
  warns that over 400 ms feels slow **[Material Design]**. That is for interfaces.
- **In video**, the text has to be seen entering **[house]**:
  - 0.35–0.6 s for cards and headlines, eased out, no bounce;
  - 0.3 s for rows;
  - 0.25 s for exits.
- **Vary speed on purpose**: the slowest animation in a scene lasts about 3× the fastest
  **[motion-principles]**.
- **No bounce or elastic on serious content**; a soft overshoot only on a call to action **[house]**.
- A short entrance with a 20–40 px offset plus opacity. Nothing that spins, bounces or zooms from 0.

## Safe zones

- Visible content inside the **90 % action-safe** (5 % margin per side) and text and key content inside the
  **80 % title-safe** (10 % per side). These are Premiere's default safe margins **[Adobe-safe]**.
- **Last 5–20 s** of a YouTube video: keep clear the area where end screen elements will go
  **[YT-end-screens]**.
- **Vertical (9:16)**: the platform's UI covers the bottom (caption, channel name) and the right side
  (buttons). Keep captions and key content in the central area and check in the platform's own preview. No
  official percentages could be verified; do not invent them.
- Lower thirds and badges stay clear of the player's progress bar.

## Legibility on a phone

- Body text **≥ 40–60 px tall at 1080p**; titles ~50 % larger **[legibility.info]**.
- Contrast **≥ 4.5:1** for normal text (WCAG AA) **[WebAIM]**. Over video, put text on a solid or scrimmed
  card, or give it an outline.
- At most one idea per card. If more than ~12 words have to be read while the voice talks about something
  else, voice and text compete **[Mayer]**.
- There is no official YouTube figure for the share of views from phones. Third-party figures (60–70 %)
  could not be verified; design for phones anyway.

## Brand consistency

- One skin across intro, cards, graphics, captions and closing: same palette, typography, radius, shadow
  and animation curve. Define it once (a style sheet, an NLE template, a design file) and reuse it.
- The brand appears where there is no content to show; footage does not need a frame around it.

## Sources

- **[house]**: rules learned reviewing real cuts; the never-empty rules come from the reference tutorial.
- **[Mayer]**: Mayer (2008), *American Psychologist* 63(8). https://doi.org/10.1037/0003-066X.63.8.760
- **[BBC]**: BBC Subtitle Guidelines, 160–180 words/min, read through https://www.clevercast.com/bbc-subtitling-guidelines/ because the BBC page did not load.
- **[Netflix-style]**: Netflix, "English (USA) Timed Text Style Guide" (42 characters per line, 2 lines, 20/17 cps, line breaks). https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977
- **[Netflix-timing]**: Netflix, "Subtitle Timing Guidelines" (20 frames minimum, 2-frame gaps, shot changes). https://partnerhelp.netflixstudios.com/hc/en-us/articles/360051554394
- **[YT-auto-captions]**: YouTube Help, "Use automatic captioning". https://support.google.com/youtube/answer/6373554
- **[YT-caption-formats]**: YouTube Help, "Supported subtitle and closed caption files". https://support.google.com/youtube/answer/2734698
- **[NN/g]**: https://www.nngroup.com/articles/instructional-video-guidelines/
- **[Material Design]**: https://m1.material.io/motion/duration-easing.html
- **[Adobe-safe]**: Premiere Pro's default safe margins (action 10 %, title 20 % of the frame in total), also used by the HyperFrames preview (`hyperframes-studio` § 4).
- **[Envision]**: https://www.envision.everspringpartners.com/build/best-practices-for-screencast
- **[legibility.info]**: https://legibility.info/rules-for-text-in-videos
- **[WebAIM]**: https://webaim.org/articles/contrast/
- **[YT-end-screens]**: https://support.google.com/youtube/answer/6388789
- **[motion-principles]**: `hyperframes-creative/references/motion-principles.md`; the ratio holds in any animation tool.
