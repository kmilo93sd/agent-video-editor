# Applying the craft in your tool

The craft in this skill does not depend on a tool. This file maps it onto what the agent actually has:
an NLE that a person drives, ffmpeg, Remotion or HyperFrames. When a tool's own rules clash with this skill,
the tool wins on mechanics (file formats, APIs, rendering) and this skill wins on editorial matters
(pacing, levels, when to use a graphic). Say so in the delivery.

## Contents

- [Which route fits](#which-route-fits)
- [NLEs: Premiere Pro, DaVinci Resolve, Final Cut Pro, CapCut](#nles-premiere-pro-davinci-resolve-final-cut-pro-capcut)
- [ffmpeg](#ffmpeg)
- [Remotion](#remotion)
- [HyperFrames](#hyperframes)
- [The same rule in each tool](#the-same-rule-in-each-tool)
- [Sources](#sources)

## Which route fits

| The agent has | It can produce | Best for |
|---|---|---|
| Only the person's NLE (no API access) | An edit decision list, a marker list, caption files and step-by-step instructions | Most YouTubers: the person keeps editing in their tool |
| A shell with ffmpeg | The finished file: trims, concatenation, crops, captions burned in, audio mix and master | Shorts from long videos, podcasts, quick talking-head cuts, any batch job |
| A Node project with Remotion | React compositions rendered to video | Videos built from data, templates, animated captions |
| HyperFrames and its skills | HTML compositions rendered to video, with lint and checks | Narrated explainers and tutorials, motion graphics; the reference pipeline in [`narrated-screen-tutorial.md`](../recipes/narrated-screen-tutorial.md) |

Whatever the route, the review is the same: [`../review-checklist.md`](../review-checklist.md).

## NLEs: Premiere Pro, DaVinci Resolve, Final Cut Pro, CapCut

The agent usually cannot click in the NLE, but it can do most of the thinking: read a transcript, decide
the cuts, and hand back something the NLE imports.

**What to hand back:**

1. **An edit decision list (EDL, CMX3600).** Premiere and Resolve import it as a timeline. One event per
   line: event number, reel, track, transition, source in, source out, record in, record out, all in
   timecode at the project's frame rate (24 fps in this example).

   ```text
   TITLE: talking-head-cut-v1
   FCM: NON-DROP FRAME

   001  A001     V     C        00:00:04:12 00:00:11:03 00:00:00:00 00:00:06:15
   * FROM CLIP NAME: A001.mov
   002  A001     V     C        00:00:13:20 00:00:21:00 00:00:06:15 00:00:12:19
   * FROM CLIP NAME: A001.mov
   ```

   EDLs carry cuts and simple dissolves, not effects, text or audio mixes. Check the frame rate and whether
   the footage is drop-frame before writing timecode.
2. **A marker list** (timecode + note) for what the person should do by hand: "punch-in to 115 % here",
   "b-roll of the street from 02:14 to 02:19", "duck music 10 dB under this line".
3. **Caption files** (`.srt` or `.vtt`): every NLE imports them, and YouTube accepts them directly.
4. **Instructions per step**, in the NLE's vocabulary, with numbers: "Essential Sound › Music › Ducking,
   reduce by 12 dB", not "lower the music a bit".

**Things that differ by NLE:**

- **Premiere Pro**: Text-Based Editing (cut by deleting transcript text), Essential Sound with auto-ducking,
  Lumetri scopes, multicam source sequences.
- **DaVinci Resolve**: the Cut and Edit pages for editing, Color page with scopes and color management,
  Fairlight for audio; multicam clips; a scripting API for automation where available.
- **Final Cut Pro**: magnetic timeline, multicam clips with an angle editor, roles for audio stems.
  FCPXML is its interchange format.
- **CapCut**: auto captions and templates aimed at vertical; good for Shorts, limited for long edits.

Feature names and menus change between versions. When giving instructions, say which version you assume,
and prefer telling the person the target (a level in LUFS, a duration in frames) over a menu path.

## ffmpeg

Enough for a whole edit when the edit is mostly cuts. Re-encode when you need frame accuracy: `-c copy`
only cuts on keyframes.

```bash
# Trim a segment, frame-accurate (re-encodes)
ffmpeg -ss 00:01:04.40 -to 00:01:31.00 -i in.mp4 -c:v libx264 -crf 18 -c:a aac -b:a 384k -ar 48000 seg01.mp4

# Join segments with the same codec settings (list.txt: one "file 'segNN.mp4'" per line)
ffmpeg -f concat -safe 0 -i list.txt -c copy joined.mp4

# 16:9 to 9:16, centered crop, then scale to 1080x1920
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:a copy vertical.mp4

# Burn captions from an .srt into the picture
ffmpeg -i vertical.mp4 -vf "subtitles=captions.srt" -c:a copy captioned.mp4

# Music ducked under the voice with a sidechain compressor
ffmpeg -i voice.wav -i music.wav -filter_complex \
  "[0:a]asplit=2[vo][sc];[1:a]volume=0.1[bed];[bed][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=500[duck];[vo][duck]amix=inputs=2:duration=first:normalize=0[mix]" \
  -map "[mix]" mix.wav

# Export one frame for a thumbnail base
ffmpeg -ss 00:02:14 -i in.mp4 -frames:v 1 frame.png
```

- The centered crop is a start: for a person who moves, crop per shot on the subject (see
  [`shorts-from-long-form.md`](../recipes/shorts-from-long-form.md)).
- `volume=0.1` is about -20 dB; compute it from measured levels instead (`audio-and-sfx.md`).
- Master the final file with the two-pass `loudnorm` in `audio-and-sfx.md`.
- Measure before deciding: `ffmpeg -i in.mp4 -af ebur128=peak=true -f null -` for loudness,
  `silencedetect` to find pauses worth cutting.

## Remotion

A React component per scene, rendered frame by frame **[Remotion]**.

- **Cuts and trims**: `<Sequence from durationInFrames>` places a piece on the timeline; `<OffthreadVideo>`
  or `<Video>` with `trimBefore` and `durationInFrames` picks the part of the source.
- **Ducking and fades**: `volume` accepts a function of the frame, so a fade or a dip under the voice is an
  `interpolate()` over frames.
- **Captions**: `@remotion/captions` parses `.srt` (`parseSrt`) and groups word timings into pages
  (`createTikTokStyleCaptions`), which fits the social caption style in `graphics-and-text.md`.
- **Never-empty graphics**: drive each element's entrance from the word timings, not from a fixed stagger.
- Master the rendered file with ffmpeg afterwards.

## HyperFrames

HTML compositions with `data-*` timing attributes, rendered deterministically, with its own skills for
each job **[HyperFrames skills]**. Load order:

| Step | Skill | What for |
|---|---|---|
| Entry | `hyperframes` | Always first: reads the project state, writes `BRIEF.md` or runs its `workflow` |
| Workflow | `general-video` (or the one the brief names) | Owns the deliverable end to end: plan, storyboard, build, review |
| Contract | `hyperframes-core` | Before writing HTML: `data-start`, `data-duration`, `data-media-start`, tracks, sub-compositions, determinism; recipes in `references/creator-editing-recipes.md` |
| Direction | `hyperframes-creative` | Brand skin (`frame.md` / `design.md`), narration, beat plan |
| Media | `media-use` | Resolve music, SFX, images and icons; transcribe; TTS |
| Motion | `hyperframes-animation`, `hyperframes-keyframes` | Animation rules and blueprints; zoom and punch-in on an inner wrapper |
| Blocks | `hyperframes-registry` | Before hand-drawing anything with a name (chart, terminal window, transition) |
| Mix | `hyperframes-audio` | Fades, voiceover carve of the music, automation, buses |
| Review and render | `hyperframes-cli` | `lint`, `check`, `snapshot`, `preview`, `render` |
| Notes on a built cut | `hyperframes-studio` | Questions and adjustments with the person; safe zones |

How the narrated tutorial pipeline uses it (a generator that writes the compositions and fails on broken
rules) is in [`hyperframes-generator.md`](../recipes/narrated-screen-tutorial/hyperframes-generator.md).

## The same rule in each tool

| Rule | NLE | ffmpeg | Remotion | HyperFrames |
|---|---|---|---|---|
| Cut out a pause | Delete the gap / ripple delete; EDL event boundaries | Trim segments and concatenate | Two `<Sequence>` pieces with different `trimBefore` | Two `<video>` pieces with different `data-media-start` |
| J or L cut | Unlink audio and extend it under the next shot | Offset the audio segments against the video ones | Audio `<Sequence>` starting before or ending after the video one | `<audio>` with its own `data-start` and `data-duration` |
| Punch-in | Scale 110–120 % on the clip | `crop` + `scale` on that segment | `transform: scale()` on a wrapper | Tween on an inner wrapper, never on the `.clip` |
| Music under voice | Auto-ducking or volume keyframes | `sidechaincompress` | `volume` as a function of the frame | `scripts/carve.mjs` from `hyperframes-audio` |
| Captions | Import `.srt`, style in the captions track | `subtitles=` filter | `@remotion/captions` | A caption track per `hyperframes-studio` |
| Master to -14 LUFS | Loudness meter + limiter on the master | Two-pass `loudnorm` | Render, then ffmpeg | Render, then ffmpeg |

## Sources

- **[Remotion]**: Remotion docs, `<Audio>` and `<OffthreadVideo>` (`trimBefore`, `durationInFrames`, `volume` as a function), and `@remotion/captions` (`parseSrt`, `createTikTokStyleCaptions`). https://www.remotion.dev/docs/
- **[HyperFrames skills]**: `hyperframes/SKILL.md`, `general-video/SKILL.md`, `hyperframes-core`, `hyperframes-audio` ("Voiceover carve"), `hyperframes-cli`, `hyperframes-studio` § 4. https://github.com/heygen-com/hyperframes
- **ffmpeg filters**: https://ffmpeg.org/ffmpeg-filters.html (`subtitles`, `crop`, `sidechaincompress`, `amix`, `loudnorm`, `ebur128`, `silencedetect`).
- **CMX3600 EDL**: the event format (event, reel, track, transition, source in/out, record in/out) is the one Premiere and Resolve import; check your NLE's import options for frame rate and reel names.
