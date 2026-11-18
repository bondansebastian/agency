# Labels and copy (Indonesian)

## Fixed labels

| Where | Text |
| --- | --- |
| Cover eyebrow | `<NAMA APLIKASI> · PANDUAN PENGGUNA` (caps) |
| Cover title | The task, as a noun phrase: "Alur Retur Lengkap", "Cara Membuat Pesanan" |
| Cover note | `Data dalam video ini adalah data contoh` |
| Credit | `by IgnisLabs` |
| Step pill | `Langkah 1`, `Langkah 2`, ... |
| Extra cases pill | `Kasus lain` |
| Overview card | heading `Alur <topik> secara singkat`; cards `LANGKAH N`; footnote one sentence |
| Extra cases card | `Kasus lain` / `Urutan langkah tidak harus selalu sama. Berikut pilihan lain pada <objek> yang masih terbuka.` |
| Summary card | `Ringkasan`, then a numbered list of the steps in bold UI labels |
| Notion callout | `Data dalam video adalah data contoh. Setiap langkah di bawah menyebut tombol persis seperti yang tampil di aplikasi.` |
| Notion video caption | `Video: <judul> (<durasi>, dengan teks Bahasa Indonesia)` |

## Caption rules

- Write for the end user (staff), not for developers. Plain Indonesian, no English jargon when an Indonesian word exists.
- One idea per caption, 25 words at most, two lines at most.
- Actions are imperative: "Klik **Simpan**", "Pilih **customer**", "Isi **Catatan** bila perlu".
- Quote every UI label exactly as the app shows it (spelling, capital letters) in `<b>...</b>`. If the label changes in the app, change it in the scenario.
- Say what happened after an action ("Barang rusak langsung tercatat masuk gudang") before the next step.
- Use the product's own terms. Read the project's `AGENTS.md` and UI strings. Example: in one product the word shown to users is "retur" and the internal word "klaim" must never appear.
- Mention that data is sample data on the cover; never show real customer data.
- Do not promise behaviour the app does not have. If the preview cannot show a state, say it in a card instead of faking it.

## Notion manual text

Same language and the same exact button labels. Structure in `manual-page.md`.
