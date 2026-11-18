# The Notion User Manual page

Where: the product's project page in Notion has a child page **User Manual** (icon 📘). Each guide is a child page of it, titled `<Modul> — <Judul panduan>` (icon 📦 or another fitting emoji). If the User Manual page does not exist, create it:

> Kumpulan panduan penggunaan <Nama aplikasi>, dikelompokkan per modul. Setiap panduan berada di sub-halaman tersendiri di bawah ini.

then a `## <Modul>` heading per module, with each guide page under its module heading. Never put the guide on another product's User Manual. If you cannot tell which product page it belongs under, ask.

Guide page, in this order (max about 500 words; split into sub-pages if longer):

1. Two or three sentences: what the feature does for the user.
2. The video (`<video source="file-upload://...">caption</video>`), then the gray callout about sample data.
3. `## Alur singkat`: the steps as a numbered list.
4. One `## Langkah N: ...` section per step: numbered actions with exact button labels in bold, then one sentence on what happens.
5. `## Kasus lain`: bullets, one per alternative path.
6. A small table of statuses, only when the feature has statuses.
7. `## Tips`: three to five bullets.

Uploading the mp4 with the Notion connector:

1. `notion-create-file-upload` with `filename` = the mp4 name and `content_type` = `video/mp4` (single-part limit 20 MiB; the recording is about 2.5 MB).
2. `POST` the file to the returned `upload_url` as `multipart/form-data` (field `file`) with the returned headers, for example `curl -X POST "<upload_url>" -H "authorization: <value from upload_headers>" -F "file=@video.mp4;type=video/mp4"`. The response status must be `uploaded`.
3. Put `<video source="file-upload://<file_upload_id>">caption</video>` on the page with `notion-create-pages` or `notion-update-page`. To replace an old video, upload the new file and replace the old `<video ...>` block.
4. `notion-fetch` the page and confirm the video block is there.

Rules: never put a title at the top of the content (it is the page title); use `<b>` for bold labels; keep step text in line with the video; do not delete existing pages (add a "superseded by" note instead).
