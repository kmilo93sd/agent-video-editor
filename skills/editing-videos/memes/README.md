# Meme reference catalog

`catalog.json` lists 59 well-known memes and video-editing meme formats that work in tutorials and
explainers. For each one it says what it means, when it fits, how long it stays on screen, how to make an
original version, where it came from, who likely owns it, and how likely it is to trigger Content ID.

**This folder ships no meme media**: no images, no GIFs, no clips, no sounds. That is deliberate.

```bash
node search.mjs                     # formats and risk levels, with counts
node search.mjs fail                # search by name, meaning or use
node search.mjs --format sound      # only sounds
node search.mjs --risk low --json   # full entries, filtered by Content ID risk
```

## Why the media isn't here

Almost every meme is a piece of someone else's work: a TV still, a film frame, a stock photo, a webcomic,
another creator's video, a song. Being famous doesn't make it free. Two problems follow:

- **Redistributing it in a public repository** means copying and sharing work we don't own or license.
  A repo is not a meme page.
- **Putting it in a monetized YouTube video** can trigger a Content ID claim (the owner takes the ad
  revenue, or blocks the video in some countries), a manual claim, or a takedown. A takedown is a copyright
  strike, and three active strikes get a channel terminated.

Content ID compares uploads against reference files that rights holders submit. In practice it matches
audio and video, so songs, sound effects from shows or games, and clips carry the highest risk. A still
image is unlikely to be matched automatically, but its owner can still file a manual claim. That is what the
`content_id_risk` field measures: the chance of an automated match **if you use the original media**. It is
not a legal opinion, and `low` does not mean "allowed".

## Fair use is not a safe harbor

- **Fair use is a US doctrine** (17 U.S.C. section 107). A court weighs four factors case by case: the
  purpose of the use (commentary, criticism, parody and transformation weigh in favor; commercial use weighs
  against), the nature of the work, how much of it you use, and the effect on its market. Nobody can tell
  you in advance that a use is fair.
- **Other countries use different and usually narrower rules.** Many have "fair dealing" or a closed list of
  exceptions (quotation, parody, caricature or pastiche where the law includes them). Your audience and
  your residence may put you under one of those, not under US fair use.
- **Content ID doesn't evaluate fair use.** The match and the claim happen automatically. You can dispute,
  and the dispute can take weeks, during which the claimant may collect the revenue. If the claimant rejects
  the dispute, the next step can be a takedown and a strike.
- **Monetized videos have it harder.** Commercial use counts against fair use, and a meme used as a quick
  joke in a tutorial is rarely commentary on the meme itself, which is the strongest kind of fair use.
- Brand logos and trade dress (a platform's button, an OS dialog, a game's title font) add trademark issues
  on top of copyright.

This README is not legal advice. When the money or the channel matters, ask a lawyer in your jurisdiction.

## The recommended approach

1. **Recreate the joke, not the image.** Most memes are a structure: two options (one rejected), a plan
   that fails at step four, a freeze frame with a narrator, a fake-dramatic zoom. The structure is not
   copyrightable; the picture is. Each entry's `how_to_recreate` describes an original version built with
   `graphics/` (arrows, checkmark and cross, callouts, chapter cards, split layouts) or plain HyperFrames:
   your text, your shapes, your voice, CC0 sounds from [`../library/`](../library/).
2. **Or license the original.** Some are licensable: stock photos (Distracted Boyfriend, Hide the Pain
   Harold) can be bought from the stock agency, and some creators license their work directly. Where a
   licensing route is known, `sourcing` lists it. Keep the license with the project, like the audio
   licenses in [`../library/LICENSES.md`](../library/LICENSES.md).
3. **Use Know Your Meme for context, not for files.** It documents origin and history; the images it hosts
   are not licensed for your video.
4. **Never use the meme's music.** Songs ("Roundabout", "Astronomia", "Never Gonna Give You Up", the Curb
   theme) are the most reliable Content ID matches there are. Use an original or CC0 sting.
5. **Check the tone.** `tone_warnings` flags memes that are dated, mean-spirited, tied to a real person or a
   political figure, or about real tragedies. In a tutorial, a meme should land in two or three seconds and
   never at the viewer's expense.

## How the catalog fits the skill

- A meme is an interrupt: it follows the same rhythm and text rules as any graphic. It enters with the word
  it reacts to, stays for `timing_s`, and any text on it lasts at least
  `max(1.5 s, words x 0.33 s + 0.5 s)`.
- Zoom punch-ins stay within the skill's 1.10 limit and happen inside one shot.
- A sound gag counts as a sound effect: one per event, about 15 dB under the voice, never on top of the
  recording's real clicks.
- At most one or two per video. A tutorial is not a meme compilation.

## Accuracy

Origins, owners and dates were checked against Know Your Meme, Wikipedia and the creators' own
statements on 4 October 2026. Where a fact could not be verified, the entry says `unknown` or attributes
the claim ("per KYM"). If you correct an entry, cite the source in the commit.
