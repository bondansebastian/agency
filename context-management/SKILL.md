---
name: context-management
description: "Use whenever an agency skill needs to read, save, or look up customized or parameterized data for a project — remembered preferences and variables (MEMORY.md), a team or brand profile (PROFILE.md from a profile pack), or saved credentials — and whenever you create, move, migrate, or audit anything under a project's .agents/ folder. Defines where each kind of data lives, the lookup order and precedence, the entry format, legacy-folder migration, how profile packs are mounted, and what must never be stored. Also use when writing or changing a skill that stores data."
version: 1.0.0
---

# Context Management

One layout for everything an agency skill customizes per project, team or person. Skills hold the method; the data that changes from project to project lives outside the skill, in the project's `.agents/` folder. Every agency skill that stores or reads such data follows this skill, and names only its own keys.

## The three kinds of data

| Kind | What it is | Who writes it | Path |
|---|---|---|---|
| **Memory** | Non-sensitive values remembered for this project so the user is not asked twice: a pricing variable, a default language, a Notion target | The skill, at the user's word | `<project-root>/.agents/contexts/agency/<skill-name>/MEMORY.md` |
| **Profile** | A team's or brand's house rules and assets: credit, look, fixed language, labels, publishing target. The same across many projects | The team, in a profile pack. Skills only read it | `<project-root>/.agents/contexts/profiles/<pack>/<skill-name>/PROFILE.md` |
| **Credentials** | Secrets: logins, tokens | The skill, only after the user says yes | `<project-root>/.agents/credentials/agency/<skill-name>/CREDENTIALS.md` |

```text
<project-root>/.agents/
├── contexts/
│   ├── agency/                      # memory, written by skills, committed
│   │   └── <skill-name>/MEMORY.md
│   └── profiles/                    # profile packs, read-only, usually git submodules
│       └── <pack>/<skill-name>/PROFILE.md
└── credentials/                     # secrets, never committed
    └── agency/<skill-name>/CREDENTIALS.md
```

- `<skill-name>` is the skill's `name` exactly (`sales-quotation`, not `agency:sales-quotation`).
- `<project-root>` is the root of the project being worked in, normally the git top level. Never the skill's own folder, so it does not matter where the skill is installed. Re-derive it whenever the active project changes within a session, and never reuse another project's files.
- Create a memory or credentials folder and file when first needed; don't wait for one to exist.
- A profile pack can also sit at `~/.agents/contexts/profiles/<pack>/` to apply to every project on the machine.

## Reading: order and precedence

When a skill needs a value:

1. **The user's instruction in this conversation.** Use it.
2. **Profile.** Look for `PROFILE.md` for this skill in the project's packs, then in the user-level packs. Read it before drafting or computing anything, and follow the files it links to. Its fixed rules ("always", "never", "fixed") win over memory and over the skill's defaults.
3. **Memory.** Check `MEMORY.md` for the value.
4. **The skill's default**, or ask the user when the skill says the value must be asked.

Further rules:

- If two packs in the same place both have a `PROFILE.md` for the skill, ask which to use and save the answer in the skill's `MEMORY.md` as `- **Profile pack** — <pack>`.
- No profile is the normal case for most projects. Work with the skill's defaults and do not ask the user to create one.
- A profile never loosens a skill's safety rules (for example: no internal identifiers in user documents, sample data only, no secrets in files).
- Check credentials only when a login is actually needed, never at the start of a task.

### A declared pack that is empty

If `.gitmodules` lists a path under `.agents/contexts/profiles/`, or a pack folder exists but has no files, the project has a profile that was not fetched. Do not treat it as "no profile":

1. Run `git submodule update --init <path>`.
2. If that fails (no access to a private repository, no network), stop and tell the user which pack is missing and why. Continue without it only if the user says so, and say in the report that the profile was not applied.

## Writing

| Data | Rule |
|---|---|
| Memory | Save only what the skill lists as storable, once the user has stated or confirmed the value. Non-sensitive values need no separate "may I save this" question unless the skill says to ask. Tell the user in one line what was saved and where. |
| Profile | Never write to a pack from inside a project. A pack is shared and pinned; change it in the pack's own repository. If the user wants a project-only exception, save it to memory. |
| Credentials | Ask before saving, every time. Before the first write, make sure the project's `.gitignore` excludes `.agents/credentials/`, and add the entry if it is missing. Never stage or commit this folder. |

Never store, in any of the three:

- A secret in memory or in a profile. Secrets go to credentials only.
- Data about one ticket, one client conversation or one task. It changes every time and is re-derived or asked fresh.
- Anything a skill says must be asked every time (for example a client name on a quotation).

### Entry format

One bullet per value, short and matchable by name. Update an entry in place; never append a second entry for the same key.

```markdown
- **<Key>** — <value> — <optional note or URL>
```

A skill may add its own entry kinds (a target page, a structure override) in the same shape.

## Legacy folders: migrate on encounter

Skills were renamed, so older projects have data under old folder names (each skill lists its own). Every time you resolve a memory or credentials path, check for the legacy folder:

- **Only the legacy folder exists** — move it to the current path (`git mv` when the file is tracked, otherwise a plain move), then use the current path from then on. Tell the user in one line that you migrated it.
- **Both exist** — the current path wins. Copy across any entries that only the legacy file has, then delete the legacy file.
- **Migration isn't possible** (read-only filesystem, the user declines, another tool still depends on the legacy path) — keep reading **and writing** the legacy path for now, and say so. Retry the next time the skill runs.
- **Never create a fresh file at the current path while an unmigrated legacy file exists** — that hides the saved values and makes you ask again.
- **Credentials** — the legacy folder is normally git-ignored, so move it with a plain move, never `git mv` or `git add`. Make sure `.gitignore` covers the current path first; if it only names the legacy folder, add the new entry.

## Profile packs

A pack is a folder with one sub-folder per skill, named exactly like the skill, each with a `PROFILE.md`. It is usually a private git repository mounted as a submodule, so one team's rules reach every project and stay out of public skills.

Make and mount one:

1. Create a repository (private when the brand should stay private) with `<skill-name>/PROFILE.md` for each skill it customizes. `PROFILE.md` states settings and fixed rules in plain language and links to any other file the skill should use (label sets, a look reference, templates, machine-readable settings, assets).
2. Mount it in each project: `git submodule add <url> .agents/contexts/profiles/<pack>`.
3. Keep it out of builds and images: add `.agents/` to `.dockerignore`, and do not fetch submodules in CI or on the deployment platform unless the build itself needs them. A pack is only read by the people and agents doing the work a skill describes; a deployment that tries to fetch a private pack without access fails.
4. A project pins one commit of the pack. To take a newer version: `git submodule update --remote .agents/contexts/profiles/<pack>`, then commit the pointer.

What a given skill reads from its profile (which settings, which files) is documented in that skill.

## For skill authors

A skill that stores or reads customized data:

- Uses only the paths above, with its own `name` as `<skill-name>`. No other folder under `.agents/`, and nothing inside the skill's own folder.
- Has a short section in its `SKILL.md` that names what it stores in memory, what it reads from a profile, whether it uses credentials, and its legacy folder names, and that says: "Follow the `context-management` skill for where and how."
- Keeps a three-line fallback in that section (the paths, "profile before memory", "migrate the legacy folder") so it still works when installed on its own.
- Never hard-codes a brand, client or team-specific value. It reads it from a profile or memory and has a neutral default.
- When renamed, moves its state path to the new name and adds the old folder name to its legacy list.

## Quick reference

| Situation | Action |
|---|---|
| A skill needs a remembered value | User's word → profile → `MEMORY.md` → default or ask |
| Starting a task in a skill that supports profiles | Look for `PROFILE.md` in `.agents/contexts/profiles/*/<skill-name>/`, then `~/.agents/contexts/profiles/` |
| Pack folder exists but is empty | `git submodule update --init <path>`; if it fails, stop and tell the user |
| User confirms a storable value | Save it to `MEMORY.md` as one bullet; say what was saved and where |
| User gives a login | Use it; ask before saving; check `.gitignore` covers `.agents/credentials/` first |
| A legacy folder is found | Migrate it to the current path, or keep using it if it cannot be moved |
| User wants to change a profile rule for one project | Save the exception to memory; leave the pack untouched |
| User wants to change a profile rule for every project | Change the pack's repository, then update each project's pointer |
| Tempted to store a per-ticket or per-client detail | Don't; it is asked or derived fresh each time |

## Common mistakes

- Writing memory or credentials inside the skill's folder, or under a folder name other than the skill's own.
- Treating an unfetched pack as "no profile" and producing unbranded or default output without saying so.
- Editing a file inside a mounted pack from an app repository.
- Saving a secret to `MEMORY.md`, or committing `.agents/credentials/`.
- Creating a fresh `MEMORY.md` while an unmigrated legacy file still holds the saved values.
- Appending a second entry for a key that is already saved.
- Putting a brand or client-specific default into a public skill instead of a profile.
