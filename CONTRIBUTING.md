# How to contribute

Thanks for wanting to improve the skill. To keep the guidance trustworthy:

1. **Every rule carries its source.** The references mark where each number comes from in brackets:
   official, study, creator or `[house]` (learned while editing). A new rule without a source goes in as
   `[house]`, together with the case that prompted it.
2. **CC0 assets only.** A new sound comes with its page, the original file and the license text in
   `library/LICENSES.md`, and with its entry in `library/catalog.json` (duration, LUFS and suggested use),
   at 48 kHz and normalized like the rest (see `criteria` in the catalog). A new graphic is your own work
   dedicated to CC0, recorded in `graphics/LICENSES.md` and `graphics/catalog.json`. The meme reference
   never ships meme media. Nothing with a doubtful license.
3. **SKILL.md under 500 lines.** Detail goes in `references/`, one level deep from SKILL.md, and files longer
   than 100 lines get a table of contents.
4. **Validate before the PR:**

   ```bash
   npx skills-ref validate ./skills/editing-videos
   node skills/editing-videos/library/verify.mjs      # if you touched the sound library (needs ffmpeg)
   node skills/editing-videos/graphics/build-preview.mjs && node skills/editing-videos/graphics/check.mjs
   ```

5. **If you change the guidance, add or adjust a case in `evals/evals.json`** with what the agent should
   answer.

Issues with an example video (what looks wrong and at which second) are the most useful.
