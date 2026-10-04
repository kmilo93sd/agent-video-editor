# Licenses: music, sound effects and footage

What can be used in a monetized video without attribution and without Content ID surprises. The skill's own
library ([`../library/`](../library/)) is 100 % CC0 and its evidence is in
[`../library/LICENSES.md`](../library/LICENSES.md). Sources at the end.

## Contents

- [Audio: summary by source](#audio-summary-by-source)
- [Stock footage and images](#stock-footage-and-images)
- [Other people's clips and fair use](#other-peoples-clips-and-fair-use)
- [Rules](#rules)
- [Sources](#sources)

## Audio: summary by source

| Source | License | Attribution | Commercial use | Download | Content ID risk |
|---|---|---|---|---|---|
| **Kenney.nl** (audio) | CC0 | No ("would be nice but is not mandatory") | Yes | Direct zip, no account | Low |
| **OpenGameArt.org**, filtering for CC0 | CC0 (per piece; the site has other licenses too) | No | Yes | Direct, no account | Low, not zero |
| **Freesound.org** | Per sound: CC0, CC BY or CC BY-NC | CC0 no; CC BY yes; **CC BY-NC does not work** for a monetized channel | Only CC0 and CC BY | **Account required** to download; the API requires a key | Low for CC0 |
| **Sonniss GDC Game Audio Bundle** | Its own royalty-free license | No | Yes | Direct, no sign-up; ~7.5 GB | Low |
| **YouTube Audio Library** | YouTube's own; some tracks CC BY | Only the CC BY ones (credit in the description) | Yes, on YouTube | From YouTube Studio | None: YouTube says they are not claimed |
| **Pixabay** (music and sound effects) | Pixabay Content License | No | Yes, except selling it on its own | Direct | **High for music**: some authors register it in Content ID |
| **Incompetech** (Kevin MacLeod) | CC BY 4.0, **not CC0** | **Yes, required** | Yes | Direct | Low |

Detail for each row, with verbatim quotes:

- **Kenney**: every pack page says "License: Creative Commons CC0". The `License.txt` says "You may use
  these assets in personal and commercial projects. Credit … would be nice but is not mandatory."
  **[Kenney]**
- **Freesound**:
  - "To download a sound, first make sure you are logged into your registered account."
  - "For 'attribution' you should always mention the original creators."
  - "'Noncommercial' … you can't earn any money with the piece of work you create!" **[Freesound]**
  - The API requires its own credential (a token or, for some resources, OAuth2) **[Freesound-API]**, and
    downloading from the website requires an account. That is why it was not used for this library. It
    remains an option: create an account, filter by CC0 license and record each sound here.
- **Sonniss**:
  - "Everything is royalty-free and commercially usable."
  - "No attribution is required."
  - It forbids using the sounds to train AI and reselling them on their own **[Sonniss]**.
  - Useful when a specific effect is missing; it was not included because of its size.
- **YouTube Audio Library**:
  - "Copyright-safe music and sound effects downloaded from the Audio Library won't be claimed by a rights
    holder through the Content ID system."
  - "If you're using a track with a Creative Commons license, you must credit the artist in your video's
    description." **[YT-audio-library]**
  - The page only talks about use on YouTube: **do not use it for videos that also go to other networks**.
- **Pixabay**: the license allows use without attribution **[Pixabay-license]**. Its own FAQ acknowledges
  that some contributors "upload their tracks to Pixabay for free use but also register them with Content ID"
  **[Pixabay-FAQ]**. That is why **Pixabay music is not used unless you are willing to dispute claims**.
  - Careful: the sound effects `media-use` ships for use without a HeyGen credential come from Pixabay
    (`media-use/audio/assets/sfx/CREDITS.md`). For sound effects the risk is lower than for music, but they
    are not CC0.

## Stock footage and images

| Source | License | Attribution | Commercial use | Watch out for |
|---|---|---|---|---|
| **Pexels** (photos and video) | Pexels License | "Attribution is not required" | Yes, "free to use" | Identifiable people may not appear in a bad light; do not imply that a person or brand endorses you **[Pexels]** |
| **Pixabay** (photos and video) | Pixabay Content License | No | Yes | Do not sell or distribute the content on a standalone basis **[Pixabay-license]** |
| **Paid stock** (Storyblocks, Artgrid, Envato…) | Per the subscription | Per the license | Usually, while subscribed or per download | Read whether the license survives cancelling the subscription |
| **Your own footage** | Yours | No | Yes | Music playing in the background of a recording is still someone else's: it can trigger Content ID |

Footage with recognizable people, logos or private property can need a release beyond the copyright
license. The license covers the file, not everything in it.

## Other people's clips and fair use

- Fair use is decided case by case on four factors (purpose, nature of the work, amount used, effect on the
  market). **Giving credit does not turn a copy into fair use**, and there are no "magic words": a "no infringement intended" line does not protect you automatically
  **[YT-fair-use]**.
- Commentary, criticism and teaching that transform the clip have the best case; reposting it with music on
  top does not.
- Fair use is a US doctrine; other countries have narrower exceptions. When in doubt, do not use it.

## Rules

1. **On a monetized channel, only CC0, the YouTube Audio Library, or a license that explicitly says
   "commercial use without attribution"**, for audio and for footage. Nothing "NC", nothing without a
   written license, nothing "found on YouTube".
2. **Before adding a sound to the library**:
   - read the license on the pack's or the sound's page, not on an aggregator;
   - save the URL and the text in [`../library/LICENSES.md`](../library/LICENSES.md);
   - if the license is doubtful or cannot be found, it does not go in.
3. **CC BY works, but requires credit** in the description ("'Title' by Author, CC BY 4.0, link"). Note it in
   the brief so it is not forgotten at publishing time.
4. **Content ID does not look at the license.** A claim on CC0 or licensed material is a system error, not a
   violation. It is disputed in YouTube Studio with:
   - the link to the track's page;
   - the link to its license.
   A claim affects that video's monetization, not the channel's standing **[Pixabay-FAQ]**.
5. **Do not register free music in Content ID** under your own name: it is not yours and it causes claims
   against third parties **[Pixabay-FAQ]**.

## Sources

- **[Kenney]**: https://kenney.nl/assets/ui-audio (and the rest of the packs in `../library/LICENSES.md`)
- **[Freesound]**: https://freesound.org/help/faq/
- **[Freesound-API]**: https://freesound.org/docs/api/authentication.html
- **[Sonniss]**: https://gdc.sonniss.com/
- **[YT-audio-library]**: https://support.google.com/youtube/answer/3376882
- **[Pixabay-license]**: https://pixabay.com/service/license-summary/
- **[Pixabay-FAQ]**: https://pixabay.com/service/faq/
- **[Incompetech]**: https://incompetech.com/music/royalty-free/faq.html
- **[OpenGameArt]**: https://opengameart.org/content/faq
- **[Pexels]**: https://www.pexels.com/license/
- **[YT-fair-use]**: YouTube Help, "Fair use on YouTube". https://support.google.com/youtube/answer/9783148
- **CC0**: https://creativecommons.org/publicdomain/zero/1.0/
