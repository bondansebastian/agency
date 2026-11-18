---
name: context-management
description: "Use whenever an agency skill needs to read, save, or look up customized or parameterized data — remembered preferences and variables for a project (MEMORY.md), a team's or brand's extension (a counterpart skill in a plugin named agency-<ext_name>), or saved credentials — and whenever you create, move, migrate, or audit anything under a project's .agents/ folder. Also use when the user asks to set up, create, install, update, remove, or troubleshoot an extension for the agency skills (for example \"create an extension for my team\", \"why isn't the extension applied\"). Defines where each kind of data lives, how a skill finds its extension counterpart, the precedence between them, the entry format, legacy-folder migration, and what must never be stored. Also use when writing or changing a skill that stores data."
version: 3.0.1
---

# Context Management

## Extension counterpart

Before doing anything else, check the available skills for one named `context-management` in a plugin called `agency-<ext_name>` (for example `agency-extension:context-management`). If one exists, load it now and follow it together with this skill; where the two differ, the counterpart wins. With several, apply them in the order given under Extensions below; the last one wins. If none exists, carry on with this skill's defaults.

## Overview

One layout for everything an agency skill customizes per project, team or person. Skills hold the method; the data that changes lives outside the public skills. Every agency skill that stores or reads such data follows this skill, and names only its own keys.

## The three kinds of data

| Kind | What it is | Who writes it | Where |
|---|---|---|---|
| **Memory** | Non-sensitive values remembered for this project so the user is not asked twice: a pricing variable, a default language, a Notion target | The skill, at the user's word | `<project-root>/.agents/contexts/agency/<skill-name>/MEMORY.md` |
| **Extension** | A team's or brand's house rules and assets that extend the agency skills: credit, look, fixed language, labels, publishing target. The same across every project | The team, in its own plugin. Skills only read it | The counterpart skill `agency-<ext_name>:<skill-name>` and the files in its folder |
| **Credentials** | Secrets: logins, tokens | The skill, only after the user says yes | `<project-root>/.agents/credentials/agency/<skill-name>/CREDENTIALS.md` |

```text
<project-root>/.agents/
├── contexts/
│   └── agency/<skill-name>/MEMORY.md          # this project's memory, written by skills, committed
└── credentials/
    └── agency/<skill-name>/CREDENTIALS.md     # secrets, never committed
```

- `<skill-name>` is the skill's `name` exactly (`sales-quotation`, not `agency:sales-quotation`).
- `<project-root>` is the root of the project being worked in, normally the git top level. Never the skill's own folder, so it does not matter where the skill is installed. Re-derive it whenever the active project changes within a session, and never reuse another project's files.
- Create a memory or credentials folder and file when first needed; don't wait for one to exist.
- An extension is not stored in the project. It is installed with the user's plugins and applies to every project.
- Folders directly under `.agents/contexts/` other than `agency` belong to other tools, or are legacy folders (see below). Leave other tools' folders alone.

## Extensions

An extension is a plugin named `agency-<ext_name>`. `<ext_name>` can be anything; it defaults to `extension`, so the default plugin is `agency-extension`. For each agency skill it customizes, the plugin has a skill with **the same name**: its counterpart.

```text
agency:docs-user-documentation                        the public skill
agency-extension:docs-user-documentation       its counterpart, in the extension plugin
```

**How a skill finds its counterpart.** Every agency skill does this first, before any other step:

1. Look through the available skills for one with the skill's own name in a plugin whose name starts with `agency-`. Detection is by name; never search the filesystem for it, and never ask the user which extension exists.
2. If there is one, load it (invoke it as a skill). Loading it shows its folder; that folder is the extension for this skill. Read the `EXTENSION.md` there and follow the files it links to.
3. Follow both together. Where they differ, the counterpart wins.
4. If there are several (more than one `agency-*` plugin has a counterpart), load them all and apply them in alphabetical order of `<ext_name>`, unless the skill's `MEMORY.md` has `- **Extension order** — <ext_name>, <ext_name>`. **The last one wins** wherever two of them set the same thing.
5. If there is none, work with the skill's defaults. This is the normal case; do not ask the user to create an extension.

A counterpart is never used on its own. If it was loaded first, load the public skill of the same name too.

**When the user asks to create, install, update, remove or troubleshoot an extension, do it for them by following `references/extension-setup.md`.** Ask only for what you cannot find out yourself, starting with `<ext_name>` (offer the default, `extension`).

## Precedence

When a skill needs a value, the later of these wins:

1. The skill's own default.
2. `MEMORY.md` in the project.
3. The extension: its counterpart, and with several, the last one. A rule there marked "always", "never" or "fixed" wins over memory; a plain setting is the team's default and gives way to a value the project has saved in memory.
4. The user's instruction in this conversation.

An extension never loosens a skill's safety rules (for example: no internal identifiers in user documents, sample data only, no secrets in files). Check credentials only when a login is actually needed, never at the start of a task.

A project that must not use an installed extension says so in the skill's memory: `- **Extension** — none`.

## Writing

| Data | Rule |
|---|---|
| Memory | Save only what the skill lists as storable, once the user has stated or confirmed the value. Non-sensitive values need no separate "may I save this" question unless the skill says to ask. Tell the user in one line what was saved and where. |
| Extension | Never write to an installed extension from inside a project. Change it in the extension's own repository and release a new version. If the user wants a project-only exception, save it to memory. |
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

## For skill authors

Every agency skill, whether or not it stores data:

- Has an **Extension counterpart** section as its first section, with the standard text and its own name in it.
- Never hard-codes a brand, client or team-specific value. It takes it from its counterpart or from memory and has a neutral default.

A skill that stores or reads customized data also:

- Uses only the paths above, with its own `name` as `<skill-name>`. No other folder under `.agents/`, and nothing inside the skill's own folder.
- Has a short section in its `SKILL.md` that names what it stores in memory, what it reads from its extension counterpart, whether it uses credentials, and its legacy folder names, and that says: "Follow the `context-management` skill for where and how."
- Keeps a three-line fallback in that section (the paths, the counterpart rule, "migrate the legacy folder") so it still works when installed on its own.
- When renamed, moves its state path to the new name and adds the old folder name to its legacy list.

## Quick reference

| Situation | Action |
|---|---|
| Starting any agency skill | Look for the same-named skill in an `agency-*` plugin; load it; it wins where the two differ |
| Several counterparts for one skill | Apply in alphabetical order of `<ext_name>`, or the order saved in memory; the last one wins |
| A counterpart was loaded without the public skill | Load the public skill of the same name too |
| A skill needs a remembered value | User's word → extension's fixed rules → `MEMORY.md` → extension's defaults → skill's default or ask |
| User asks to create, install, update or remove an extension | Follow `references/extension-setup.md` and do it for them |
| User confirms a storable value | Save it to `MEMORY.md` as one bullet; say what was saved and where |
| User gives a login | Use it; ask before saving; check `.gitignore` covers `.agents/credentials/` first |
| A legacy folder is found | Migrate it to the current path, or keep using it if it cannot be moved |
| User wants to change an extension's rule for one project | Save the exception to memory; leave the extension untouched |
| User wants to change an extension's rule for every project | Change the extension's repository and release a new version |
| Tempted to store a per-ticket or per-client detail | Don't; it is asked or derived fresh each time |

## Common mistakes

- Starting a skill's work without checking for its counterpart.
- Following a counterpart alone, without the public skill it extends.
- Searching folders for an extension, or asking the user whether one exists, instead of reading the available skills.
- Writing memory or credentials inside the skill's folder, or under a folder name other than the skill's own.
- Editing an installed extension from inside a project.
- Explaining how to set up an extension when the user asked for it to be set up.
- Saving a secret to `MEMORY.md`, or committing `.agents/credentials/`.
- Creating a fresh `MEMORY.md` while an unmigrated legacy file still holds the saved values.
- Appending a second entry for a key that is already saved.
- Putting a brand or client-specific default into a public skill instead of an extension.
