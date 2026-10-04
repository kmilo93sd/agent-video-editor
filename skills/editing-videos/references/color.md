# Basic color

The goal of basic color in a YouTube video is not a look: it is **correct exposure, neutral white balance
and shots that match**. A look comes after, if at all. This file gives the order of work and the checks;
it gives no target numbers for skin or exposure, because none could be sourced well enough. Read the scopes,
not the screen.

## Order of work

1. **Normalize the footage.** Log or wide-gamut footage looks flat on purpose. Convert it to the delivery
   space first (a color space transform or the camera maker's conversion LUT), then correct.
2. **Exposure.** Set black and white points so nothing important is crushed or clipped, and the subject's
   face sits where it reads naturally. Check with the waveform, not by eye: a laptop screen in a bright room
   lies.
3. **White balance.** Neutral things (a white wall, a grey shirt, paper) should sit with R, G and B together
   on the parade. Skin should look like skin; the vectorscope's skin-tone line is a reference for hue, not a
   target for every face.
4. **Match shots.** Pick a hero shot per scene and match the others to it: same brightness of the face, same
   white balance, same contrast. In multicam, match every angle to one reference camera.
5. **Look (optional).** A creative LUT or a grade, applied the same way to every shot, with its strength
   dialed down if it pushes skin off.

## LUTs: a starting point, not a grade

- A **conversion LUT** (log to Rec.709) is technical: it belongs to the camera and profile it was made for.
  Use the right one, then correct exposure and balance after or before it as your tool's node or layer order
  requires.
- A **creative LUT** is a look. Applied on footage that is not normalized and balanced first, it amplifies
  the errors.
- Never stack LUTs blindly, and never trust one LUT for footage from different cameras.

## Consistency is the priority

- Viewers notice a jump in skin color or brightness between two cuts of the same scene more than a slightly
  imperfect grade. Match first.
- Lock camera settings while recording (manual white balance, exposure and ISO) so each clip does not drift
  on its own. Auto white balance under mixed light changes mid-shot.
- Screen recordings and graphics need no grade: leave them untouched so text stays crisp and colors
  match the brand.

## Delivery

- **SDR for YouTube is BT.709** **[YT-encoding, official]**. Export with the color space tagged so players do
  not guess.
- **HDR** needs HDR metadata in the file (PQ or HLG transfer, Rec. 2020 primaries); viewers on non-HDR
  devices see an SDR conversion, which you can guide with a LUT **[YT-HDR, official]**. If you are not sure
  you need HDR, deliver SDR.
- Check the export on a phone before publishing: most dark scenes that "looked fine" on the monitor get
  crushed there.

## Sources

- **[YT-encoding]**: YouTube Help, "Recommended upload encoding settings" (BT.709 for SDR). https://support.google.com/youtube/answer/1722171
- **[YT-HDR]**: YouTube Help, "Upload High Dynamic Range (HDR) videos". https://support.google.com/youtube/answer/7126552
- For scopes and node order in a given tool, its own manual: DaVinci Resolve Reference Manual (Color page), Adobe Premiere Pro's Lumetri Color and Lumetri Scopes help, Final Cut Pro's color correction help.
