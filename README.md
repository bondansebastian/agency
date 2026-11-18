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

**Upgrading from the per-skill plugins:** the individual plugins (`jira`, `devops`, `writing-quotations`, …) no longer exist. Uninstall them and install `agency` instead. Skills were renamed domain-first (see the catalog), and `laravel8-guidelines` was removed. Per-project state moved under an `agency/` folder with the new names (`.agents/contexts/jira/` → `.agents/contexts/agency/atlassian-jira/`, `writing-quotations/` → `agency/sales-quotation/`, `writing-user-guide/` → `agency/docs-user-guide/`, and the matching `.agents/credentials/` folder). Each skill migrates a legacy folder to the new path the first time it encounters one, and keeps using the legacy path if it cannot be moved, so existing memory files keep working.

## Skill Catalog

| Skill | Command | Description | Path | Install |
|---|---|---|---|---|
| 📚 Confluence Knowledge Base | `/agency:atlassian-confluence` | Build and maintain a product-focused Confluence knowledge base that is accessible to design, engineering, sales, and support. | [atlassian-confluence/SKILL.md](atlassian-confluence/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill atlassian-confluence` |
| 🧭 Jira | `/agency:atlassian-jira` | Natural-language Jira assistant (v1.1.2) for viewing, creating, and updating issues, supporting CLI and MCP backends; always sets a time estimate on the native Original Estimate field (agent-generated AI Estimate + human review estimate, the latter being a fixed 1-hour review unit scaled by a project human review time remembered in `.agents/contexts/jira/MEMORY.md`, defaulting to `1`), never in the description. (Forked from https://github.com/davila7/claude-code-templates/cli-tool/components/skills/ai-research/jira) | [atlassian-jira/SKILL.md](atlassian-jira/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill atlassian-jira` |
| 🔌 Install Atlassian Rovo MCP | `/agency:atlassian-mcp-setup` | Guide users through Atlassian Rovo MCP installation with setup discovery first, then project-local or multi-project instructions tailored to OS/runtime (Windows, WSL, macOS, Linux). | [atlassian-mcp-setup/SKILL.md](atlassian-mcp-setup/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill atlassian-mcp-setup` |
| 🚀 Project Initiation | `/agency:dev-project-initiation` | Set up a repository for coding agents (v1.0.0): one `AGENTS.md` per folder with `CLAUDE.md`/`GEMINI.md` symlinks, fixed Jira card moves, squash auto-merge, browser verification, and the two-workflow GitHub Actions layout (`Tests` on PRs, `Deploy` on `main`) with a Playwright smoke test. | [dev-project-initiation/SKILL.md](dev-project-initiation/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill dev-project-initiation` |
| ⚛️ React Best Practices | `/agency:dev-react` | Opinionated React component architecture: SRP-driven splits, colocation, state isolation, explicit props, re-exported types, naming conventions, and practical file-size targets. | [dev-react/SKILL.md](dev-react/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill dev-react` |
| 🎨 UI/UX Best Practices | `/agency:dev-ui-ux` | Ensure every clickable element gives visual feedback on hover; prefer smoothly animated micro-interactions, accessible motion preferences, and practical examples. | [dev-ui-ux/SKILL.md](dev-ui-ux/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill dev-ui-ux` |
| ⚙️ DevOps | `/agency:devops` | Manage supported DevOps/hosting platforms by natural language — Coolify (self-hosted PaaS: apps, databases, services, deployments, logs, env vars — via the Coolify MCP server when connected, with the `coolify` CLI as the fallback, and MCP tool calls covered by the same write-confirmation and credential policies) and OCI (Oracle Cloud Infrastructure: `oci` CLI plus an opinionated bastion-tunnel workflow for SSH/SCP to private compute instances with no public IP) — via vendored, standalone copies of each platform's CLI docs; structured with one self-contained subdirectory per platform so Vercel and Cloudflare can be added later without touching existing platforms. | [devops/SKILL.md](devops/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill devops` |
| 🧠 Agent Instructor | `/agency:docs-agent-instructions` | Refine or create AI/LLM agent instruction files (AGENTS.md, CLAUDE.md, copilot-instructions.md, .github/instructions) with zero information loss, machine-parsable structure, and token efficiency. | [docs-agent-instructions/SKILL.md](docs-agent-instructions/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill docs-agent-instructions` |
| 🎬 IgnisLabs User Documentation | `/agency:docs-user-documentation` | Create IgnisLabs-branded Indonesian user documentation for a web app feature (v1.0.1): a captioned Playwright screen-recording video with cover, watermark, cursor, title cards and ambient music, plus the matching Notion User Manual page. | [docs-user-documentation/SKILL.md](docs-user-documentation/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill docs-user-documentation` |
| 📖 Writing User Guide | `/agency:docs-user-guide` | Write end-user guides, manuals, and help center articles in plain non-technical business language for the app's actual end-user, as numbered step-by-step instructions with a screenshot per step where possible (preferring the playwright-cli tool for browser interaction and screenshot capture, offering to install playwright-cli or its skill if not detected), never referencing ticket numbers, JIRA IDs, feature flags, or other internal identifiers; always checks a project-local MEMORY.md at `.agents/contexts/agency/docs-user-guide/` (a fixed per-project path, regardless of whether the skill itself is installed locally or globally) at the start for a remembered guide language before drafting (asking and saving it if not yet known); when publishing to Notion, always uses the notion-cli (`ntn`) tool — never a Notion MCP server or other integration — offering to install it if not detected; checks MEMORY.md for a known target page and always asks the user explicitly before writing if none is found, then organizes content using the default structure (project page → "User Manual" page → one sub-page per module) unless MEMORY.md or the user specifies otherwise; if a login page blocks screenshot capture, checks a separate, git-ignored credentials folder at `.agents/credentials/agency/docs-user-guide/` for saved credentials and otherwise asks the user, offering to remember them there for next time (kept apart from the regular MEMORY.md context so secrets never risk being committed). | [docs-user-guide/SKILL.md](docs-user-guide/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill docs-user-guide` |
| 📄 Estimate Project | `/agency:sales-estimate` | Create, name, and rename client estimate documents under docs/estimates/, dated by their Date of assessment metadata field, with a required AI Estimate row and a structured Scope/Assumptions/Breakdown format with a unique index on every section and sub-section (traceable, but not mirrored index-for-index, from the client quotation's Deliverables groups via back-references). Always re-reads the latest estimate (and matching quotation) from disk before estimating or writing, treating it as the source of truth (also on an explicit "refresh the data" request). Always asks the client name fresh per estimate rather than remembering it, and always shows proposed changes to an existing estimate in a table (with effort change and total AI Estimate delta) for confirmation before editing. Triggers whenever the user asks to estimate, scope, or size up a project or task. | [sales-estimate/SKILL.md](sales-estimate/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill sales-estimate` |
| 💵 Writing Quotations | `/agency:sales-quotation` | Turn an AI Estimate into a client-facing price using a fully-variablized pricing formula (buffer multiplier, man-day hours, base man-day rate, currency) remembered per project in .agents/contexts/agency/sales-quotation/MEMORY.md, write plain-business-language client quotations in Indonesian by default (with a clear Deliverables section and a unique index on every section and sub-section, never rendering empty sections or sub-sections (e.g. an empty Perlu Konfirmasi), following the skill's fixed 4-section structure — Lingkup Pekerjaan, Deliverables, Catatan, Estimasi Waktu & Investasi — traceable back to the estimate document's Breakdown items via back-references) saved as dated Markdown files under docs/quotations/ (always asking the client name and project name fresh, never remembered, with content-based fallbacks), always re-reading the latest quotation and source estimate from disk before writing (latest version is the source of truth; also on an explicit "refresh the data" request), always keeping a datetime-stamped Version in the quotation meta that is refreshed on every update, only producing a polished .docx on an explicit request each time (never auto-regenerating one, always generated via the anthropic-skills:docx skill rather than pandoc or hand-authoring per its own references/docx.md guide, with all references to the estimate removed from the docx, and always as a new file named with the current Version timestamp instead of overwriting a prior docx), always showing proposed changes to a quotation or Zoho Books estimate in a table for confirmation before editing, and handle scoped, non-destructive Zoho Books estimates (service-type line items, no unrequested man-hour detail). Triggers whenever the user asks to price, quote, or update a Zoho Books estimate. | [sales-quotation/SKILL.md](sales-quotation/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill sales-quotation` |
| 🪙 Token Saver | `/agency:token-saver` | Invoked at the start of every coding task (v1.1.2): makes the main model an orchestrator that plans once in a file, routes each task to the cheapest capable model, caps sub-agent replies, keeps tool output out of the main context, and verifies with commands (browser checks run the app's `test:e2e` script) instead of re-reading code or driving a browser. | [token-saver/SKILL.md](token-saver/SKILL.md) | `npx skills add https://github.com/bondansebastian/agent-skills --skill token-saver` |

## Repository Layout

```text
agent-skills/
├── README.md
├── .claude-plugin/
│   └── marketplace.json        # one plugin: agency
├── atlassian-confluence/
│   └── SKILL.md
├── atlassian-jira/
│   ├── SKILL.md
│   └── references/
├── atlassian-mcp-setup/
│   └── SKILL.md
├── dev-project-initiation/
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
│   ├── assets/                 # ambient music bed (mp3, ~5.9 MB)
│   ├── references/
│   ├── scripts/
│   └── templates/
├── docs-user-guide/
│   ├── SKILL.md
│   └── references/
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
