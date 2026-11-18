# Agent Skills

![Skills](https://img.shields.io/badge/Skills-Collection-0ea5e9?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-22c55e?style=for-the-badge)
![Format](https://img.shields.io/badge/Format-SKILL.md-f59e0b?style=for-the-badge)

> An opinionated, curated collection of reusable agent skills that encode domain expertise, workflows, and high-quality execution patterns.

## What This Repository Is

This repository stores modular skill packages that help agents perform specialized tasks with better consistency, clarity, and outcomes.

Each skill lives in its own folder and contains a `SKILL.md` file with:
- Purpose and scope
- Trigger conditions (when to use it)
- Step-by-step workflow and best practices
- Templates, examples, and pitfalls

## Install with Claude Code (Plugin Marketplace)

This repository is a [Claude Code plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces) (`.claude-plugin/marketplace.json`). All skills ship in a single plugin named `agency`, so every skill is invoked as `/agency:<skill>` and typing `/agency` lists them all.

Add the marketplace once, then install the plugin:

````text
/plugin marketplace add bondansebastian/agent-skills
/plugin install agency@bondansebastian-skills
````

Or in one step (Claude Code 2.1.275 or later):

````text
/plugin install agency --marketplace bondansebastian/agent-skills
````

Update later with `/plugin marketplace update bondansebastian-skills`. Other agents can keep using the `npx skills add` commands in the catalog below.

**Upgrading from the per-skill plugins:** the individual plugins (`jira`, `devops`, `writing-quotations`, …) no longer exist. Uninstall them and install `agency` instead. Skills were renamed domain-first (see the catalog), `laravel8-guidelines` was removed, and `writing-user-guide` became `docs-user-documentation` (written guides and videos in one skill). Per-project state moved under an `agency/` folder with the new names (`.agents/contexts/jira/` → `.agents/contexts/agency/atlassian-jira/`, `writing-quotations/` → `agency/sales-quotation/`, `writing-user-guide/` → `agency/docs-user-documentation/`, and the matching `.agents/credentials/` folder). Each skill migrates a legacy folder to the new path the first time it encounters one, and keeps using the legacy path if it cannot be moved, so existing memory files keep working.

## Customized Data and Extensions

Skills in this repository stay brand-neutral and never store data in their own folder. The [`context-management`](context-management/SKILL.md) skill defines, once, where everything that differs per project or team lives, and every other skill follows it.

**Per project**, in the project's `.agents/` folder:

````text
<project-root>/.agents/
├── contexts/agency/<skill-name>/MEMORY.md      # remembered for this project, written by skills
└── credentials/agency/<skill-name>/            # secrets, never committed
````

**Per team or brand**, in an **extension**: a separate plugin named `agency-skills-<ext_name>` (default `agency-skills-extension`), usually private. For each skill it customizes, it has a skill with the same name, the counterpart:

````text
agency:docs-user-documentation                      the public skill
agency-skills-extension:docs-user-documentation     its counterpart
````

Every skill here checks for its counterpart first, loads it, and lets it win where the two differ (with several extensions, the last one wins). Install an extension once and it applies in every project; nothing is added to the project itself. Ask an agent to "create an extension for my team" and `context-management` builds one. `docs-user-documentation` documents what it reads from its extension in [docs-user-documentation/references/extension.md](docs-user-documentation/references/extension.md).

## Skill Catalog

| Skill | Command | Description | Path | Install |
|---|---|---|---|---|
| 📚 Confluence Knowledge Base | `/agency:atlassian-confluence` | Build and maintain a product-focused Confluence knowledge base that is accessible to design, engineering, sales, and support. | [atlassian-confluence/SKILL.md](atlassian-confluence/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill atlassian-confluence` |
| 🧭 Jira | `/agency:atlassian-jira` | Natural-language Jira assistant (v1.3.0) for viewing, creating, and updating issues, supporting CLI and MCP backends; always sets a time estimate on the native Original Estimate field (agent-generated AI Estimate + human review estimate, the latter being a fixed 1-hour review unit scaled by a project human review time remembered in `.agents/contexts/jira/MEMORY.md`, defaulting to `1`), never in the description. (Forked from https://github.com/davila7/claude-code-templates/cli-tool/components/skills/ai-research/jira) | [atlassian-jira/SKILL.md](atlassian-jira/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill atlassian-jira` |
| 🔌 Install Atlassian Rovo MCP | `/agency:atlassian-mcp-setup` | Guide users through Atlassian Rovo MCP installation with setup discovery first, then project-local or multi-project instructions tailored to OS/runtime (Windows, WSL, macOS, Linux). | [atlassian-mcp-setup/SKILL.md](atlassian-mcp-setup/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill atlassian-mcp-setup` |
| 🗂️ Context Management | `/agency:context-management` | The one layout every agency skill follows for customized data (v3.0.0): project memory in `.agents/contexts/agency/<skill>/MEMORY.md`, secrets in `.agents/credentials/`, and a team's or brand's extension as a counterpart skill in an `agency-skills-<ext_name>` plugin, with precedence, entry format and legacy-folder migration. Also creates and troubleshoots an extension on request. | [context-management/SKILL.md](context-management/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill context-management` |
| 🚀 Project Initiation | `/agency:dev-init-project` | Set up a repository for coding agents (v1.2.0): one `AGENTS.md` per folder with `CLAUDE.md`/`GEMINI.md` symlinks, fixed Jira card moves, squash auto-merge, browser verification, and the two-workflow GitHub Actions layout (`Tests` on PRs, `Deploy` on `main`) with a Playwright smoke test. | [dev-init-project/SKILL.md](dev-init-project/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill dev-init-project` |
| ⚛️ React Best Practices | `/agency:dev-react` | Opinionated React component architecture: SRP-driven splits, colocation, state isolation, explicit props, re-exported types, naming conventions, and practical file-size targets. | [dev-react/SKILL.md](dev-react/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill dev-react` |
| 🎨 UI/UX Best Practices | `/agency:dev-ui-ux` | Ensure every clickable element gives visual feedback on hover; prefer smoothly animated micro-interactions, accessible motion preferences, and practical examples. | [dev-ui-ux/SKILL.md](dev-ui-ux/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill dev-ui-ux` |
| ⚙️ DevOps | `/agency:devops` | Manage supported DevOps/hosting platforms by natural language — Coolify (self-hosted PaaS: apps, databases, services, deployments, logs, env vars — via the Coolify MCP server when connected, with the `coolify` CLI as the fallback, and MCP tool calls covered by the same write-confirmation and credential policies) and OCI (Oracle Cloud Infrastructure: `oci` CLI plus an opinionated bastion-tunnel workflow for SSH/SCP to private compute instances with no public IP) — via vendored, standalone copies of each platform's CLI docs; structured with one self-contained subdirectory per platform so Vercel and Cloudflare can be added later without touching existing platforms. | [devops/SKILL.md](devops/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill devops` |
| 🧠 Agent Instructor | `/agency:docs-agent-instructions` | Refine or create AI/LLM agent instruction files (AGENTS.md, CLAUDE.md, copilot-instructions.md, .github/instructions) with zero information loss, machine-parsable structure, and token efficiency. | [docs-agent-instructions/SKILL.md](docs-agent-instructions/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill docs-agent-instructions` |
| 📖 User Documentation | `/agency:docs-user-documentation` | Write end-user guides, manuals and help articles in plain non-technical language with a screenshot per step, or record a captioned walkthrough video with its manual page (v2.3.0). Remembers language and Notion targets per project, publishes to Notion, and applies its extension counterpart (brand credit, cover look, fixed language, music) when one is installed. | [docs-user-documentation/SKILL.md](docs-user-documentation/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill docs-user-documentation` |
| 📄 Estimate Project | `/agency:sales-estimate` | Create, name, and rename client estimate documents under docs/estimates/, dated by their Date of assessment metadata field, with a required AI Estimate row and a structured Scope/Assumptions/Breakdown format with a unique index on every section and sub-section (traceable, but not mirrored index-for-index, from the client quotation's Deliverables groups via back-references). Always re-reads the latest estimate (and matching quotation) from disk before estimating or writing, treating it as the source of truth (also on an explicit "refresh the data" request). Always asks the client name fresh per estimate rather than remembering it, and always shows proposed changes to an existing estimate in a table (with effort change and total AI Estimate delta) for confirmation before editing. Triggers whenever the user asks to estimate, scope, or size up a project or task. | [sales-estimate/SKILL.md](sales-estimate/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill sales-estimate` |
| 💵 Writing Quotations | `/agency:sales-quotation` | Turn an AI Estimate into a client-facing price using a fully-variablized pricing formula (buffer multiplier, man-day hours, base man-day rate, currency) remembered per project in .agents/contexts/agency/sales-quotation/MEMORY.md, write plain-business-language client quotations in Indonesian by default (with a clear Deliverables section and a unique index on every section and sub-section, never rendering empty sections or sub-sections (e.g. an empty Perlu Konfirmasi), following the skill's fixed 4-section structure — Lingkup Pekerjaan, Deliverables, Catatan, Estimasi Waktu & Investasi — traceable back to the estimate document's Breakdown items via back-references) saved as dated Markdown files under docs/quotations/ (always asking the client name and project name fresh, never remembered, with content-based fallbacks), always re-reading the latest quotation and source estimate from disk before writing (latest version is the source of truth; also on an explicit "refresh the data" request), always keeping a datetime-stamped Version in the quotation meta that is refreshed on every update, only producing a polished .docx on an explicit request each time (never auto-regenerating one, always generated via the anthropic-skills:docx skill rather than pandoc or hand-authoring per its own references/docx.md guide, with all references to the estimate removed from the docx, and always as a new file named with the current Version timestamp instead of overwriting a prior docx), always showing proposed changes to a quotation or Zoho Books estimate in a table for confirmation before editing, and handle scoped, non-destructive Zoho Books estimates (service-type line items, no unrequested man-hour detail). Triggers whenever the user asks to price, quote, or update a Zoho Books estimate. | [sales-quotation/SKILL.md](sales-quotation/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill sales-quotation` |
| 🪙 Token Saver | `/agency:token-saver` | Invoked at the start of every coding task (v1.2.0): makes the main model an orchestrator that plans once in a file, routes each task to the cheapest capable model, caps sub-agent replies, keeps tool output out of the main context, and verifies with commands (browser checks run the app's `test:e2e` script) instead of re-reading code or driving a browser. | [token-saver/SKILL.md](token-saver/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill token-saver` |

## Repository Layout

```text
agent-skills/
├── README.md
├── AGENTS.md                   # repo rules for agents; CLAUDE.md and GEMINI.md are symlinks to it
├── .claude-plugin/
│   └── marketplace.json        # one plugin: agency
├── atlassian-confluence/
│   └── SKILL.md
├── atlassian-jira/
│   ├── SKILL.md
│   └── references/
├── atlassian-mcp-setup/
│   └── SKILL.md
├── context-management/
│   ├── SKILL.md
│   ├── references/             # extension-setup.md
│   └── templates/              # SKILL.md, EXTENSION.md, marketplace.json
├── dev-init-project/
│   └── SKILL.md
├── dev-react/
│   └── SKILL.md
├── dev-ui-ux/
│   └── SKILL.md
├── devops/
│   ├── SKILL.md
│   ├── coolify/                # SKILL.md, LICENSE, scripts/, references/
│   └── oci/                    # SKILL.md, LICENSE, scripts/, references/
├── docs-agent-instructions/
│   └── SKILL.md
├── docs-user-documentation/
│   ├── SKILL.md
│   ├── references/
│   ├── scripts/                # lib.mjs, record.mjs (video recorder)
│   └── templates/
├── sales-estimate/
│   └── SKILL.md
├── sales-quotation/
│   ├── SKILL.md
│   └── references/
└── token-saver/
    └── SKILL.md
```

## Why Agent Skills

- Better quality: repeat proven workflows instead of starting from scratch each time.
- Better speed: reduce back-and-forth by giving agents concrete execution guidance.
- Better consistency: standardize outputs across repeated task types.
- Better collaboration: capture team knowledge in a reusable format.

## License

This repository uses the MIT License for skill content unless stated otherwise in individual skill files.
