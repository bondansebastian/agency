# Agency

![Plugin](https://img.shields.io/badge/Claude_Code_plugin-agency-0ea5e9?style=for-the-badge)
![Skills](https://img.shields.io/badge/Skills-13-22c55e?style=for-the-badge)
![Format](https://img.shields.io/badge/Format-SKILL.md-f59e0b?style=for-the-badge)

> The working skills of a small software agency, packaged as one Claude Code plugin: Jira and Confluence, estimates and quotations, user documentation, project setup, front-end conventions and DevOps.

## What this is

`agency` is a single [Claude Code plugin](https://code.claude.com/docs/en/plugin-marketplaces) with 13 skills. Each skill is a folder with a `SKILL.md` that tells an agent when to use it and how to do the work. In Claude Code every skill is invoked as `/agency:<skill>`, and typing `/agency` lists them all.

Three ideas hold the collection together:

- **Brand-neutral.** Nothing here names a team, client or brand. A team's own rules live in a separate **extension** plugin (see [Customizing](#customizing)).
- **Nothing stored in a skill.** What a skill remembers for a project lives in that project's `.agents/` folder, in one layout defined by the `context-management` skill.
- **Skills know about each other.** Where two skills overlap, both say which one wins (see [How the skills fit together](#how-the-skills-fit-together)).

## Install

### Claude Code

Add the marketplace once, then install the plugin:

````text
/plugin marketplace add bondansebastian/agency
/plugin install agency@bondansebastian-skills
````

Or in one step (Claude Code 2.1.275 or later):

````text
/plugin install agency --marketplace bondansebastian/agency
````

Update later with `/plugin marketplace update bondansebastian-skills`. A newly installed or updated plugin takes effect in a new session.

### Other agents

Agents that read `SKILL.md` folders can install one skill at a time:

````text
npx skills add https://github.com/bondansebastian/agency --skill <skill-name>
````

Use the name from the catalog below, for example `--skill atlassian-jira`. Skills that store data keep working on their own, and work best with `context-management` installed beside them. Extensions work in Claude Code only.

## Skill catalog

| Skill | Command | Version | What it does |
|---|---|---|---|
| 📚 [Confluence Knowledge Base](atlassian-confluence/SKILL.md) | `/agency:atlassian-confluence` | 1.2.1 | Build and maintain a product-focused Confluence knowledge base that design, engineering, sales and support can all read. |
| 🧭 [Jira](atlassian-jira/SKILL.md) | `/agency:atlassian-jira` | 1.3.2 | View, create and update Jira issues in plain language, through the Atlassian MCP server or the `jira` CLI. Always sets a time estimate on the native Original Estimate field. |
| 🔌 [Atlassian MCP Setup](atlassian-mcp-setup/SKILL.md) | `/agency:atlassian-mcp-setup` | 1.2.1 | Install and configure the Atlassian Rovo MCP server, per project or for many projects, for the user's OS and client. |
| 🗂️ [Context Management](context-management/SKILL.md) | `/agency:context-management` | 3.0.1 | The one layout for customized data: project memory, credentials and extensions. Also creates, installs and troubleshoots an extension on request. |
| 🚀 [Init Project](dev-init-project/SKILL.md) | `/agency:dev-init-project` | 1.2.1 | Set up a repository for coding agents: `AGENTS.md` with `CLAUDE.md` and `GEMINI.md` symlinks, Jira card moves, squash auto-merge, the `Tests` and `Deploy` workflows, and a Playwright browser test script. |
| ⚛️ [React](dev-react/SKILL.md) | `/agency:dev-react` | 1.2.2 | React component architecture: single-responsibility splits, colocation, state isolation, explicit props, naming and file-size targets. |
| 🎨 [UI/UX](dev-ui-ux/SKILL.md) | `/agency:dev-ui-ux` | 1.2.1 | Visible feedback on every clickable element, smooth micro-interactions and accessible motion preferences. |
| ⚙️ [DevOps](devops/SKILL.md) | `/agency:devops` | 1.6.1 | Manage Coolify (MCP server first, `coolify` CLI as fallback) and Oracle Cloud Infrastructure (`oci` CLI, SSH and SCP through a bastion tunnel) in plain language. |
| 🧠 [Agent Instructions](docs-agent-instructions/SKILL.md) | `/agency:docs-agent-instructions` | 1.2.1 | Write or refine instruction files for AI agents with no loss of constraints, a machine-parsable structure and few tokens. |
| 📖 [User Documentation](docs-user-documentation/SKILL.md) | `/agency:docs-user-documentation` | 2.4.0 | Write end-user guides in plain language with a screenshot per step, or record a captioned walkthrough video with its manual page, and publish to Notion. |
| 📄 [Estimate](sales-estimate/SKILL.md) | `/agency:sales-estimate` | 1.7.1 | Create and maintain structured project estimate documents under `docs/estimates/`, with a required AI Estimate and indexed Scope, Assumptions and Breakdown sections. |
| 💵 [Quotation](sales-quotation/SKILL.md) | `/agency:sales-quotation` | 1.14.2 | Turn an AI Estimate into a client-facing quotation with a pricing formula remembered per project, and manage the matching Zoho Books estimate. |
| 🪙 [Token Saver](token-saver/SKILL.md) | `/agency:token-saver` | 1.2.1 | Keep coding tasks cheap: plan once in a file, route each piece of work to the cheapest capable model, keep tool output out of the main context, verify with commands. |

Skill names are domain-first (`atlassian-*`, `dev-*`, `docs-*`, `sales-*`) so related skills sort together.

## How the skills fit together

| When | Which skill decides |
|---|---|
| A Jira card moves because of work in a repository | `dev-init-project`. `atlassian-jira` performs the move with no approval and no in-between status, unless the project's memory records an override. |
| An instruction file is written or edited | `dev-init-project` decides the file (`AGENTS.md`, never `CLAUDE.md` or `GEMINI.md`). `docs-agent-instructions` decides the wording. |
| A change is browser-verified | `token-saver`: run the app's `test:e2e` script. `dev-init-project` sets that script up. |
| A quotation is needed | `sales-estimate` produces the AI Estimate first; `sales-quotation` prices it. |
| Any skill needs remembered data, a login or a team's rules | `context-management` says where it lives. |

## Customizing

Skills take what differs per project or per team from outside this repository. The [`context-management`](context-management/SKILL.md) skill defines how, once, and every other skill follows it.

### Per project: memory and credentials

Skills remember non-sensitive values for a project (a pricing variable, a default language, a Notion target) so they don't ask twice, and save logins only after asking:

````text
<project-root>/.agents/
├── contexts/agency/<skill-name>/MEMORY.md      # written by skills, committed
└── credentials/agency/<skill-name>/            # secrets, never committed
````

`atlassian-jira`, `sales-quotation` and `docs-user-documentation` store memory today; `docs-user-documentation` can also save logins.

### Per team or brand: extensions

An extension is a separate plugin, usually private, named `agency-<ext_name>` (the default is `agency-extension`). For each skill it customizes, it has a skill with the same name: the counterpart.

````text
agency:docs-user-documentation               the public skill
agency-extension:docs-user-documentation     its counterpart
````

- Every skill here starts by looking for its counterpart, loads it, and lets it win where the two differ. With several extensions installed, the last one wins.
- An extension is installed once and applies in every project. Nothing is added to the project.
- A project can switch an installed extension off for a skill with `- **Extension** — none` in that skill's memory.
- Ask an agent to "create an extension for my team" and `context-management` builds one from its templates and explains how to install it.

What a skill reads from its extension is documented in that skill. `docs-user-documentation`, for example, takes a credit and watermark, a cover look, a fixed language, labels and music; see [docs-user-documentation/references/extension.md](docs-user-documentation/references/extension.md).

## Upgrading from older versions

Earlier releases published each skill as its own plugin. Uninstall those and install `agency`.

| Before | Now |
|---|---|
| `jira` | `atlassian-jira` |
| `confluence-knowledge-base` | `atlassian-confluence` |
| `install-atlassian-rovo-mcp` | `atlassian-mcp-setup` |
| `estimate-project` | `sales-estimate` |
| `writing-quotations` | `sales-quotation` |
| `writing-user-guide` | `docs-user-documentation` |
| `agent-instructor` | `docs-agent-instructions` |
| `react-best-practices` | `dev-react` |
| `ui-ux-best-practices` | `dev-ui-ux` |
| `laravel8-guidelines` | Removed |

Memory saved under an old folder name (`.agents/contexts/jira/`, `.agents/contexts/writing-quotations/`, `.agents/contexts/writing-user-guide/`) is moved to `.agents/contexts/agency/<skill-name>/` the first time the skill runs, so nothing has to be re-entered.

## Repository layout

```text
agency/
├── README.md
├── AGENTS.md                   # rules for agents working here; CLAUDE.md and GEMINI.md are symlinks to it
├── .claude-plugin/
│   └── marketplace.json        # one plugin: agency
├── atlassian-confluence/
│   └── SKILL.md
├── atlassian-jira/
│   ├── SKILL.md
│   ├── README.md
│   └── references/             # CLI commands, MCP tools
├── atlassian-mcp-setup/
│   └── SKILL.md
├── context-management/
│   ├── SKILL.md
│   ├── references/             # extension-setup.md
│   └── templates/              # SKILL.md, EXTENSION.md, marketplace.json for a new extension
├── dev-init-project/
│   └── SKILL.md
├── dev-react/
│   └── SKILL.md
├── dev-ui-ux/
│   └── SKILL.md
├── devops/
│   ├── SKILL.md                # routes to the platform skills below
│   ├── coolify/                # SKILL.md, LICENSE, scripts/, references/
│   └── oci/                    # SKILL.md, LICENSE, scripts/, references/
├── docs-agent-instructions/
│   └── SKILL.md
├── docs-user-documentation/
│   ├── SKILL.md
│   ├── references/             # extension, language, Notion, video, troubleshooting
│   ├── scripts/                # lib.mjs, record.mjs (video recorder)
│   └── templates/              # scenario.template.mjs
├── sales-estimate/
│   └── SKILL.md
├── sales-quotation/
│   ├── SKILL.md
│   └── references/             # quotation text, .docx, Zoho Books
└── token-saver/
    └── SKILL.md
```

## Contributing

[AGENTS.md](AGENTS.md) holds the rules for changing this repository, for people and agents alike: versioning, the catalog and marketplace sync, skill naming, the extension counterpart section every skill carries, the checks to run, and how changes are merged.

Check a change before opening a pull request:

````text
claude plugin validate .
````

## License

MIT for skill content unless a skill says otherwise. The `devops/coolify` and `devops/oci` skills carry their own `LICENSE` files.
