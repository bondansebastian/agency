# Default video look

The look `scripts/lib.mjs` gives a video when no extension changes it. An extension can restyle the cover and add a credit and music (`extension.md`); change the look there, not in `lib.mjs`.

| Element | Value |
| --- | --- |
| Credit | None by default. With a `credit` in the extension's `brand.json`: a pill on the cover, and a 12px watermark (`rgba(255,255,255,.82)` on a `rgba(17,17,28,.5)` pill, bottom right) on every other frame, above dialogs and cards. |
| Cards and cover | Full-screen card, indigo gradient `linear-gradient(135deg,#3a3aa8,#5b5bd6 55%,#7a5bd6)`, white text, centered. Cover order: eyebrow, title, subtitle, credit pill (if any), optional note. The cover carries the `.cover` class while it shows. |
| Font | Inter, then system-ui, sans-serif |
| Accent colour | `#5b5bd6` (pills, click ripple) |
| Caption bar | Bottom center, 26px from the bottom, min-width 420px, max-width 880px, `rgba(17,17,28,.92)` background, white text 21px/1.35, radius 16, padding 14px 22px. Optional step pill on the left. Keep captions to two lines. |
| Cursor | White arrow with a dark outline and a soft drop shadow; moves in 0.7 s with an ease curve; a 36px accent ripple on every click. |
| Card type scale | eyebrow 20px caps; cover title 64px; card heading 40px (summary 44px); lead 22px; list 23px/1.7; footnote 19px; fine print 16px |
| Step cards | Row of translucent cards (230px wide) with a small uppercase step label and arrows between |
| Video | 1280x720, 25 fps, H.264 (libx264, preset slow, crf 28, yuv420p), `+faststart`. The first 0.8 s (blank page while loading) is cut. About 2.5 MB for 4 minutes. |
| Music | None by default. With a bed: cut or looped to the video length, 2 s fade in, 3 s fade out, about -18 LUFS (true peak -3 dBTP), AAC 128 kbps; the video stream is copied, not re-encoded. |
| Locale | `en-US` unless the extension's `brand.json` sets `locale` |
