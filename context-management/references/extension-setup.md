# Setting up an extension

Do these steps for the user; don't hand them a list of commands unless they ask for one. Ask only for what you cannot find out yourself. Run every git command from the project root.

An extension is mounted at `.agents/contexts/agency/@<name>/`. Quote the path in shell commands.

## Naming

- `<name>` is lowercase letters, digits and hyphens. The folder is `@<name>`.
- From a repository called `agency-skills-<name>`, use `<name>` (`agency-skills-acme` → `@acme`). For any other repository name, propose one and confirm it with the user.
- Never name an extension after a skill.

## Mount an existing extension

1. **Find out what to mount.** You need the extension's repository URL. If the user named it only loosely, ask. Derive `<name>` (see Naming).
2. **Check it is not already there.** Look at `.gitmodules` and `.agents/contexts/agency/`. If it is mounted but empty, go to Troubleshoot. If an extension with the same name exists, stop and ask.
3. **Choose the URL form.** When the extension is under the same owner and host as the project's own `origin`, use a relative URL so it works for HTTPS and SSH clones alike (`../agency-skills-<name>.git`). Otherwise use the full HTTPS URL.
4. **Add it:**

   ```bash
   git submodule add -b <default-branch> <url> ".agents/contexts/agency/@<name>"
   ```

   If this fails for lack of access, stop and tell the user which repository this session cannot reach. Do not work around it.
5. **Check the content.** List the `<skill-name>/EXTENSION.md` files it holds. Tell the user which skills it customizes. Warn about a folder that matches no agency skill name (it will never be read) and about a skill folder with no `EXTENSION.md`.
6. **Keep it out of builds and images.** An extension is read only by the people and agents doing the work a skill describes. No build and no running app needs it, and a deployment that tries to fetch a private extension without access fails.
   - Add `.agents/` to `.dockerignore` if the project has a `Dockerfile` and the entry is missing.
   - In CI, checkouts must not fetch submodules. Search the workflows for `submodules:`; `actions/checkout` does not fetch them unless it is set. If a workflow sets it, tell the user and propose the change; do not edit a deploy workflow without their word.
   - Ask how the app is deployed. If the deployment platform builds from the git repository, submodule fetching must be turned off for the app there (in Coolify: the application's Advanced settings, **Submodules**) before the commit that adds the extension is deployed. If the platform only pulls a ready image, nothing is needed. Never change a deployment setting yourself without asking.
7. **Commit** `.gitmodules` and the mount path with a message that names the extension. Do not push unless the user asked.
8. **Report:** the mount path, the pinned commit, the skills it customizes, and what you changed for builds and deployments (or what the user still has to change).

## Create a new extension

1. **Ask three things:** the name, whether the repository is private (the default; choose private whenever the brand or rules should not be public), and which skills it should customize.
2. **For each skill, find out what it accepts.** Read that skill's storage section and, where it has one, its `references/extension.md`. Only settings the skill documents have any effect.
3. **Interview the user** for those settings, one skill at a time. Don't invent a value; leave a setting out when the user has no preference, so the skill's default applies.
4. **Write the files** in a new folder outside any project:

   ```text
   agency-skills-<name>/
   ├── README.md                    # what it is, how to mount it, deployment notes
   ├── AGENTS.md                    # rules for agents editing the extension
   ├── CLAUDE.md -> AGENTS.md       # symlinks, never content
   ├── GEMINI.md -> AGENTS.md
   └── <skill-name>/
       ├── EXTENSION.md             # start from templates/EXTENSION.md
       └── ...                      # files EXTENSION.md links to
   ```

   `AGENTS.md` says at least: only this team's knowledge belongs here, a rule that would help any team belongs in the public skill; one folder per skill, named exactly like the skill; no secrets, credentials or client data, because everyone with access to a project that mounts it can read it; never move a file that `EXTENSION.md` points to without updating the pointer.
5. **Never put a secret in an extension.** A login or token the user offers goes to credentials in the project, not here.
6. **Publish it.** `git init -b main`, commit, and push to an empty repository. If you cannot create the repository yourself, ask the user to create an empty one and give you its URL; don't stop the rest of the work for it.
7. **Mount it** in the project the user is working in (Mount an existing extension).
8. **Try it once:** run the customized skill on a small real task and check that the extension's settings were applied. Report what you saw.

## Update

```bash
git submodule update --remote ".agents/contexts/agency/@<name>"
```

Show what changed (`git diff --submodule=log`), then commit the new pointer. A project stays on its pinned commit until this is done, so after changing an extension, each project that mounts it needs this step.

## Install for every project on this machine

Clone it to the user-level path instead of mounting it:

```bash
git clone <url> "$HOME/.agents/contexts/agency/@<name>"
```

A project's own extension is read before a user-level one.

## Remove

Ask first: removing it changes the output of every skill it customized.

```bash
git submodule deinit -f ".agents/contexts/agency/@<name>"
```

```bash
git rm -f ".agents/contexts/agency/@<name>"
```

Commit the change. If a skill's `MEMORY.md` has `- **Extension** — @<name>`, remove that entry.

## Troubleshoot

| Symptom | Cause and fix |
|---|---|
| The `@<name>` folder is empty | The submodule was not fetched: `git submodule update --init ".agents/contexts/agency/@<name>"`. |
| That command fails | This session cannot reach the extension's repository (private, no network). Tell the user which repository; continue without it only on their word, and say the extension was not applied. |
| The extension is fetched but a skill ignores it | Check, in order: the folder starts with `@` and sits directly under `.agents/contexts/agency/`; the sub-folder is named exactly like the skill; the file is called `EXTENSION.md`; the skill documents the setting being used. |
| Two extensions customize the same skill | Ask which to use and save `- **Extension** — @<name>` in that skill's `MEMORY.md`. |
| A deployment fails after the extension was added | The platform or CI tried to fetch the private submodule. Turn submodule fetching off there (Mount an existing extension, step 6). |
| An extension is mounted at an old location (`.agents/contexts/<name>/`, without `agency/@`) or uses `PROFILE.md` | Move the mount with `git mv ".agents/contexts/<name>" ".agents/contexts/agency/@<name>"`, and rename `PROFILE.md` to `EXTENSION.md` in the extension's own repository. |
