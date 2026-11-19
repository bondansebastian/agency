// Records a user documentation video: opens a web page, plays a scenario against it with Playwright
// and writes an mp4.
//   node record.mjs --scenario <file.mjs> --url <http://localhost:5173/> [--serve "<command>"]
//                   [--out <dir>] [--ready "<css selector>"] [--brand <brand.json>] [--music <file>]
// --serve starts the app (for example "pnpm exec vite preview") and stops it afterwards.
// --brand applies a brand: credit and watermark, cover look, locale, music bed. The DOCS_BRAND environment
//   variable does the same when the flag is not given (for a package script that cannot know the path).
// DOCS_STORAGE_STATE: a saved logged-in browser state for apps that need a login (see lib.mjs).
// --music mixes this audio file under the video (overrides the brand's music).
import { spawn, spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadBrand, sleep, startRecording, toMp4 } from "./lib.mjs";

const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, all) => (a.startsWith("--") ? [[a.slice(2), all[i + 1]]] : [])),
);
if (!args.scenario || !args.url) {
  console.log(
    'Usage: node record.mjs --scenario <file.mjs> --url <url> [--serve "<command>"] [--out <dir>] [--ready "<selector>"] [--brand <brand.json>] [--music <file>]',
  );
  process.exit(1);
}

const scenarioFile = resolve(args.scenario);
const { meta, default: play } = await import(pathToFileURL(scenarioFile).href);
const outDir = resolve(args.out ?? join(dirname(scenarioFile), "out"));
const brand = loadBrand(args.brand ?? process.env.DOCS_BRAND);
const music = args.music ? resolve(args.music) : brand.music;

let server = null;
if (args.serve) {
  server = spawn(args.serve, { shell: true, stdio: "ignore", detached: process.platform !== "win32" });
  for (let i = 0; ; i++) {
    if (i > 120) throw new Error(`${args.url} did not answer within 2 minutes`);
    if (await fetch(args.url).then((r) => r.ok, () => false)) break;
    await sleep(1000);
  }
}
const stopServer = () => {
  if (!server?.pid) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"]);
  else process.kill(-server.pid);
};

try {
  console.log(`Recording ${scenarioFile} at ${args.url} ...`);
  const { rec, finish } = await startRecording({
    url: args.url,
    outDir,
    readySelector: args.ready ?? meta.readySelector ?? "body",
    brand,
  });
  await play(rec);
  const webm = await finish();
  const mp4 = join(outDir, `${meta.output}.mp4`);
  toMp4(webm, mp4, music ?? undefined);
  console.log(`Done: ${mp4}`);
} finally {
  stopServer();
}
