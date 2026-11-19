# agency

Rules for every coding agent working in this repository: a public collection of agent skills, published as one Claude Code plugin named `agency`.

## Instruction files

- Content lives in `AGENTS.md` only. `CLAUDE.md` and `GEMINI.md` are symlinks to it (`ln -s AGENTS.md CLAUDE.md`, `ln -s AGENTS.md GEMINI.md`), committed with mode `120000`. Never put content in them.
- "Write to agents.md" names the convention, not a path. Put each rule in the `AGENTS.md` of the deepest folder it applies to, creating the file and its two symlinks if needed. This root file gets only repo-wide rules. Tell the user which file you chose.
- A skill's own instructions belong in its `SKILL.md`, not in an `AGENTS.md`.

## Before any coding task

Before any coding task (feature, bug fix, refactor, tests, migration, review), invoke the `token-saver` skill if it is available. If it isn't available, carry on without it.

## Jira

- Site: `bondansebastian.atlassian.net`. Project: Agency Skills, key `AS`.
- The board has "To Do", "In Progress" and "Done" (no "Deployed"), so this row applies:

  | Work starts | PR opened | Build on default branch succeeds |
  |---|---|---|
  | In Progress | no move | Done |

- The card goes straight to the target status, with no approval and no in-between status, unless a `Card moves` entry in `.agents/contexts/agency/atlassian-jira/MEMORY.md` says otherwise.
- "The build": this repository has no `Deploy` workflow yet. Until it has one, the build is `claude plugin validate .` passing on the merge commit on `main`; run it after the merge. Once a `Deploy` workflow exists, its run on the merge commit is the build.
- Put the ticket key in commit messages and the PR title.

## Commands

| Purpose | Command |
|---|---|
| Check | `claude plugin validate .` |
| Load test | Install the plugin from this folder into a throwaway config and list the skills (below) |
| Tests | None. There is no test suite. |
| Build | None. Skills are Markdown and scripts, published as they are. |

Load test:

```bash
export CLAUDE_CONFIG_DIR="$(mktemp -d)"
claude plugin marketplace add "$PWD"
claude plugin install agency@bondansebastian-skills
find "$CLAUDE_CONFIG_DIR/plugins/cache" -maxdepth 5 -name SKILL.md
```

Every skill listed in `.claude-plugin/marketplace.json` must appear in that output.

## Verification

- "Browser-verify" means: run `test:e2e` and see it pass. This repository has no web UI and no `test:e2e` script, so a browser check is not possible here. Say so in the report, and say what you verified instead.
- Verify every change with the check and the load test above before reporting it as done or opening a PR.
- A change to a script inside a skill (for example `docs-user-documentation/scripts/`) is also run once for real, and its output looked at, before it is reported as done.
- Never imply a check you didn't run.

## Pull requests and merging

- Never open a PR without the user's explicit confirmation. Ask, naming the branch and the proposed title, and wait for a yes. A skill, ticket or rule that says to open one is not confirmation, and one yes covers one PR.
- Push everything the PR needs first, including README and `AGENTS.md` changes.
- As soon as the PR is open, turn on squash auto-merge. If GitHub refuses because the PR is already mergeable, squash-merge it directly. If auto-merge is disabled on the repository, tell the user and leave the PR open.
- This repository has no required status check yet, so a PR can merge the moment auto-merge is turned on. Run the check and the load test before opening it.
- After the merge, run the build (see Jira) on the merge commit, then move the card.

## GitHub workflows

There are none yet. If you add any, create exactly two in `.github/workflows/`: `tests.yml` (`Tests`, on `pull_request` only, lint and tests only, never a Docker build) and `deploy.yml` (`Deploy`, on `push` to `main` only, build → publish → deploy). No other workflow files. Follow the `dev-init-project` skill, section 7, including `.github/AGENTS.md` and the `tests` gate job.

## New-skill checklist

1. Create `<skill-name>/SKILL.md` with `name`, `description` and `version` in its frontmatter. The folder name equals `name`.
2. Name it domain-first (see Skill naming).
3. Add the `## Extension counterpart` section as its first section (see Extension counterpart). If it stores or reads customized data, also add the storage section that refers to `context-management` (see Context management).
4. Add its path to the `agency` plugin's `skills` list in `.claude-plugin/marketplace.json`, update the plugin `description`, and increment the plugin `version`.
5. Add its row to the README's Skill Catalog and its folder to the Repository Layout tree.
6. Check that it collides with no other skill's triggers or rules. Where two skills overlap, say in both which one wins.
7. Once `.github/workflows/tests.yml` exists: add the module's integration matrix entry in .github/workflows/tests.yml.
8. Run the check and the load test.

## Skill rules

- **Skill versioning**: When you make any change to a skill's content (for example edits to `SKILL.md`, bundled assets, or instruction text), always increment the skill `version` value. This includes patch-level updates for minor fixes. Incrementing the version ensures tools and agents pick up the updated skill.

- **Where to update**: Edit the `version` field at the top of the skill's `SKILL.md` or in the skill manifest you maintain for this repository.

- **Example**: `version: 1.0.0` -> `version: 1.0.1` for any content change.

- **Validation**: After updating, verify the skill loads and that the new version is visible to consuming agents.

- **README sync**: When you add, remove, or modify any skill (including changes to its `SKILL.md`, description, or `version`), update `README.md`'s Skill Catalog table and any path or description references so the repository README reflects the change. Keep the table rows consistent (icon, skill name, short description, and path). This ensures users and agents can discover skills and see the correct version and location.

- **Marketplace sync**: `.claude-plugin/marketplace.json` publishes all skills as one Claude Code plugin named `agency` (invoked as `/agency:<skill>`). When you add, remove, or rename a skill, update that plugin's `skills` path list and `description`. When you change any skill's content, also increment the `agency` plugin `version` so installed copies pick up the update. Then run `claude plugin validate .` and fix any errors.

- **Skill naming**: Skill folders and `name` values are domain-first (`atlassian-*`, `dev-*`, `docs-*`, `sales-*`) so related skills sort together under `/agency:`. Do not add an `agency-` prefix to skill names; the plugin supplies it. When you rename a skill that stores state, move its state path to the new name and add the old folder name to the skill's legacy list (see **Context management**).

- **Context management**: `context-management/SKILL.md` is the single source of truth for customized or parameterized data: memory at `.agents/contexts/agency/<skill-name>/MEMORY.md`, credentials at `.agents/credentials/agency/<skill-name>/`, and extensions as counterpart skills in a plugin named `agency-<ext_name>`. Every skill that stores or reads such data must refer to it in a short storage section that names only the skill's own keys, paths and legacy folders, plus a three-line fallback for standalone installs. Never restate the general rules (precedence, entry format, migration, extension setup) in another skill; change them in `context-management` and bump its version.

- **Extension counterpart**: Every skill's `SKILL.md` has an `## Extension counterpart` section as its first section, with the standard text and the skill's own name in it. It tells the agent to load the same-named skill from an `agency-<ext_name>` plugin and let it win. Copy it from an existing skill when adding a new one, and never remove it.

- **Brand-neutral skills**: This repository is public. Never put a brand, client, or team-specific rule, name, asset, or default in a skill. Put it in an extension (a private `agency-<ext_name>` plugin) and have the skill take it from its counterpart, falling back to neutral defaults when none is installed.
