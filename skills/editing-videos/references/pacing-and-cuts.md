# Pacing and cuts

Every number carries its source in brackets; the list is at the end. When sources disagree, each one's range
is shown, without averaging. Source types:

- **official**: platform or vendor documentation;
- **study**: published research;
- **creator**: blogs or analyses by creators or tools, useful but without public data behind them;
- **house**: a rule learned by reviewing real cuts. Here only the ones that hold for any video; the ones
  tied to one kind of video live in its recipe.

## Contents

- [Pacing table by video type](#pacing-table-by-video-type)
- [What a cut is for](#what-a-cut-is-for)
- [Shot length](#shot-length)
- [J and L cuts](#j-and-l-cuts)
- [Jump cuts: when they are fine](#jump-cuts-when-they-are-fine)
- [B-roll](#b-roll)
- [Transitions](#transitions)
- [Length and segmentation](#length-and-segmentation)
- [Sources](#sources)

## Pacing table by video type

"Change" means anything that renews what is seen: a cut, a punch-in, b-roll, a graphic or text. Where a
cell says "no serious source", decide by the content and say so.

| Type | How often what is seen changes | Shot length | Silence between phrases | Transitions | Recipe |
|---|---|---|---|---|---|
| **Talking head** | 2–5 s per shot, with jump cuts and punch-ins **[Ali Abdaal via blogs, creator]**; first 3 min every 10–15 s **[air.io, creator]** | No floor from a serious source; one idea per shot | 200–400 ms **[Syllaby, creator]**; Descript's gap shortener targets ~250 ms **[Descript, official for the tool]** | Hard cuts; a dissolve only for a change of topic | [`talking-head.md`](../recipes/talking-head.md) |
| **Vlog** | Driven by events, not a clock; film averages ≈ 4–5 s per shot **[Cutting 2011, study, film]** | Hold establishing shots long enough to read the place; no serious source for a number | Natural, with room tone under any gap | Cuts; match cuts and dissolves for time or place changes **[StudioBinder]** | [`vlog.md`](../recipes/vlog.md) |
| **Explainer** (voice over graphics or b-roll) | First interrupt at 25–35 s, then every 2–3 min **[air.io, creator]**; a "micro-hook" every 30–60 s **[TubeBuddy, creator]** or every 60–90 s **[vidIQ, creator]** | Film ≈ 4–5 s **[Cutting 2011]** | 200–400 ms **[Syllaby]** | Premiere's default dissolve is 1 s **[Adobe, official]** | none yet; use the core |
| **Screen tutorial** | When the action changes, not by the clock **[house]** | ≥ 5 s **[house]** | ≥ 0.4 s **[house]** | Hard cut within a step; a title card between steps | [`narrated-screen-tutorial.md`](../recipes/narrated-screen-tutorial.md) |
| **Podcast / interview** | Cut on speaker changes and meaningful reactions, not on a timer. No serious source for a frequency | Wide shot to re-establish, close-ups while someone talks; no serious source for numbers | Keep the conversation's natural pauses; cut only dead air and false starts | Hard cuts between angles | [`podcast-to-youtube.md`](../recipes/podcast-to-youtube.md) |
| **Short / Reel / TikTok** | 2–3 s per shot **[OpusClip, creator]**; something new every 5–7 s **[MrBeast analysis, creator]**; the first 3 s decide **[TikTok via blogs, creator]** | ~2 s floor if it carries text; 4 s max **[OpusClip, creator]** | 200–300 ms **[Syllaby]** | Hard cut, or 0.2–0.4 s | [`shorts-from-long-form.md`](../recipes/shorts-from-long-form.md) |

On-screen text has its own floor in every type: `max(1.5 s; words × 0.33 s + 0.5 s)`
(`graphics-and-text.md`). A shot carrying text never ends before its text can be read.

## What a cut is for

A cut is justified when it does at least one of these **[house]**:

1. **Removes dead time**: a pause, a false start, a wait, a repeated take. YouTube recommends planning cuts
   from the script and using jump cuts to remove filler **[YT-editing, official]**.
2. **Changes the information**: a new angle, the thing being talked about, a reaction.
3. **Follows the action**: cut on movement (a door opening, a hand reaching), so the motion hides the cut.

A cut that does none of these is noise. Never cut in the middle of a word, and avoid cutting in the middle
of a movement unless you are cutting on that action.

## Shot length

- **Average shot length in current film ≈ 4–5 s** **[Cutting 2011, study, film]**. It is a reference, not a
  target: dialogue scenes hold longer, action shorter.
- **Talking-head YouTube runs faster, 2–5 s per shot** **[Ali Abdaal via blogs, creator]**, because each
  cut removes a pause or adds a punch-in.
- **Verticals are faster again**: 2–3 s per shot, 4 s max **[OpusClip, creator]**.
- **Varied pacing, not even.** Alternate quick runs with a longer hold where the key point lands. For
  animation, the slowest move in a scene lasts about 3× the fastest **[hyperframes-creative/motion-principles]**.
- **The floor is legibility**: a shot must last as long as its text and its key detail take to read.

## J and L cuts

- **J cut**: the audio of the next shot starts before its picture. **L cut**: the audio of the current shot
  continues over the next picture **[TechSmith]**.
- Use them to soften a change of scene or speaker: in an interview, hear the answer start on the asker's
  face (J), or keep the speaker's last words over b-roll (L).
- Typical offset: a few frames to a couple of seconds. There is no serious source for a number; judge by
  whether the overlap is noticed.
- They matter most in interviews, vlogs and explainers. In a screen tutorial the voice should name what is
  already on screen, so they are rare there.

## Jump cuts: when they are fine

A jump cut is a cut between two shots of the same subject from (nearly) the same framing, so the subject
seems to jump. In film grammar it is an error; on YouTube it is an accepted way to remove filler from a
single-camera talking head **[YT-editing, official]**.

- **Fine**: one person talking to camera, removing pauses and fluffs; a deliberate time-lapse feel in a
  vlog.
- **Soften it** when it feels harsh: alternate a punch-in (scale 110–120 % or a crop from a higher
  resolution source) on every other cut, or cover the cut with b-roll **[creator practice]**.
- **Not fine**: in an interview or a multicam edit, where a real angle change is available; or when the cut
  leaves the subject in mid-gesture.

## B-roll

- **It shows what is being said.** Each b-roll shot illustrates the phrase on top of it; decorative b-roll
  that explains nothing distracts (coherence principle) **[Mayer, study]**.
- **Enter and leave on phrases**, not mid-word; an L cut out of b-roll back to the speaker reads naturally.
- **Hold a b-roll shot until its content is read**: a product close-up, a sign, a screen. A short insert
  that cannot be read is worse than none.
- **It covers jump cuts** and continuity errors.
- **License every clip** (`licenses.md`).

## Transitions

- **Cut = continuity.** **Dissolve = passage of time or a change of place or topic.** **Fade to black = end
  of a block** **[StudioBinder]**.
- Premiere's default dissolve lasts 1 s **[Adobe, official]**.
- UI-style graphic motion enters in ~225 ms and exits in ~195 ms; over 400 ms feels slow in an interface
  **[Material Design, official, for interfaces]**. In video, text has to be seen entering, so the core uses
  0.3–0.6 s (`graphics-and-text.md`).
- Flashy transitions (spins, glitches) on every cut age a video fast. Keep them for a deliberate style.

## Length and segmentation

- In 6.9 million edX sessions, videos under 6 minutes retained much better, and people came back to jump to
  the part they needed **[Guo 2014, study]**. On YouTube that maps to chapters (`hook-and-retention.md`).
- After publishing, the retention report shows where people leave; a dip at a specific moment says what to
  cut or re-edit **[YT-moments, official]**.

## Sources

- **[house]**: rules learned reviewing real cuts; see each recipe for the ones specific to a video type.
- **[Cutting 2011]**: Cutting, Brunick & DeLong, "How act structure sculpts shot lengths and shot transitions in Hollywood film", *Projections* 5(1). https://www.researchgate.net/publication/236964224_On_Shot_Lengths_and_Film_Acts_A_Revised_View
- **[Guo 2014]**: Guo, Kim & Rubin, "How video production affects student engagement", L@S 2014. https://pg.ucsd.edu/publications/edX-MOOC-video-production-and-engagement_LAS-2014.pdf
- **[Mayer]**: Mayer (2008), *American Psychologist* 63(8). https://doi.org/10.1037/0003-066X.63.8.760
- **[YT-editing]**: YouTube Help, "Video editing tips". https://support.google.com/youtube/answer/11221953
- **[YT-moments]**: YouTube Help, "Measure key moments for audience retention". https://support.google.com/youtube/answer/9314415
- **[Adobe]**: Premiere Pro, default transition duration. https://helpx.adobe.com/premiere/desktop/add-video-effects/apply-video-transitions/change-transition-duration-using-the-effect-controls-panel.html
- **[Material Design]**: "Duration & easing". https://m1.material.io/motion/duration-easing.html
- **[StudioBinder]**: "What is a dissolve". https://www.studiobinder.com/blog/what-is-a-dissolve-in-film-definition/
- **[TechSmith]**: "How to edit videos: L-cuts and J-cuts". https://www.techsmith.com/blog/how-to-edit-videos-l-cuts-and-j-cuts/
- **[Descript]**: "Shorten word gaps". https://help.descript.com/hc/en-us/articles/10164807277453-Shorten-word-gaps
- **[Syllaby]**: "Voiceover pacing". https://syllaby.io/blog/voiceover-pacing-silence-trimming-retention-editing/
- **[air.io]**: https://air.io/en/youtube-hacks/advanced-retention-editing-cutting-patterns-that-keep-viewers-past-minute-8
- **[TubeBuddy]**: https://www.tubebuddy.com/blog/youtube-viewer-retention-to-increase-watch-time/
- **[vidIQ]**: https://vidiq.com/blog/post/audience-retention-secrets-youtube/
- **[OpusClip]**: https://www.opus.pro/blog/ideal-youtube-shorts-length-format-retention
- **[MrBeast analysis]**: https://www.a4bcreative.com/post/the-pattern-interrupt-edit-how-to-keep-viewers-hooked-for-the-full-60-seconds
- **[Ali Abdaal via blogs]**: https://techbullion.com/an-ultimate-guide-to-ali-abdaal-video-editing-style-and-methods/
- **[TikTok via blogs]**: https://www.teleprompter.com/blog/tiktok-3-second-rule
- **[hyperframes-creative/motion-principles]**: the HyperFrames creative skill's motion principles (`hyperframes-creative/references/motion-principles.md`); the ratio holds for any animation tool.
