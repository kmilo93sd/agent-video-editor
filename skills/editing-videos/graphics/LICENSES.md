# Licenses of the graphics kit

Every asset in this folder (the `.html` snippets and `.svg` files in `arrows/`, `highlights/`, `underlines/`,
`focus/`, `callouts/`, `text/`, `progress/`, `status/`, `layouts/`, `overlays/` and `cta/`) was written by hand
for this repository. None is traced, copied or adapted from a third-party file, and none uses a font file,
an icon set, a photo or a video clip.

They are dedicated to the public domain under **CC0 1.0 Universal**. You may copy, modify and use them in
commercial and monetized videos, and redistribute them, without attribution. Legal text:
https://creativecommons.org/publicdomain/zero/1.0/legalcode

The scripts (`search.mjs`, `build-preview.mjs`, `check.mjs`) and `preview.html` follow the repository's MIT
license, like the rest of the code.

## What the assets use

| Element | Where it comes from |
|---|---|
| Shapes (arrows, loops, scribbles, check, cross, cursor, thumbs-up) | Path coordinates written by hand for this kit |
| Grain texture | Generated at render time by the SVG `feTurbulence` filter with a fixed seed; no image file |
| Light leak | CSS radial gradients and blur; no stock footage |
| Fonts | Generic CSS families (`system-ui`, `sans-serif`); the renderer's installed font is used, nothing ships |
| Animation | GSAP, loaded by the composition. GSAP is not redistributed here. Its own license (the Standard "No Charge" GSAP License, free for commercial use, https://gsap.com/standard-license) applies to the composition that loads it |

## Third-party assets

None. If an asset from another source is added, it gets a row here before it enters `catalog.json`, with:
the source URL, the exact license name and a link to its text, the date it was checked, and, for CC BY,
the attribution line to use. The catalog entry then carries that `license`, the `source` URL and
`attribution_required: true` when attribution is mandatory. Accepted licenses: CC0, MIT, Apache-2.0,
SIL OFL 1.1 (fonts), and CC BY only with attribution recorded. Nothing NC, ND or with unclear terms, and
no brand logos or platform trademarks.

## Trademarks

The kit contains no platform logos or trade dress. `cta/subscribe-prompt.html` is a generic pill with a
hand-drawn thumbs-up and the words "Like" and "Subscribe", in a neutral blue by default. Do not restyle it
with a platform's logo or signature button color, and do not add one to `layouts/end-screen.html`:
YouTube draws its own end-screen elements over the zones.
