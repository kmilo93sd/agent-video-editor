# Thumbnail, title and description

**Official** = YouTube Help. **Creator** = widespread practice without public YouTube data. Sources at the
end.

## Thumbnail

**Specification (official)** **[YT-thumbnails]**:

- videos in 16:9, up to 3840×2160 and a minimum width of 640 px; Shorts in 9:16;
- JPG or PNG;
- up to 2 MB when uploaded from a phone and 50 MB from a computer;
- the account has to be verified.

Practical recommendation: export at **1920×1080 JPG under 2 MB**, which works for both paths.

**Practices:**

1. **What is promised is seen in the video.** The thumbnail and title must reflect what the first 30 s show.
   It is the first thing YouTube recommends for the intro **[YT-moments]**.
   - A misleading thumbnail violates the spam and deceptive practices policies **[YT-spam]**.
2. **Few words: 1–5, ideally 3–4**, in a heavy sans-serif, legible at ~180 px wide **[Snappa, creator]**.
   Do not repeat the title: complement it.
3. **One dominant subject and high contrast**; 2–3 elements at most **[GrowthOS, creator]**.
   - The subject is what the video delivers: the face with the reaction, the place, the product, the
     result of a tutorial, enlarged and cropped.
   - A face with a clear expression tends to raise CTR **[Snappa, creator]**, but there is no official
     figure.
4. **Bottom-right corner clear**: the video's duration goes there **[Pixelbatch, creator]**.
5. **Consistent brand skin** across the videos in a series (same typography and accent). That way the series
   is recognizable in the feed.
6. **Test.** YouTube allows **A/B tests of up to 3 titles and/or thumbnails**; the winner is the one with
   **more watch time**, not more clicks **[YT-AB]**. To judge a new thumbnail, YouTube suggests looking at
   the CTR for the first 24 hours in Home and Suggested **[YT-thumbnail-practices]**.

To produce the thumbnail: export a sharp frame of the key moment (any NLE's "export frame", or
`ffmpeg -ss <t> -i video.mp4 -frames:v 1 frame.png`) as a base, or shoot a dedicated photo, then add text and
branding in an image editor or a design tool.

## Title

- **Limit: 100 characters** **[YT-limits]**. Lists cut it off around 60–70; the important part goes in the
  first ~60 **[utilhq, creator]**.
- **Search or curiosity.** A video people search for (a tutorial, a review, a how-to) starts with what
  they would type: "How to …", "<product> review". A video people discover in the feed (a vlog, a story)
  leads with the curiosity or the stakes. Either way, the important words go first.
- No sustained capitals or clickbait: the title promises exactly what the video teaches.

## Description

- **Limit: 5,000 characters** **[YT-limits]**. What is visible before "Show more" is the first ~150
  **[utilhq, creator]**: that is where what the video teaches and the link to the written guide go.
- **Chapters**: a list of timestamps from `00:00`, at least 3, each ≥ 10 s **[YT-chapters]**. They are
  copied from the edit's real times (markers exported from the NLE, or a timeline file the tool writes),
  not measured by eye.
- **Hashtags**: YouTube shows up to 3 next to the title, and if there are **more than 60 it ignores all of
  them** **[YT-hashtags]**. Use 2–5 relevant ones.
- **Audio credits**: if music from the YouTube Audio Library with a Creative Commons license was used, the
  credit goes in the description **[YT-audio-library]**. The skill's own library is CC0: it requires no
  credit.
- **Corrections**: a `Correction:` line with the timestamp and the explanation, without re-uploading the
  video **[YT-limits]**.

## Sources

- **[YT-thumbnails]**: "Add video thumbnails". https://support.google.com/youtube/answer/72431
- **[YT-AB]**: "A/B test titles & thumbnails". https://support.google.com/youtube/answer/16391400
- **[YT-thumbnail-practices]**: https://support.google.com/youtube/answer/12340300
- **[YT-moments]**: https://support.google.com/youtube/answer/9314415
- **[YT-chapters]**: https://support.google.com/youtube/answer/9884579
- **[YT-hashtags]**: https://support.google.com/youtube/answer/6390658
- **[YT-limits]**: "Edit video settings". https://support.google.com/youtube/answer/57407
- **[YT-audio-library]**: https://support.google.com/youtube/answer/3376882
- **[YT-spam]**: "Spam, deceptive practices & scams policies". https://support.google.com/youtube/answer/2801973
- **[Snappa]**: https://snappa.com/blog/youtube-thumbnail-best-practices/
- **[GrowthOS]**: https://growthos.in/blog/youtube-thumbnail-best-practices
- **[Pixelbatch]**: https://pixelbatch.io/blog/youtube-thumbnail-size-guide
- **[utilhq]**: https://utilhq.com/articles/youtube-character-limits-seo-guide/
