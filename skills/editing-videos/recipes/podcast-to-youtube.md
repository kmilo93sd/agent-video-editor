# Recipe: podcast or interview to YouTube (multicam)

Two or more people talking, recorded with several cameras and one mic per person. The editing problem is to
make a long conversation watchable: always show who matters at that moment, keep the audio clean when people
talk over each other, and give viewers a way to jump around. Sources at the end of the file.

## Contents

- [Before editing: sync and audio](#before-editing-sync-and-audio)
- [Structure](#structure)
- [Cutting between cameras](#cutting-between-cameras)
- [Trimming the conversation](#trimming-the-conversation)
- [Audio](#audio)
- [Captions and chapters](#captions-and-chapters)
- [Clips for Shorts](#clips-for-shorts)
- [Common mistakes](#common-mistakes)
- [Checklist for this recipe](#checklist-for-this-recipe)
- [Sources](#sources)

## Before editing: sync and audio

1. **Sync every camera and mic** to one timeline. NLEs build multicam clips synced by timecode or by audio;
   a clap or a slate at the start makes audio sync reliable. Check sync at the start, middle and end: some
   cameras drift over long recordings.
2. **One mic per person** is the source of the dialogue. Camera audio is only for syncing.
3. **Clean each mic track** (noise reduction, high-pass, EQ, compression) before cutting, then level the
   speakers to each other (`../references/audio-and-sfx.md`).

## Structure

1. **Cold open (15–60 s):** the strongest exchange of the episode, cut tight, before the intro. It is the
   promise of the title and thumbnail **[YT-moments]** (`../references/hook-and-retention.md`).
2. **Short intro:** who is talking and about what, in one or two sentences. No long branded intro.
3. **The conversation in topics.** Each topic is a chapter **[YT-chapters]**.
4. **Close** and end screen in the last 5–20 s **[YT-end-screens]**.

## Cutting between cameras

There is no serious source for how often to switch angles; cut on the conversation, not on a timer.

- **Show who is talking**, in a close-up, for most of their turn.
- **Cut on the speaker change**, ideally a beat after the new person starts (an L cut of the previous
  speaker's last words over the new face, or a J cut that lets us hear the answer start on the asker)
  **[TechSmith]**.
- **Reactions are content**: a laugh, a surprised face, a nod at the key line. Cut to them when they say
  something; not for every "mm-hm".
- **The wide shot** re-establishes the room: at the start, after a topic change, during fast cross-talk
  where a close-up would cut too often.
- **Long monologues**: alternate close-up, a medium shot and the wide, or a punch-in, so one face is not on
  screen for minutes. B-roll or a graphic when the person names something that can be shown.
- **Eyelines**: in a two-camera setup, each person looks off-frame toward the other; keep the cameras on the
  same side so they look at each other across the cut.

## Trimming the conversation

- **Remove dead air, false starts, off-topic stretches and technical problems**, but keep the conversation's
  natural pauses and rhythm: an interview cut like a talking head stops sounding like a conversation.
- **Cuts in the audio** are covered by a camera change, so they do not show as jump cuts. That is the
  multicam edit's advantage: cut audio first, then choose the angle.
- **Do not change meaning.** Joining the start of one answer to the end of another can put words in
  someone's mouth.
- **Cross-talk**: keep both mics open while people overlap, then mute the one not speaking.

## Audio

- **Mute the mics of people who are not talking** (or gate them), so one mic does not pick up the other
  voice late and create an echo.
- **Level the speakers to each other**, so nobody is louder than the rest.
- **Room tone** under cuts so the background does not jump; record 30–60 s before starting **[StudioBinder,
  creator]**.
- **Music** only for the intro, outro and topic breaks; not under the conversation.
- **Masters**: -14 LUFS / -1 dBTP for YouTube; if the audio also goes to podcast feeds, a separate master at
  -16 LKFS ± 1, true peak ≤ -1 dBFS for Apple Podcasts **[Apple Podcasts]**. AES TD1008 suggests -18 LUFS
  for speech-only streaming **[AES TD1008 via Production Advice]**.
- **Ads**: a podcast delivered to YouTube by RSS cannot contain ads, and sponsored segments have to be
  declared **[YT-podcast-RSS]**.

## Captions and chapters

- **Chapters are essential** for a long conversation: one per topic, from `00:00`, at least 3, each ≥ 10 s
  **[YT-chapters]**. Name them after the topic, not "Part 2".
- **Captions**: review or upload a caption file **[YT-auto-captions]**. With several people, mark speaker
  changes (a dash or the speaker's name) when it is not obvious who talks.
- **Lower thirds** with each person's name and role the first time they appear, and again after a long
  break.

## Clips for Shorts

The strongest moments become Shorts: see [`shorts-from-long-form.md`](shorts-from-long-form.md). Mark them
while editing (a marker at each candidate moment) so they do not have to be found again.

## Common mistakes

- A long intro before anything interesting happens.
- Angle changes on a timer, or cutting to every "mm-hm".
- Out-of-sync cameras: lips and words drifting late in the episode.
- Echo from all mics open at once.
- Speakers at different levels.
- Cuts that change what someone meant.
- No chapters on a one-hour video.

## Checklist for this recipe

Run it before the core [`../review-checklist.md`](../review-checklist.md).

- [ ] Sync checked at the start, middle and end of the episode.
- [ ] The cold open is a real exchange from the episode that matches the title and thumbnail.
- [ ] Whoever talks is on screen; reactions shown only when they add something.
- [ ] No echo: mics of people who are not talking are muted or gated.
- [ ] Speakers at the same level; YouTube master at -14 LUFS / -1 dBTP; a separate podcast master if needed.
- [ ] No cut changes what someone meant.
- [ ] Chapters per topic in the description; names on lower thirds.
- [ ] Candidate Short moments marked.

## Sources

- **[YT-moments]**: https://support.google.com/youtube/answer/9314415
- **[YT-chapters]**: https://support.google.com/youtube/answer/9884579
- **[YT-end-screens]**: https://support.google.com/youtube/answer/6388789
- **[YT-auto-captions]**: https://support.google.com/youtube/answer/6373554
- **[YT-podcast-RSS]**: YouTube Help, delivering podcasts to YouTube with RSS ("podcast content you upload to YouTube cannot contain advertisements"). https://support.google.com/youtube/answer/13525207
- **[Apple Podcasts]**: "Audio requirements". https://podcasters.apple.com/support/893-audio-requirements
- **[AES TD1008 via Production Advice]**: https://productionadvice.co.uk/td1008/
- **[TechSmith]**: https://www.techsmith.com/blog/how-to-edit-videos-l-cuts-and-j-cuts/
- **[StudioBinder]**: https://www.studiobinder.com/blog/what-is-room-tone/
