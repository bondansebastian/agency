# Troubleshooting

- **Requirements:** Node 20 or newer, ffmpeg on the PATH (Windows: `winget install Gyan.FFmpeg`; Linux: `apt install ffmpeg`), Playwright with Chromium and Playwright's own ffmpeg (`npx playwright install chromium ffmpeg`).
- **The recording is empty, no error:** the Playwright version and its downloaded browser builds do not match. Install the matching browsers, or point `IGNIS_PLAYWRIGHT` at another Playwright install's `index.js` and `IGNIS_CHROMIUM` at a browser executable. Check with a 3-second test recording first.
- **Overlay text has no style / captions are plain:** the app has a strict CSP that drops `<style>` elements and `style=""` attributes in injected HTML. `lib.mjs` uses a constructable stylesheet and classes (`k-*`). Style any new card with classes added to that stylesheet, never inline.
- **A caption disappears behind a dialog:** native `<dialog>` is in the top layer. The overlay uses popovers and re-shows them on every helper call; call a helper (for example `rec.caption`) after a dialog opens.
- **Clicks time out with "intercepts pointer events":** the overlay must have `pointer-events:none` (it does in `lib.mjs`); do not add overlay elements without it.
- **A native `<select>` list is not visible in the video:** headless Chromium does not draw it. Move the cursor to it, use `selectOption`, and explain the choice in a caption.
- **The app server does not start:** pass `--serve` with the exact command and `--url` with the address it prints. The runner waits up to 2 minutes and stops the server afterwards.
- **After the app changed:** re-run the same scenario. Edit it only where a label, a button or the flow changed; update the sample data first if the preview must show new behaviour.
- **`--music` fails or the video is silent:** it needs ffmpeg and ffprobe on the PATH and the path of the mp3 in this skill's `assets/` folder. A video longer than the bed (about 6 minutes) loops it, with a small seam.
