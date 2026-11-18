---
name: context-management
description: "Use whenever an agency skill needs to read, save, or look up customized or parameterized data for a project — remembered preferences and variables (MEMORY.md), a team's or brand's extension (EXTENSION.md), or saved credentials — and whenever you create, move, migrate, or audit anything under a project's .agents/ folder. Also use when the user asks to set up, add, mount, create, update, remove, or troubleshoot an extension for the agency skills (for example \"add our extension to this project\", \"create an extension for my team\", \"why isn't the extension applied\"). Defines where each kind of data lives, the lookup order and precedence, the entry format, legacy-folder migration, and what must never be stored. Also use when writing or changing a skill that stores data."
version: 2.0.0
---

# Context Management

One layout for everything an agency skill customizes per project, team or person. Skills hold the method; the data that changes from project to project lives outside the skill, in the project's `.agents/` folder. Every agency skill that stores or reads such data follows this skill, and names only its own keys.

## The three kinds of data

| Kind | What it is | Who writes it | Path |
|---|---|---|---|
| **Memory** | Non-sensitive values remembered for this project so the user is not asked twice: a pricing variable, a default language, a Notion target | The skill, at the user's word | `<project-root>/.agents/contexts/agency/<skill-name>/MEMORY.md` |
| **Extension** | A team's or brand's house rules and assets that extend the agency skills: credit, look, fixed language, labels, publishing target. The same across many projects | The team, in the extension's own repository. Skills only read it | `<project-root>/.agents/contexts/agency/@<name>/<skill-name>/EXTENSION.md` |
| **Credentials** | Secrets: logins, tokens | The skill, only after the user says yes | `<project-root>/.agents/credentials/agency/<skill-name>/CREDENTIALS.md` |

```text
<project-root>/.agents/
├── contexts/
│   └── agency/                          # everything the agency skills own in this project
│       ├── @<name>/                     # an extension, read-only, usually a git submodule
│       │   └── <skill-name>/EXTENSION.md
│       └── <skill-name>/MEMORY.md       # this project's memory, written by skills, committed
└── credentials/                         # secrets, never committed
    └── agency/<skill-name>/CREDENTIALS.md
```

- `<skill-name>` is the skill's `name` exactly (`sales-quotation`, not `agency:sales-quotation`).
- Inside `.agents/contexts/agency/`, a folder whose name starts with `@` is an extension. Every other folder is one skill's memory. The `@` keeps an extension from ever colliding with a skill name.
- `<project-root>` is the root of the project being worked in, normally the git top level. Never the skill's own folder, so it does not matter where the skill is installed. Re-derive it whenever the active project changes within a session, and never reuse another project's files.
- Create a memory or credentials folder and file when first needed; don't wait for one to exist.
- An extension can also sit at `~/.agents/contexts/agency/@<name>/` to apply to every project on the machine.
- Folders directly under `.agents/contexts/` other than `agency` belong to other tools, or are legacy folders (see below). Leave other tools' folders alone.

## Reading: order and precedence

When a skill needs a value:

1. **The user's instruction in this conversation.** Use it.
2. **Extension.** Look for `<skill-name>/EXTENSION.md` in the project's extensions, then in the user-level ones. Read it before drafting or computing anything, and follow the files it links to. Its fixed rules ("always", "never", "fixed") win over memory and over the skill's defaults.
3. **Memory.** Check `MEMORY.md` for the value.
4. **The skill's default**, or ask the user when the skill says the value must be asked.

Further rules:

- If two extensions in the same place both have an `EXTENSION.md` for the skill, ask which to use and save the answer in the skill's `MEMORY.md` as `- **Extension** — @<name>`.
- No extension is the normal case for most projects. Work with the skill's defaults and do not ask the user to create one.
- An extension never loosens a skill's safety rules (for example: no internal identifiers in user documents, sample data only, no secrets in files).
- Check credentials only when a login is actually needed, never at the start of a task.

### A declared extension that is empty

If `.gitmodules` lists a path under `.agents/contexts/agency/@`, or an `@<name>` folder exists but has no files, the project has an extension that was not fetched. Do not treat it as "no extension":

1. Run `git submodule update --init <path>`.
2. If that fails (no access to a private repository, no network), stop and tell the user which extension is missing and why. Continue without it only if the user says so, and say in the report that the extension was not applied.

## Writing

| Data | Rule |
|---|---|
| Memory | Save only what the skill lists as storable, once the user has stated or confirmed the value. Non-sensitive values need no separate "may I save this" question unless the skill says to ask. Tell the user in one line what was saved and where. |
| Extension | Never write to an extension from inside a project. It is shared and pinned; change it in the extension's own repository. If the user wants a project-only exception, save it to memory. |
| Credentials | Ask before saving, every time. Before the first write, make sure the project's `.gitignore` excludes `.agents/credentials/`, and add the entry if it is missing. Never stage or commit this folder. |

Never store, in any of the three:

- A secret in memory or in an extension. Secrets go to credentials only.
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

## Extensions

An extension is a folder with one sub-folder per skill, named exactly like the skill, each with an `EXTENSION.md`. It is usually a private git repository mounted as a submodule at `.agents/contexts/agency/@<name>/`, so one team's rules reach every project and stay out of the public skills. What a given skill reads from its `EXTENSION.md` (which settings, which files) is documented in that skill.

**When the user asks to set up, add, create, update, remove or troubleshoot an extension, do it for them by following `references/extension-setup.md`.** It covers:

| The user wants to | Section |
|---|---|
| Add an existing extension to this project | Mount an existing extension |
| Make a new extension for their team or brand | Create a new extension |
| Take the newest version of a mounted extension | Update |
| Use an extension in every project on this machine | Install for every project |
| Take an extension out of a project | Remove |
| Find out why an extension is not being applied | Troubleshoot |

Ask only for what you cannot find out yourself (the repository URL, the name, which skills to customize), run the steps, and report what was mounted and which skills it now customizes. Start a new `EXTENSION.md` from `templates/EXTENSION.md`.

## For skill authors

A skill that stores or reads customized data:

- Uses only the paths above, with its own `name` as `<skill-name>`. No other folder under `.agents/`, and nothing inside the skill's own folder.
- Has a short section in its `SKILL.md` that names what it stores in memory, what it reads from an extension, whether it uses credentials, and its legacy folder names, and that says: "Follow the `context-management` skill for where and how."
- Keeps a three-line fallback in that section (the paths, "extension before memory", "migrate the legacy folder") so it still works when installed on its own.
- Never hard-codes a brand, client or team-specific value. It reads it from an extension or memory and has a neutral default.
- When renamed, moves its state path to the new name and adds the old folder name to its legacy list.

## Quick reference

| Situation | Action |
|---|---|
| A skill needs a remembered value | User's word → extension → `MEMORY.md` → default or ask |
| Starting a task in a skill that reads an extension | Look for `<skill-name>/EXTENSION.md` in every `@<name>` folder under `.agents/contexts/agency/`, then under `~/.agents/contexts/agency/` |
| An `@<name>` folder exists but is empty | `git submodule update --init <path>`; if it fails, stop and tell the user |
| User asks to add, create, update or remove an extension | Follow `references/extension-setup.md` and do it for them |
| User confirms a storable value | Save it to `MEMORY.md` as one bullet; say what was saved and where |
| User gives a login | Use it; ask before saving; check `.gitignore` covers `.agents/credentials/` first |
| A legacy folder is found | Migrate it to the current path, or keep using it if it cannot be moved |
| User wants to change an extension's rule for one project | Save the exception to memory; leave the extension untouched |
| User wants to change an extension's rule for every project | Change the extension's repository, then update each project's pointer |
| Tempted to store a per-ticket or per-client detail | Don't; it is asked or derived fresh each time |

## Common mistakes

- Writing memory or credentials inside the skill's folder, or under a folder name other than the skill's own.
- Mounting an extension without the `@`, or beside `agency/` instead of inside it.
- Treating an unfetched extension as "no extension" and producing unbranded or default output without saying so.
- Editing a file inside a mounted extension from an app repository.
- Explaining how to set up an extension when the user asked for it to be set up.
- Saving a secret to `MEMORY.md`, or committing `.agents/credentials/`.
- Creating a fresh `MEMORY.md` while an unmigrated legacy file still holds the saved values.
- Appending a second entry for a key that is already saved.
- Putting a brand or client-specific default into a public skill instead of an extension.
