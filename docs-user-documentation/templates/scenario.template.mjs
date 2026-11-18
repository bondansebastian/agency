// A scenario for one feature. Copy this file, rename it after the feature and fill it in.
// Run: node record.mjs --scenario <this file> --url <app url> [--serve "<start command>"]

export const meta = {
  /** File name of the mp4 (and of the video in the manual). */
  output: "alur-fitur",
  /** CSS selector that is on screen when the app has loaded. */
  readySelector: "body",
};

/** @param {Awaited<ReturnType<typeof import("../scripts/lib.mjs").startRecording>>["rec"]} rec */
export default async function play(rec) {
  const { page, caption, click, type, move, sleep } = rec;

  // 1. The cover. Always first, always with the IgnisLabs credit (added by rec.cover).
  await rec.cover(
    {
      eyebrow: "NAMA APLIKASI · PANDUAN PENGGUNA",
      title: "Judul Fitur",
      subtitle: "Satu kalimat tentang apa yang dicapai pengguna<br>setelah mengikuti panduan ini",
      note: "Data dalam video ini adalah data contoh",
    },
    5500,
  );

  // 2. Overview card: the steps in one glance (the .row/.step/.arrow classes are in the overlay CSS).
  await rec.card(
    `
    <div class="k-h">Alur singkat</div>
    <div class="k-lead">Ringkasan tujuan fitur dalam satu atau dua kalimat.</div>
    <div class="row">
      <div class="step"><b>LANGKAH 1</b>Aksi pertama</div><div class="arrow">→</div>
      <div class="step"><b>LANGKAH 2</b>Aksi kedua</div><div class="arrow">→</div>
      <div class="step"><b>LANGKAH 3</b>Hasil akhir</div>
    </div>`,
    10000,
  );

  // 3. One block per step: caption first, then the action, then what happened.
  await caption("Langkah 1", "Klik tombol <b>Nama Tombol</b> untuk memulai", 1500);
  // await click(page.getByRole("button", { name: "Nama Tombol" }), 1000);
  // await type(page.getByPlaceholder("Cari ..."), "contoh");
  // await caption("Langkah 1", "Hasilnya tampil di sini", 3000);

  // 4. Other cases (optional): show choices without saving anything.
  // await rec.card(`<div class="k-h">Kasus lain</div>`, 4000);

  // 5. The summary card. Hide the cursor first.
  await rec.showCursor(false);
  await rec.card(
    `
    <div class="k-h2">Ringkasan</div>
    <div class="k-list">
      1. <b>Aksi pertama</b>: penjelasan singkat<br>
      2. <b>Aksi kedua</b>: penjelasan singkat</div>`,
    8000,
  );
}
