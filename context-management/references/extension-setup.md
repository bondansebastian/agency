# Setting up an extension

Do these steps for the user; don't hand them a list of commands unless they ask for one. Ask only for what you cannot find out yourself.

An extension is a plugin named `agency-<ext_name>`. For every agency skill it customizes it has a skill of the same name (the counterpart), whose folder holds an `EXTENSION.md` and any files that links to.

## Naming

- Ask the user for `<ext_name>` and offer the default, `extension`. Lowercase letters, digits and hyphens.
- The plugin, and normally its repository, is called `agency-<ext_name>` (`agency-extension`, `agency-acme`).
- The plugin name must start with `agency-`; that prefix is how the agency skills find it.
- Each counterpart's `name` is exactly the name of the agency skill it extends.

## Create a new extension

1. **Ask three things:** `<ext_name>` (default `extension`), whether the repository is private (the default; choose private whenever the brand or rules should not be public), and which agency skills it should customize.
2. **For each skill, find out what it accepts.** Read that skill's storage section and, where it has one, its `references/extension.md`. Only settings the skill documents have any effect.
3. **Interview the user** for those settings, one skill at a time. Don't invent a value; leave a setting out when the user has no preference, so the skill's default applies.
4. **Write the files** in a new folder outside any project:

   ```text
   agency-<ext_name>/
   ├── .claude-plugin/
   │   └── marketplace.json         # start from templates/marketplace.json
   ├── README.md                    # what it is, how to install it
   ├── AGENTS.md                    # rules for agents editing the extension
   ├── CLAUDE.md -> AGENTS.md       # symlinks, never content
   ├── GEMINI.md -> AGENTS.md
   └── <skill-name>/                # one folder per agency skill it customizes
       ├── SKILL.md                 # the counterpart; start from templates/SKILL.md
       ├── EXTENSION.md             # settings and fixed rules; start from templates/EXTENSION.md
       └── ...                      # files EXTENSION.md links to
   ```

   - In `marketplace.json`, the plugin `name` is `agency-<ext_name>` and `skills` lists every counterpart folder.
   - In each counterpart's `SKILL.md`, `name` equals the agency skill's name, and the `description` says it extends that skill and is loaded together with it.
   - `AGENTS.md` says at least: only this team's knowledge belongs here, a rule that would help any team belongs in the public skill; one folder per skill, named exactly like the skill; no secrets, credentials or client data; never move a file that `EXTENSION.md` points to without updating the pointer; increment the plugin `version` on every change.
5. **Never put a secret in an extension.** A login or token the user offers goes to credentials in the project, not here.
6. **Check it:** run `claude plugin validate .` in the folder and fix any errors.
7. **Publish it.** `git init -b main`, commit, and push to an empty repository. If you cannot create the repository yourself, ask the user to create an empty one and give you its URL; don't stop the rest of the work for it.
8. **Install it** (below), then **try it once:** run the customized skill on a small real task, check that it loaded its counterpart and that the extension's settings were applied. Report what you saw.

## Install

The user installs an extension once; it then applies in every project.

| Where the user works | How |
|---|---|
| Claude Code in a terminal, the desktop app or an IDE | `/plugin marketplace add <owner>/agency-<ext_name>`, then `/plugin install agency-<ext_name>@<marketplace-name>`. A private repository is cloned with the git credentials already on the machine (for GitHub over HTTPS: `gh auth login`, then `gh auth setup-git`). |
| Claude Code on the web, and everyone in an organization | An organization owner adds the repository under Organization settings → Plugins & skills on claude.ai. It is read through the organization's GitHub connection and synced to every session. |

You cannot do either for the user from inside a session that lacks those rights. Tell them which one applies and what to click or run, then carry on once they confirm. Installed plugins take effect in a new session.

## Update

Change the files in the extension's repository, increment the plugin `version` in `marketplace.json` (and the `version` of each counterpart you changed), commit and push. Installed copies pick the new version up on their next marketplace update or organization sync.

## Remove

Ask first: removing it changes the output of every skill it customized. Uninstall the plugin (`/plugin uninstall agency-<ext_name>@<marketplace-name>`, or remove it in the organization settings). To switch an extension off for one project only, save `- **Extension** — none` in that skill's `MEMORY.md` in the project.

## Troubleshoot

| Symptom | Cause and fix |
|---|---|
| A skill ignores the extension | Check, in order: the plugin is installed and enabled in this session (its skills appear as `agency-<ext_name>:<skill-name>`); the plugin name starts with `agency-`; the counterpart's `name` is exactly the agency skill's name; the folder is listed under `skills` in `marketplace.json`; the skill documents the setting being used; the project's memory does not say `- **Extension** — none`. |
| The extension was just installed or changed, and nothing happened | Plugins load when a session starts. Start a new session; for a change, make sure the plugin `version` was incremented. |
| Two extensions customize the same skill | Both apply, in alphabetical order of `<ext_name>`, and the last one wins. To change the order, save `- **Extension order** — <ext_name>, <ext_name>` in that skill's `MEMORY.md`. |
| The counterpart loaded but its files are missing | The plugin did not ship them. Check that the files `EXTENSION.md` links to are inside the counterpart's folder and committed. |
| A project still has a folder under `.agents/contexts/agency/` whose name starts with `@`, or a `PROFILE.md` | That is an extension mounted the old way, which is no longer read. Remove the mount (`git submodule deinit -f <path>`, then `git rm -f <path>`) and install the extension as a plugin instead. |
