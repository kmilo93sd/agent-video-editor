# Review checklist before showing a cut

A cut is not shown until it passes this list and the checklist of its recipe (in `recipes/`). Check by
looking at frames and listening, not by imagining from the timeline or the code. Numbers and their sources
are in `references/`.

## 1. Measured

- [ ] **Loudness** of the final mix: -14 LUFS integrated, true peak ≤ -1 dBTP for YouTube (a separate
  master at -16 LKFS ± 1 for a podcast feed). Measured, not estimated: `ffmpeg -i final.mp4 -af
  ebur128=peak=true -f null -` or the NLE's loudness meter.
- [ ] **Duration** of the export matches the timeline; no black frames or silence at the head or tail.
- [ ] **Format**: the delivery resolution and frame rate, 9:16 for Shorts, SDR tagged as BT.709, audio at
  48 kHz.
- [ ] **Chapters** (long videos): from `00:00`, at least 3, ascending, each ≥ 10 s, taken from the edit's
  real times.
- [ ] **Captions**: no event shorter than 20 frames; ≤ 42 characters per line and ≤ 2 lines for standard
  captions; reading speed ≤ 20 characters/s.

## 2. By eye

Sample frames at the moments that matter (each graphic, each cut, the hook, the end) instead of scrubbing
the whole video; for a graphic, every 0.5 s from when it enters until it leaves.

- [ ] **Hook**: the first seconds show or say what the title and thumbnail promise; no greeting or logo
  intro first.
- [ ] **Cuts**: none in the middle of a word or an unmotivated movement; jump cuts are deliberate and
  softened where needed; nothing seen twice by mistake.
- [ ] **Graphics**: no frame with an empty box, table or card; elements appear when the voice names them;
  nothing stays long after its last phrase.
- [ ] **On-screen text**: lasts at least `max(1.5 s; words × 0.33 s + 0.5 s)`; contrast ≥ 4.5:1; ≥ 40 px
  tall at 1080p; inside title-safe (80 %), and in vertical, clear of the platform's UI.
- [ ] **Zoom and punch-in**: motivated by what is said, sharp (within the source's resolution), never
  across a cut.
- [ ] **Color**: exposure and white balance consistent between shots of the same scene; skin looks like
  skin; checked on a phone screen as well.
- [ ] **B-roll and footage**: each insert illustrates the phrase under it; all of it licensed.
- [ ] **Privacy**: no personal data that should not be there (addresses, documents, notifications,
  bystanders who should be blurred).
- [ ] **Last 5–20 s** of a YouTube video: free space for the end screen.

## 3. By ear (with headphones)

- [ ] The voice is intelligible everywhere and does not jump in level between sections or speakers.
- [ ] No cut drops to digital silence; room tone covers the gaps.
- [ ] The music does not compete with the voice (18–25 dB under, ducked) and ends on a phrase or a fade.
- [ ] Sound effects confirm something on screen, sit under the voice, do not cover a key word, and do not
  repeat more than 3 times in a row.
- [ ] No clicks, pops, echo from open mics or audible edits.

## 4. Before publishing (only with the person's approval)

- [ ] The render or export was approved after a preview; nothing is rendered or published without it.
- [ ] Watch the whole export at 1×, straight through, once. It does not replace the above: it confirms it.
- [ ] Every track, effect and clip has a license that allows this use, and CC BY credits are in the
  description (`references/licenses.md`).
- [ ] Title, thumbnail, description, chapters and captions ready
  (`references/thumbnail-title-description.md`).
