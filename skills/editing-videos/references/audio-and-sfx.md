# Audio: levels, music, ducking, SFX and mastering

Viewers forgive a soft image before they forgive bad audio. This file has the targets and the craft, in
any tool; how to apply them in a specific one is in `tools.md`. The skill's own sound library
([`../library/`](../library/)) ships CC0 sound effects and music, already measured. Sources at the end.

## Contents

- [Target levels](#target-levels)
- [Cleaning the dialogue](#cleaning-the-dialogue)
- [Room tone](#room-tone)
- [Music under the voice](#music-under-the-voice)
- [Computing a gain from measured levels](#computing-a-gain-from-measured-levels)
- [Sound effects: when to use them and when not to](#sound-effects-when-to-use-them-and-when-not-to)
- [Mastering for YouTube](#mastering-for-youtube)
- [Sources](#sources)

## Target levels

| What | Target | Source |
|---|---|---|
| Video master for YouTube | **-14 LUFS integrated**, **true peak ≤ -1 dBTP** | YouTube turns down what is louder than ~-14 LUFS and does not turn up what is quieter; it does not publish this in its Help, it is measured in "Stats for nerds" **[Frame.io; Pure Audio Insight, creator]** |
| Podcast feed (Apple Podcasts) | **-16 LKFS ± 1 dB**, true peak ≤ -1 dBFS | **[Apple Podcasts, official]** |
| Distribution of spoken content (reference) | -18 LUFS | AES TD1008 for "speech-only" **[AES TD1008 via Production Advice]** |
| Voice alone during the edit | -16 LUFS, LRA 4–8 LU | **[Sweetwater; Pure Audio Insight, creator]** |
| Background music under the voice | **18–25 dB under the voice** (voice at -16: music at -34/-41 LUFS) | **[Pure Audio Insight, creator]** |
| Music ducking while there is voice | 6–12 dB typical; Auphonic applies 18 dB by default; attack 10–50 ms, release 250–700 ms | **[Zella; Auphonic, official]** |
| Sound effects under the voice | 12–24 dB under the voice | **[Storyblocks, creator]** |
| Upload audio | AAC-LC (or Opus), **48 kHz**, 384 kbps stereo | **[YT-encoding, official]** |

**Why -14 and not louder:** going louder gains nothing, YouTube turns it down anyway. Staying well under
-14 does lose something: the video sounds quieter than its neighbors.

## Cleaning the dialogue

Order matters; each step works better on the output of the previous one **[creator practice]**:

1. **Pick the best source.** A lav or a close mic beats the camera mic; in multicam, choose one mic per
   speaker and mute the rest while they are not talking, to avoid echo and phasing.
2. **Noise reduction**, gently. Too much makes the voice sound underwater; leave some air.
3. **High-pass** around 80 Hz to remove rumble and handling noise (a common starting point, not a rule).
4. **EQ** for clarity, **compression** for even levels, a **de-esser** if sibilance hurts.
5. **Level** each clip so the voice sits steady across the video; then master once at the end.

Remove clicks, breaths that are louder than the words, and mouth noise only when they distract: a voice
with every breath removed sounds robotic.

## Room tone

Room tone is the ambient sound of the location with nobody talking. Record **at least 30–60 s** of it at
each location **[StudioBinder, creator]**, with the same mic and settings.

- Lay it under every gap left by a cut, so silences do not drop to digital silence (which sounds like a
  dropout).
- Use it to cover a removed cough or noise, and as the bed of a J or L cut.
- No room tone? Copy the cleanest quiet stretch from the recording itself.

## Music under the voice

- **A brief decision, not filler.** Background music that adds nothing hurts comprehension (coherence)
  **[Mayer, study]**. Use it for mood, energy or structure, and drop it where it competes.
- **Level:** 18–25 dB under the voice **[Pure Audio Insight]**.
- **Ducking:** dip the music while someone talks, 6–12 dB with soft attack and release **[Zella]**. Either
  with keyframes, an NLE's auto-ducking, a sidechain compressor, or a spectral carve that dips only the bands
  the voice uses (`tools.md`).
- **Melody-free beds** under long talking; music with vocals fights speech.
- **Edit music on its phrases**: cut or loop on a bar line, and end on a real ending or a fade, not
  mid-note. Hit the downbeat on a key cut when the music is foregrounded.
- **License it** (`licenses.md`).

## Computing a gain from measured levels

When you know the loudness of the voice and of a sound, compute the gain instead of guessing:

```
gain = 10 ^ ((voice_lufs - under_voice - sound_lufs) / 20)    capped at 1
```

- `under_voice`: 15 dB for sound effects by default (within the 12–24 dB range), ~20 dB for music, and
  ~30 dB for an ambience bed or room tone, which should be felt rather than heard **[house]**.
- Example: voice at -17, a pop at -23.7 → `10^((-17 - 15 + 23.7)/20)` = 0.38.
- If it comes out above 1, the sound is too quiet for that use: pick another one rather than amplifying.
- The library's `catalog.json` stores each file's LUFS, and `node library/search.mjs <term> --voice
  <voice_lufs>` prints the gain for each match, with those three defaults ([`../library/`](../library/)). Its music comes at
  -16 LUFS and its effects and ambience at -22 LUFS.

## Sound effects: when to use them and when not to

**Yes**, sparingly, when the sound confirms something that happens on screen:

| Moment | Effect in the library | Note |
|---|---|---|
| A section title card enters | `whoosh-soft` or `page-turn`, plus `impact-soft-1` as it settles | One per card |
| A graphic or card enters | `slide-1` / `slide-2` | Alternate so it does not repeat |
| An element appears when the voice names it | `pop-1` / `pop-2` | About 18–20 dB under the voice, and not on every element if there are more than 4 |
| A total adds up, a goal is reached | `success-1` | Rarely |
| An error shown on purpose | `error-1` | Soft, never looped |
| Animated typing in a graphic | `typing-clicks-3s` or `keyboard-typing-3s`, trimmed | Not over real recorded typing |
| Closing or final pull-back | `sweep-long` or `downlifter-2s` | |
| Build into a reveal (vlog, Short, intro) | `riser-short-2s`, ending on the visual change | Not under speech |
| A scene with no other room sound | `ambience-room-tone-30s` | ~30 dB under the voice |

The names are files in [`../library/`](../library/); `search.mjs` lists them by category.

- **Place the transient 2–4 frames before the visual change**, so the peak lines up with what is seen
  **[Storyblocks, creator]**. Trim any silence at the start of the file first.
- In vlogs and Shorts, effects carry more of the style (whooshes on transitions, risers before a reveal);
  the limits below still apply.

**No:**

- a whoosh on every continuity cut: those cuts should be invisible;
- the same sound more than 3 times in a row: the repetition is noticeable and tiring **[Storyblocks,
  creator]**;
- effects louder than the voice, or on top of a key word (a number, a name);
- sounds over real recorded sounds that already do the job (a real click, a real door).

## Mastering for YouTube

Master once, on the final mix, not per clip.

- **Target:** -14 LUFS integrated, true peak ≤ -1 dBTP. For a podcast feed, -16 LKFS ± 1 **[Apple
  Podcasts]**. If the same audio goes to both, make two masters.
- **Upload format:** AAC-LC, 48 kHz, 384 kbps stereo, in an MP4 with Fast Start **[YT-encoding]**.
- With ffmpeg, two `loudnorm` passes, copying the video without re-encoding:

```bash
ffmpeg -hide_banner -i render.mp4 -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2> measure.txt
# read input_i, input_tp, input_lra, input_thresh and target_offset from the JSON at the end of measure.txt
ffmpeg -i render.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=<input_i>:measured_TP=<input_tp>:measured_LRA=<input_lra>:measured_thresh=<input_thresh>:offset=<target_offset>:linear=true" -c:a aac -b:a 384k -ar 48000 final.mp4
```

- The `loudnorm` report goes to **stderr**, not stdout: reading stdout gives nothing.
- Verify with `ffmpeg -i final.mp4 -af ebur128=peak=true -f null -`: I close to the target, true peak ≤ -1.
- In an NLE: a loudness meter on the master bus (Premiere, Resolve and Final Cut each ship one) and
  a true-peak limiter last in the chain.

## Sources

- **[Frame.io]**: "Loudness for YouTube". https://workflow.frame.io/guide/loudness-for-youtube
- **[Pure Audio Insight]**: https://pureaudioinsight.com/blogs/content-production/perfect-youtube-audio-levels-creators-technical-guide
- **[Apple Podcasts]**: "Audio requirements" (-16 dB LKFS ± 1 dB, true peak ≤ -1 dB FS). https://podcasters.apple.com/support/893-audio-requirements
- **[AES TD1008 via Production Advice]**: https://productionadvice.co.uk/td1008/
- **[Sweetwater]**: https://www.sweetwater.com/insync/how-to-master-audio-for-youtube/
- **[Zella]**: https://zellahq.com/blog/music-ducking-explained/
- **[Auphonic]**: https://auphonic.com/help/web/multitrack.html
- **[Storyblocks]**: https://www.storyblocks.com/resources/blog/pump-youtube-videos-stock-sfx
- **[StudioBinder]**: "What is room tone". https://www.studiobinder.com/blog/what-is-room-tone/
- **[YT-encoding]**: YouTube Help, "Recommended upload encoding settings". https://support.google.com/youtube/answer/1722171
- **[Mayer]**: https://doi.org/10.1037/0003-066X.63.8.760
- **ffmpeg loudnorm**: https://ffmpeg.org/ffmpeg-filters.html#loudnorm; two passes: https://dev.to/masonwritescode/two-pass-loudness-normalization-with-ffmpeg-loudnorm-the-right-way-1nm3
