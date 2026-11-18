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

- **Skill naming**: Skill folders and `name` values are domain-first (`atlassian-*`, `dev-*`, `docs-*`, `sales-*`) so related skills sort together under `/agency:`. Do not add an `agency-` prefix to skill names; the plugin supplies it. Per-project state lives at `.agents/contexts/agency/<skill-name>/` (and `.agents/credentials/agency/<skill-name>/`). When you rename a skill that stores state, move its state path to the new name and keep a **Legacy location** rule in its `SKILL.md`: migrate the legacy folder on encounter, and fall back to reading and writing the legacy path when migration isn't possible.

- **Brand-neutral skills**: This repository is public. Never put a brand, client, or team-specific rule, name, asset, or default in a skill. Put it in a profile pack (`.agents/profiles/<pack>/<skill-name>/PROFILE.md` in the consuming project) and have the skill read it, falling back to neutral defaults when no profile exists. See `docs-user-documentation/references/profile.md` for the pattern.
