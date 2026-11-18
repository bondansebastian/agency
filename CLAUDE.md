(---
description: "Workspace Copilot instructions for the agent-skills repository."
---)

# Copilot Instructions

- **Skill versioning**: When you make any change to a skill's content (for example edits to `SKILL.md`, bundled assets, or instruction text), always increment the skill `version` value. This includes patch-level updates for minor fixes. Incrementing the version ensures tools and agents pick up the updated skill.

- **Where to update**: Edit the `version` field at the top of the skill's `SKILL.md` or in the skill manifest you maintain for this repository.

- **Example**: `version: 1.0.0` -> `version: 1.0.1` for any content change.

- **Validation**: After updating, verify the skill loads and that the new version is visible to consuming agents.

- **README sync**: When you add, remove, or modify any skill (including changes to its `SKILL.md`, description, or `version`), update `README.md`'s Skill Catalog table and any path or description references so the repository README reflects the change. Keep the table rows consistent (icon, skill name, short description, and path). This ensures users and agents can discover skills and see the correct version and location.

- **Marketplace sync**: `.claude-plugin/marketplace.json` publishes all skills as one Claude Code plugin named `agency` (invoked as `/agency:<skill>`). When you add, remove, or rename a skill, update that plugin's `skills` path list and `description`. When you change any skill's content, also increment the `agency` plugin `version` so installed copies pick up the update. Then run `claude plugin validate .` and fix any errors.

- **Skill naming**: Skill folders and `name` values are domain-first (`atlassian-*`, `dev-*`, `docs-*`, `sales-*`) so related skills sort together under `/agency:`. Do not add an `agency-` prefix to skill names; the plugin supplies it. When you rename a skill that stores state, move its state path to the new name and add the old folder name to the skill's legacy list (see **Context management**).

- **Context management**: `context-management/SKILL.md` is the single source of truth for customized or parameterized data: memory at `.agents/contexts/agency/<skill-name>/MEMORY.md`, profiles at `.agents/contexts/profiles/<pack>/<skill-name>/PROFILE.md`, credentials at `.agents/credentials/agency/<skill-name>/`. Every skill that stores or reads such data must refer to it in a short storage section that names only the skill's own keys, paths and legacy folders, plus a three-line fallback for standalone installs. Never restate the general rules (lookup order, entry format, migration, pack mounting) in another skill; change them in `context-management` and bump its version.

- **Brand-neutral skills**: This repository is public. Never put a brand, client, or team-specific rule, name, asset, or default in a skill. Put it in a profile pack and have the skill read it, falling back to neutral defaults when no profile exists.
