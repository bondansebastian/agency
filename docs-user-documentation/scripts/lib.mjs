/* global window, document, CSSStyleSheet */
// Shared pieces of the user documentation videos: the on-screen overlay (caption bar, cursor, click
// ripple, title cards, cover and optional credit watermark) and the helpers a scenario uses to drive a
// web page. A scenario only says what to click and what to say. Everything brand-specific (credit text,
// cover look, locale, music) comes from a profile (see references/profile.md), never from this file.
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Playwright is taken from DOCS_PLAYWRIGHT (path to another install's index.js), else from
 * @playwright/test, else from playwright. DOCS_CHROMIUM names a browser executable to use instead of
 * Playwright's own (the browser builds must match the Playwright version, or the recording is silently empty).
 */
async function loadChromium() {
  const other = process.env.DOCS_PLAYWRIGHT;
  let mod;
  if (other) mod = await import(pathToFileURL(other).href);
  else {
    try {
      mod = await import("@playwright/test");
    } catch {
      mod = await import("playwright");
    }
  }
  return mod.chromium ?? mod.default.chromium;
}

export const WIDTH = 1280;
export const HEIGHT = 720;
/** Without a profile: no credit, no watermark, no music, the default look. */
export const DEFAULT_PROFILE = { credit: "", locale: "en-US", css: "", music: null };

/**
 * Reads a profile.json (see references/profile.md). Fields, all optional:
 *   credit   maker credit, shown as a pill on the cover and as a small watermark on every other frame
 *   locale   browser locale of the recording, for example "id-ID"
 *   cssFile  a CSS file appended to the overlay stylesheet (restyle the cover with `#demo-card.cover ...`)
 *   music    an audio file mixed quietly under the video
 * `cssFile` and `music` are resolved against the folder of the profile file.
 */
export function loadProfile(file) {
  if (!file) return { ...DEFAULT_PROFILE };
  const path = resolve(file);
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const here = dirname(path);
  return {
    ...DEFAULT_PROFILE,
    ...raw,
    css: raw.cssFile ? readFileSync(resolve(here, raw.cssFile), "utf8") : (raw.css ?? ""),
    music: raw.music ? resolve(here, raw.music) : null,
  };
}
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Installs the overlay in the page (runs in the browser, so it must stay self-contained).
 * Apps keep their production CSP, which blocks <style> elements and style="" attributes, so the CSS
 * is a constructable stylesheet and all text styling is done with classes. The overlay elements are
 * popovers: they sit in the top layer, above the native <dialog>s of the app, and `front()` re-shows
 * them so they stay above a dialog that opened later.
 */
function installOverlay({ credit, css }) {
  const make = (id, css) => {
    const el = document.createElement("div");
    el.id = id;
    el.setAttribute("popover", "manual");
    el.style.cssText = css; // CSSOM writes are allowed under the CSP
    document.documentElement.appendChild(el);
    return el;
  };
  const base =
    "position:fixed;margin:0;padding:0;border:0;background:transparent;overflow:visible;inset:auto;";
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`
    #demo-cap,#demo-cur,#demo-card{font-family:Inter,system-ui,sans-serif}
    #demo-cap,#demo-cap *,#demo-cur,#demo-cur *,#demo-card,#demo-card *{pointer-events:none!important}
    #demo-cap .pill{background:#5b5bd6;color:#fff;border-radius:999px;padding:4px 12px;font-size:15px;font-weight:700;white-space:nowrap}
    #demo-cur svg{filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))}
    .demo-ripple{position:absolute;left:-18px;top:-18px;width:36px;height:36px;border-radius:50%;
      border:3px solid #5b5bd6;background:rgba(91,91,214,.25);animation:demoRipple .55s ease-out forwards}
    @keyframes demoRipple{from{transform:scale(.2);opacity:1}to{transform:scale(1.5);opacity:0}}
    #demo-card .row{display:flex;gap:14px;align-items:stretch;justify-content:center;margin-top:34px}
    #demo-card .step{background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.28);border-radius:14px;
      padding:16px 18px;width:230px;text-align:left;font-size:19px;line-height:1.3}
    #demo-card .step b{display:block;font-size:15px;opacity:.8;margin-bottom:6px;letter-spacing:.04em}
    #demo-card .arrow{align-self:center;font-size:28px;opacity:.7}
    .k-eyebrow{font-size:20px;letter-spacing:.2em;opacity:.85;font-weight:600}
    .k-title{font-size:64px;font-weight:800;margin-top:18px}
    .k-sub{font-size:26px;margin-top:20px;opacity:.92;max-width:900px;line-height:1.4}
    .k-fine{font-size:16px;margin-top:44px;opacity:.7}
    .k-h{font-size:40px;font-weight:800}
    .k-h2{font-size:44px;font-weight:800}
    .k-lead{font-size:22px;margin-top:14px;opacity:.9;max-width:980px}
    .k-foot{font-size:19px;margin-top:34px;opacity:.85}
    .k-list{font-size:23px;margin-top:22px;line-height:1.7;text-align:left;max-width:860px}
    .k-brand{font-size:17px;margin-top:36px;opacity:.7}
    .k-by{font-size:22px;font-weight:600;letter-spacing:.12em;margin-top:30px;padding:8px 22px;border-radius:999px;
      background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.35)}
    #demo-wm{font-family:Inter,system-ui,sans-serif;pointer-events:none!important}
    ${css}
  `);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

  const cap = make(
    "demo-cap",
    base +
      "left:50%;bottom:26px;transform:translateX(-50%);max-width:880px;min-width:420px;background:rgba(17,17,28,.92);" +
      "color:#fff;border-radius:16px;padding:14px 22px;font-size:21px;line-height:1.35;display:flex;gap:14px;" +
      "align-items:center;box-shadow:0 8px 30px rgba(0,0,0,.35);",
  );
  const cur = make(
    "demo-cur",
    base + "left:0;top:0;width:0;height:0;transition:transform .7s cubic-bezier(.4,0,.2,1);",
  );
  cur.innerHTML =
    '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2l15 9-6.5 1.6L9.2 19z" fill="#fff" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  const card = make(
    "demo-card",
    base +
      "inset:0;width:100vw;height:100vh;box-sizing:border-box;" +
      "background:linear-gradient(135deg,#3a3aa8,#5b5bd6 55%,#7a5bd6);color:#fff;display:none;" +
      "flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;",
  );

  // Small muted watermark, bottom right (clear of the caption bar and of the dialog buttons).
  // Only when the profile has a credit.
  const wm = credit
    ? make(
        "demo-wm",
        base +
          "right:12px;bottom:6px;font-size:12px;line-height:1;letter-spacing:.06em;color:rgba(255,255,255,.82);" +
          "background:rgba(17,17,28,.5);border-radius:999px;padding:4px 10px;",
      )
    : null;
  if (wm) wm.textContent = credit;
  let coverShown = false;

  const reshow = (el) => {
    if (el.matches(":popover-open")) el.hidePopover();
    el.showPopover();
  };
  const front = () => {
    if (wm && !coverShown) reshow(wm);
    reshow(cap);
    reshow(cur);
  };
  window.__demo = {
    front,
    caption(step, text) {
      cap.innerHTML = (step ? `<span class="pill">${step}</span>` : "") + `<span>${text}</span>`;
      cap.style.display = text ? "flex" : "none";
      front();
    },
    hideCaption() {
      cap.style.display = "none";
    },
    moveCursor(x, y) {
      cur.style.transform = `translate(${x}px,${y}px)`;
      front();
    },
    ripple() {
      const ripple = document.createElement("div");
      ripple.className = "demo-ripple";
      cur.appendChild(ripple);
      setTimeout(() => {
        ripple.remove();
      }, 700);
    },
    showCursor(visible) {
      cur.style.display = visible ? "block" : "none";
    },
    /** A cover card has the maker credit in its own text, so the watermark is hidden while it shows. */
    card(html, cover) {
      coverShown = cover;
      card.classList.toggle("cover", !!cover);
      card.innerHTML = html;
      card.style.display = "flex";
      reshow(card);
      if (!wm) return;
      if (cover) {
        if (wm.matches(":popover-open")) wm.hidePopover();
      } else {
        reshow(wm);
      }
    },
    hideCard() {
      coverShown = false;
      card.classList.remove("cover");
      card.style.display = "none";
      if (card.matches(":popover-open")) card.hidePopover();
      front();
    },
  };
  cap.style.display = "none";
  front();
}

/**
 * Opens the page in a recording browser context and returns the helpers a scenario uses.
 * `finish()` closes everything and returns the path of the recorded webm.
 */
export async function startRecording({ url, outDir, readySelector = "body", profile = DEFAULT_PROFILE }) {
  const { credit, css, locale } = { ...DEFAULT_PROFILE, ...profile };
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  // DOCS_CHROMIUM: use this browser instead of Playwright's own (see references/troubleshooting.md).
  const executablePath = process.env.DOCS_CHROMIUM;
  const chromium = await loadChromium();
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    recordVideo: { dir: outDir, size: { width: WIDTH, height: HEIGHT } },
    locale,
  });
  const page = await context.newPage();
  await page.goto(url);
  await page.waitForSelector(readySelector, { timeout: 30_000 });
  await page.evaluate(installOverlay, { credit, css });

  const demo = (name, ...args) => page.evaluate(([fn, a]) => window.__demo[fn](...a), [name, args]);

  const rec = {
    page,
    sleep,
    /** Shows a caption (optionally with a pill such as "Langkah 1") and waits `hold` ms. */
    async caption(step, text, hold = 0) {
      await demo("caption", step, text);
      if (hold) await sleep(hold);
    },
    hideCaption: () => demo("hideCaption"),
    showCursor: (visible) => demo("showCursor", visible),
    /** Moves the visible cursor to the element. */
    async move(locator) {
      await locator.scrollIntoViewIfNeeded();
      const box = await locator.boundingBox();
      await demo("showCursor", true);
      await demo("moveCursor", box.x + Math.min(box.width / 2, 120), box.y + box.height / 2);
      await sleep(850);
    },
    /** Moves the cursor to the element, shows a ripple and clicks it. */
    async click(locator, after = 700) {
      await rec.move(locator);
      await demo("ripple");
      await sleep(200);
      await locator.click();
      await sleep(after);
      await demo("front");
    },
    /** Clicks the field and types slowly, like a person. */
    async type(locator, text) {
      await rec.click(locator, 200);
      await locator.pressSequentially(text, { delay: 110 });
      await sleep(900);
    },
    /** Full-screen title card. `html` uses the k-* classes and .row/.step/.arrow of the overlay CSS. */
    async showCard(html) {
      await demo("hideCaption");
      await demo("card", html, false);
    },
    /**
     * The cover card, with the profile's credit when it has one. Every video starts with one.
     * `eyebrow` is the small line on top, `note` the small line below (for example "data contoh").
     */
    async showCover({ eyebrow, title, subtitle, note = "" }) {
      await demo("hideCaption");
      await demo(
        "card",
        `<div class="k-eyebrow">${eyebrow}</div>
         <div class="k-title">${title}</div>
         <div class="k-sub">${subtitle}</div>
         ${credit ? `<div class="k-by">${credit}</div>` : ""}
         ${note ? `<div class="k-fine">${note}</div>` : ""}`,
        true,
      );
    },
    /** Shows the cover for `ms` milliseconds and leaves it up until the next card or the first hideCard. */
    async cover(options, ms) {
      await rec.showCover(options);
      await sleep(ms);
    },
    async hideCard() {
      await demo("hideCard");
      await sleep(500);
    },
    /** Shows a title card for `ms` milliseconds, then removes it. */
    async card(html, ms) {
      await rec.showCard(html);
      await sleep(ms);
      await rec.hideCard();
    },
  };

  const finish = async () => {
    await page.close();
    await context.close();
    await browser.close();
    const webm = readdirSync(outDir).find((f) => f.endsWith(".webm"));
    if (!webm) throw new Error(`No recording found in ${outDir}`);
    return join(outDir, webm);
  };
  return { rec, finish };
}

/**
 * webm to a small H.264 mp4 (the first 0.8 s, a blank page while it loads, is cut).
 * With `music` (a music bed, normally from the profile) the music is mixed under the finished video.
 */
export function toMp4(webm, mp4, music) {
  const run = spawnSync(
    "ffmpeg",
    [
      ...["-y", "-v", "error", "-ss", "0.8", "-i", webm],
      ...["-c:v", "libx264", "-preset", "slow", "-crf", "28", "-pix_fmt", "yuv420p", "-r", "25"],
      ...["-movflags", "+faststart", mp4],
    ],
    { stdio: "inherit" },
  );
  if (run.error || run.status !== 0) {
    throw new Error(
      "ffmpeg failed or is not installed (Windows: winget install Gyan.FFmpeg; Linux: apt install ffmpeg).",
    );
  }
  if (music) addMusic(mp4, music);
}

/**
 * Mixes a music bed under a finished mp4: looped or cut to the video length, 2 s fade in, 3 s fade out,
 * about -24 LUFS (quiet, under the captions). The video stream is copied, not re-encoded.
 */
export function addMusic(mp4, music) {
  const probe = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp4],
    { encoding: "utf8" },
  );
  const duration = Number.parseFloat(probe.stdout);
  if (!(duration > 5)) throw new Error(`Could not read the duration of ${mp4} (ffprobe missing?).`);
  const tmp = mp4.replace(/\.mp4$/, ".music.mp4");
  const filter = `afade=t=in:d=2,afade=t=out:st=${(duration - 3).toFixed(2)}:d=3,loudnorm=I=-24:TP=-3:LRA=7`;
  const run = spawnSync(
    "ffmpeg",
    [
      ...["-y", "-v", "error", "-i", mp4, "-stream_loop", "-1", "-i", music],
      ...["-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "128k"],
      ...["-af", filter, "-t", String(duration), "-movflags", "+faststart", tmp],
    ],
    { stdio: "inherit" },
  );
  if (run.error || run.status !== 0) throw new Error(`Mixing the music into ${mp4} failed.`);
  renameSync(tmp, mp4);
}
