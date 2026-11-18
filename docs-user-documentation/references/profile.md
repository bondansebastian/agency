# Profiles

A profile holds everything that belongs to one team or brand. The skill is the same for everyone; the profile says who the documentation is made for. Nothing brand-specific belongs in this skill.

## Where to look, in this order

1. **Project pack** — `<project-root>/.agents/profiles/<pack>/docs-user-documentation/PROFILE.md`. A pack is a folder, usually a git submodule, that a team mounts in each of its projects.
2. **User-level pack** — `~/.agents/profiles/<pack>/docs-user-documentation/PROFILE.md`, for every project on this machine.
3. **No profile** — use the defaults in the table below. Do not ask the user to create one; mention once, in the final report, that a profile can add a credit, a look and a fixed language.

The first location that has a `PROFILE.md` for this skill wins. If two packs in the same location both have one, ask the user which to use and save the answer in `MEMORY.md` as `- **Profile pack** — <pack>`.

## A declared pack that is empty

If `.gitmodules` lists a path under `.agents/profiles/`, or a pack folder exists but has no files, the project has a profile that was not fetched. Do not treat this as "no profile":

1. Run `git submodule update --init <path>`.
2. If that fails (no access to a private repository, no network), stop and tell the user which pack is missing and why. Continue without it only if the user says so, and say in the report that the output is unbranded.

## What a pack contains

| File | Purpose |
|---|---|
| `PROFILE.md` | Required. Read it first. Settings and fixed rules in plain language: brand, language, default output, publishing target and tool. It links to the files below. |
| `profile.json` | Machine settings for the video recorder, passed as `--profile`. |
| Anything `PROFILE.md` links to | Label sets, a look reference, a scenario template, a Notion page structure, a CSS file, a music file. Use a linked file in place of this skill's own file of the same purpose. |

`profile.json` fields, all optional:

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

`cssFile` and `music` are resolved against the folder of `profile.json`.

## Precedence

1. An explicit instruction from the user in this conversation.
2. The profile's fixed rules ("never", "always", "fixed").
3. `MEMORY.md` in `<project-root>/.agents/contexts/agency/docs-user-documentation/`.
4. This skill's defaults.

A profile never loosens the rules about the reader: no internal identifiers, sample data only, exact UI labels.

## Making a pack

1. Create a repository (private if the brand should stay private) with one folder per skill, named exactly like the skill.
2. Add `docs-user-documentation/PROFILE.md`, and `profile.json` if videos are wanted.
3. Mount it in each project: `git submodule add <url> .agents/profiles/<pack>`.
4. Keep it out of builds and images: add `.agents/` to `.dockerignore`, and do not fetch submodules in CI or on the deployment platform unless the build needs them. A pack is only read by the people and agents who write documentation.
