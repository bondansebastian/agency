# What this skill reads from an extension

How a skill finds its extension counterpart, the precedence, and how to create and install an extension are defined once, in the `context-management` skill. This file covers only what `docs-user-documentation` takes from its extension.

The extension is the folder of the counterpart skill `agency-skills-<ext_name>:docs-user-documentation`. Loading that skill shows the folder's path; every file below is in it.

Without an extension: no credit, no watermark, no music, the default look (`video-style.md`), and the language rule in `language-preference.md`. Do not ask the user to create an extension; mention once, in the final report, that one can add a credit, a look and a fixed language.

## Files in the counterpart's folder

| File | Purpose |
|---|---|
| `EXTENSION.md` | Required. Read it first. Settings and fixed rules in plain language: brand, language, default output (written guide or video), publishing target and Notion integration. It links to the files below. |
| `brand.json` | Machine settings for the video recorder, passed as `--brand`. |
| Anything `EXTENSION.md` links to | Label sets, a look reference, a scenario template, a Notion page structure, a CSS file, a music file. Use a linked file in place of this skill's own file of the same purpose. |

## `brand.json`

All fields are optional:

```json
{
  "credit": "by Example Studio",
  "locale": "en-US",
  "cssFile": "cover.css",
  "music": "assets/bed.mp3"
}
```

| Field | Effect | Without it |
|---|---|---|
| `credit` | A pill on the cover and a small watermark on every other frame | No credit, no watermark |
| `locale` | Browser locale of the recording | `en-US` |
| `cssFile` | CSS appended to the overlay stylesheet; restyle the cover with `#demo-card.cover ...` | The default look (`video-style.md`) |
| `music` | Audio file mixed quietly under the video | Silent video |

`cssFile` and `music` are resolved against the folder of `brand.json`.

## Limits

An extension never loosens the rules about the reader: no internal identifiers, sample data only, exact UI labels.
