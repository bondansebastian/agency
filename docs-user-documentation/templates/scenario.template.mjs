// A scenario for one feature. Copy this file, rename it after the feature and fill it in.
// Write every caption and card in the guide's language (the profile's, when there is one).
// Run: node record.mjs --scenario <this file> --url <app url> [--serve "<start command>"]
//        [--profile <pack>/docs-user-documentation/profile.json]

export const meta = {
  /** File name of the mp4 (and of the video in the manual). */
  output: "feature-flow",
  /** CSS selector that is on screen when the app has loaded. */
  readySelector: "body",
};

/** @param {Awaited<ReturnType<typeof import("../lib.mjs").startRecording>>["rec"]} rec */
export default async function play(rec) {
  const { page, caption, click, type, move, sleep } = rec;

  // 1. The cover. Always first. The profile's credit, when it has one, is added by rec.cover.
  await rec.cover(
    {
      eyebrow: "APP NAME · USER GUIDE",
      title: "Feature Title",
      subtitle: "One sentence about what the user achieves<br>after following this guide",
      note: "The data in this video is sample data",
    },
    5500,
  );

  // 2. Overview card: the steps in one glance (the .row/.step/.arrow classes are in the overlay CSS).
  await rec.card(
    `
    <div class="k-h">The flow in short</div>
    <div class="k-lead">What the feature is for, in one or two sentences.</div>
    <div class="row">
      <div class="step"><b>STEP 1</b>First action</div><div class="arrow">→</div>
      <div class="step"><b>STEP 2</b>Second action</div><div class="arrow">→</div>
      <div class="step"><b>STEP 3</b>The result</div>
    </div>`,
    10000,
  );

  // 3. One block per step: caption first, then the action, then what happened.
  await caption("Step 1", "Click <b>Button Name</b> to start", 1500);
  // await click(page.getByRole("button", { name: "Button Name" }), 1000);
  // await type(page.getByPlaceholder("Search ..."), "example");
  // await caption("Step 1", "The result appears here", 3000);

  // 4. Other cases (optional): show choices without saving anything.
  // await rec.card(`<div class="k-h">Other cases</div>`, 4000);

  // 5. The summary card. Hide the cursor first.
  await rec.showCursor(false);
  await rec.card(
    `
    <div class="k-h2">Summary</div>
    <div class="k-list">
      1. <b>First action</b>: short explanation<br>
      2. <b>Second action</b>: short explanation</div>`,
    8000,
  );
}
