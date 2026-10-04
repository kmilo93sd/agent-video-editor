# Recipe: Shorts, Reels and TikToks from a long video

Turning a horizontal long video (a podcast, a talking head, a vlog, a tutorial) into vertical clips. The
editing problem is that a moment that works inside a long video often does not stand alone: it needs its own
hook, its own payoff and a frame rebuilt for a phone. Sources at the end of the file.

## Contents

- [Platform specs](#platform-specs)
- [Picking the moment](#picking-the-moment)
- [Reframing to 9:16](#reframing-to-916)
- [Pacing and cuts](#pacing-and-cuts)
- [Captions](#captions)
- [Audio](#audio)
- [Common mistakes](#common-mistakes)
- [Checklist for this recipe](#checklist-for-this-recipe)
- [Sources](#sources)

## Platform specs

| Platform | Length | Format | Source |
|---|---|---|---|
| **YouTube Shorts** | Up to **3 minutes** | Square or vertical; a wider ratio such as 16:9 is treated as a regular video | **[YT-Shorts, official]** |
| **Instagram Reels**, **TikTok** | Limits change often | 9:16, 1080×1920 is the common delivery | Check the platform's current help page before publishing; no figure verified here |

YouTube lets creators make Shorts from their own videos **[YT-Shorts]**, but a dedicated edit usually
works better than a raw excerpt.

## Picking the moment

- **A complete idea in itself**: a claim and its proof, a question and its answer, a story with an end. If
  it needs the context of the long video, it does not work.
- **Strong first line.** The first 3 s decide whether people swipe **[TikTok via blogs, creator]**. If the
  best line is in the middle, open with it and then go back to the setup, or cut the setup.
- **Let the idea set the length**, not the platform's maximum: a clip ends when its idea pays off. No
  length figure is given here because none could be sourced well.
- Mark candidates while editing the long video, so they do not have to be found again.

## Reframing to 9:16

- **Crop on the subject, shot by shot**, not one fixed center crop: the face or the action stays in the
  upper-middle of the frame.
- **Two speakers**: cut between them (one per frame) or stack them (one above the other) when the reaction
  matters.
- **Screens and wide shots** do not survive a 9:16 crop: show the relevant part enlarged, or put the
  horizontal shot in the middle with captions above and below.
- **Record in higher resolution** (4K) when you know clips will be cut, so the crop stays sharp.
- Tools: any NLE's auto-reframe, or `crop`+`scale` in ffmpeg per segment (`../references/tools.md`).

## Pacing and cuts

- **Faster than long-form**: 2–3 s per shot, 4 s max, and something new (a cut, a punch-in, text, a sound)
  every 5–7 s **[OpusClip; MrBeast analysis, creator]** (`../references/pacing-and-cuts.md`).
- **Cut every pause**; gaps of 200–300 ms **[Syllaby, creator]**.
- **Remove references to the long video** ("as I said before", "in the next part").
- **Make it loop**: an ending that leads back to the start makes rewatching natural. Do not count on an end
  screen; a verbal pointer to the full video, if any, goes in one short line.

## Captions

Most people watch these with the sound off or low, so captions are part of the edit, burned in **[creator
practice]** (`../references/graphics-and-text.md`):

- **1–5 words per caption page**, timed to the words, the active word highlighted;
- big, bold sans-serif with an outline or box; consistent style across the channel's clips;
- placed in the center or upper-center area, **above the platform's bottom UI and away from the right-side
  buttons**; check in the platform's preview, since no official safe-zone percentages were verified here;
- **reviewed word by word**: automatic transcription errors look much worse when burned in;
- every page lasts at least 20 frames **[Netflix-timing]**.

## Audio

- **Voice clear and present**; phones play through small speakers.
- **Music** under speech 18–25 dB under the voice **[Pure Audio Insight, creator]**, or leading in sections
  without speech.
- **Sound effects** carry more of the style here (whooshes, pops, risers), within the limits in
  `../references/audio-and-sfx.md`.
- **Master** to -14 LUFS, true peak ≤ -1 dBTP; platforms normalize, so louder gains nothing.
- **Licensed music only**: music from a platform's in-app library may not be cleared for use elsewhere
  (`../references/licenses.md`).

## Common mistakes

- An excerpt that starts mid-thought and needs the long video to make sense.
- A fixed center crop that cuts off the speaker or shows an empty middle between two people.
- Captions under the platform's UI, or with transcription errors.
- A slow first 3 seconds (an intro, a "so…").
- The same clip posted to every platform with another platform's watermark.
- Keeping 16:9 when the clip was meant to be a Short: YouTube treats wide ratios as regular videos
  **[YT-Shorts]**.

## Checklist for this recipe

Run it before the core [`../review-checklist.md`](../review-checklist.md).

- [ ] The clip makes sense without the long video, and ends on a payoff or a loop.
- [ ] The first 3 s carry the hook; no intro or filler.
- [ ] 9:16 (or square) at 1080×1920; the subject framed shot by shot, sharp after the crop.
- [ ] Within 3 minutes for YouTube Shorts; the current limits checked for the other platforms.
- [ ] Captions burned in, reviewed word by word, clear of the platform's UI.
- [ ] No references to the long video's other parts; no pauses left.
- [ ] Music and effects licensed for every platform the clip goes to.

## Sources

- **[YT-Shorts]**: YouTube Help, Shorts length and format ("up to three minutes", "a square or vertical aspect ratio"; "Create YouTube Shorts from your videos"). https://support.google.com/youtube/answer/15424877
- **[Netflix-timing]**: https://partnerhelp.netflixstudios.com/hc/en-us/articles/360051554394
- **[OpusClip]**: https://www.opus.pro/blog/ideal-youtube-shorts-length-format-retention
- **[MrBeast analysis]**: https://www.a4bcreative.com/post/the-pattern-interrupt-edit-how-to-keep-viewers-hooked-for-the-full-60-seconds
- **[TikTok via blogs]**: https://www.teleprompter.com/blog/tiktok-3-second-rule
- **[Syllaby]**: https://syllaby.io/blog/voiceover-pacing-silence-trimming-retention-editing/
- **[Pure Audio Insight]**: https://pureaudioinsight.com/blogs/content-production/perfect-youtube-audio-levels-creators-technical-guide
- **[creator practice]**: widespread practice for short-form editing, with no single source.
