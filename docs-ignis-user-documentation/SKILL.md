---
name: docs-ignis-user-documentation
description: Create IgnisLabs-branded Indonesian user documentation for a web app feature - a captioned screen-recording video (cover "by IgnisLabs", muted watermark, Indonesian captions, cursor, title cards) and the matching Notion User Manual page. Use when asked for a user manual video, tutorial video, walkthrough video, panduan pengguna or manual page of a feature, or to re-record an existing manual video after the app changed.
version: 1.0.0
---

# IgnisLabs user documentation

A captioned screen-recording video of one feature of a web app (Playwright + Chromium, sample data, Indonesian captions, visible cursor, title cards, quiet ambient music, no voice-over) plus the matching page in the product's **User Manual** in Notion.

## When to use

- Asked for a user manual video, tutorial video, walkthrough video, "panduan pengguna" or manual page of a feature.
- Asked to re-record an existing manual video after the app changed.
- Not for API docs or developer docs.

## Rules that never change

- The cover always says "by IgnisLabs" and is made with `rec.cover`. The cover has the look of ignislabs.dev (dark, ember glow, fire-gradient title).
- The watermark is added by `lib.mjs` and is never removed or hidden, except on the cover.
- Captions and manual text are in Indonesian.
- UI labels are quoted exactly as the app shows them, in bold.
- Use the product's own user-facing terminology (read the project's `AGENTS.md` and UI strings). Never use an internal or code name the user does not see.
- The data in the video is sample data, and the cover says so. Never record real customer data.
- Never change the visual constants in [references/branding.md](references/branding.md).
- Every video gets the IgnisLabs ambient bed (`assets/ignis-ambient-bed.mp3`, generated, no third-party licence) through `--music`, at about -24 LUFS, unless the user asks for a silent video. Use no other music and no voice-over.

## Workflow

1. Read the project's `AGENTS.md` and README for how to start the app with sample data (a browser preview, a demo account, a seeded database) and for terminology rules. If the app cannot show the feature without real data, say so and ask instead of recording real customer data.
2. Look in `<project>/scripts/manual-video/scenarios/` for a scenario that covers the feature. If found, run it again (step 6) and update only what changed in the UI.
3. If none: copy `templates/scenario.template.mjs` to `<project>/scripts/manual-video/scenarios/<feature>.mjs`, and copy `scripts/lib.mjs` and `scripts/record.mjs` to `<project>/scripts/manual-video/` if the project does not have them yet. Plan the story first: 3 to 6 steps, one caption per action, then optional "Kasus lain", then the summary card. Follow [references/labels.md](references/labels.md).
4. Make sure Playwright and ffmpeg are available ([references/troubleshooting.md](references/troubleshooting.md)).
5. Write the scenario with the helpers: `rec.cover`, `rec.caption`, `rec.click`, `rec.type`, `rec.move`, `rec.card`, `rec.hideCaption`, `rec.showCursor`, `rec.page`.
6. Record: `node scripts/manual-video/record.mjs --scenario <file> --url <app url> [--serve "<command that starts the app>"] [--out <dir>] --music <this skill's folder>/assets/ignis-ambient-bed.mp3`. A 4-minute video takes about 4 minutes of real time; run it in the background and wait.
7. **Look at the result.** Make a contact sheet (`ffmpeg -i <mp4> -vf "fps=1/10,scale=480:-1,tile=3x4" -frames:v 2 sheet_%d.png`) and view it. Check:
   - the cover shows "by IgnisLabs";
   - the watermark is on every other frame and does not cover a button;
   - every caption is readable and matches the screen;
   - no frame is blank or shows an error;
   - the mp4 has an audio stream (`ffprobe -v error -show_entries stream=codec_type -of csv=p=0 <mp4>` prints `video` and `audio`).

   Fix and re-record until it is right.
8. Save the scenario in the project (commit it if the project uses git). Put the mp4 in Notion ([references/manual-page.md](references/manual-page.md)). Report the Notion link, the duration and size, and what the sample data covers.

## Pointers

- [references/branding.md](references/branding.md): colours, sizes, cover palette, video format, pace.
- [references/labels.md](references/labels.md): fixed Indonesian labels and caption rules.
- [references/manual-page.md](references/manual-page.md): the Notion page structure and the video upload steps.
- [references/troubleshooting.md](references/troubleshooting.md): requirements and fixes.
- `assets/ignis-ambient-bed.mp3`: the music bed (about 6 minutes, looped for longer videos). `scripts/make-bed.py`: generates it; only needed to retune the bed.
- `scripts/lib.mjs`: overlay and helpers. `scripts/record.mjs`: runner. `templates/scenario.template.mjs`: starting point for a scenario.
