# Making a video

A captioned screen recording of one feature of a web app (Playwright + Chromium, sample data, captions, visible cursor, title cards, no voice-over), plus the matching manual page.

## Workflow

1. Read the profile (`profile.md`). Read the project's `AGENTS.md` and README for how to start the app with sample data (a browser preview, a demo account, a seeded database) and for terminology rules. If the app cannot show the feature without real data, say so and ask instead of recording real customer data.
2. Look in `<project>/scripts/manual-video/scenarios/` for a scenario that covers the feature. If found, run it again (step 6) and update only what changed in the UI.
3. If none: copy the scenario template to `<project>/scripts/manual-video/scenarios/<feature>.mjs` (the profile's template when it links one, otherwise `templates/scenario.template.mjs`), and copy `scripts/lib.mjs` and `scripts/record.mjs` to `<project>/scripts/manual-video/` if the project does not have them yet. Plan the story first: 3 to 6 steps, one caption per action, then optional other cases, then the summary card.
4. Make sure Playwright and ffmpeg are available (`troubleshooting.md`).
5. Write the scenario with the helpers: `rec.cover`, `rec.caption`, `rec.click`, `rec.type`, `rec.move`, `rec.card`, `rec.hideCaption`, `rec.showCursor`, `rec.page`.
6. Record:

   ```bash
   node scripts/manual-video/record.mjs --scenario <file> --url <app url> \
     [--serve "<command that starts the app>"] [--out <dir>] \
     [--profile <pack>/docs-user-documentation/profile.json] [--music <file>]
   ```

   A 4-minute video takes about 4 minutes of real time; run it in the background and wait.
7. **Look at the result.** Make a contact sheet (`ffmpeg -i <mp4> -vf "fps=1/10,scale=480:-1,tile=3x4" -frames:v 2 sheet_%d.png`) and view it. Check:
   - the cover shows the title, and the profile's credit when it has one;
   - with a credit, the watermark is on every other frame and does not cover a button;
   - every caption is readable and matches the screen;
   - no frame is blank or shows an error;
   - with music, the mp4 has an audio stream (`ffprobe -v error -show_entries stream=codec_type -of csv=p=0 <mp4>` prints `video` and `audio`).

   Fix and re-record until it is right.
8. Save the scenario in the project (commit it if the project uses git). Publish the mp4 with its manual page (`publishing-to-notion.md`, or wherever the profile or user says). Report the link, the duration and size, and what the sample data covers.

## Fixed parts of every video

- A cover first, made with `rec.cover`: a small line on top (app name and "user guide" in the guide's language), the title as the task, one sentence on what the user achieves, and a note that the data is sample data.
- An overview card with the steps at a glance.
- One block per step: caption, action, then what happened.
- A summary card at the end, with the cursor hidden.
- Never remove or hide the credit watermark when the profile has a credit.

## Captions

- Write for the end user, not for developers, in the guide's language. No jargon when a plain word exists.
- One idea per caption, 25 words at most, two lines at most.
- Actions are imperative: "Click **Save**", "Choose a **customer**".
- Quote every UI label exactly as the app shows it (spelling, capital letters) in `<b>...</b>`. If the label changes in the app, change it in the scenario.
- Say what happened after an action before the next step.
- Use the product's own user-facing terms (read the project's `AGENTS.md` and UI strings). Never use an internal or code name the user does not see.
- Do not promise behaviour the app does not have. If the preview cannot show a state, say it in a card instead of faking it.
- Fixed labels (step pill, "other cases", "summary", the sample-data note) come from the profile's label set when it has one; otherwise translate them once into the guide's language and keep them the same through the video.

## Pace

A caption stays on screen about one second per three words plus one second. Typing is 110 ms per character. Cards stay 4 to 12 seconds. A whole feature video should be 2 to 5 minutes.
