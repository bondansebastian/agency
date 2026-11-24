---
name: dev-guidelines
description: "General coding guidelines for any coding task. Invoke before designing a feature, writing a plan or a ticket, showing a mockup, or asking the user a question about how something should work. Today it holds three rules: ask only what the project cannot answer, stay inside the current flow (no capability the request did not ask for), and keep MCP tools in sync with the code (`@mcp` tags)."
version: 1.3.0
---

# Dev Guidelines

## Extension counterpart

Before doing anything else, check the available skills for one named `dev-guidelines` in a plugin called `agency-<ext_name>` (for example `agency-extension:dev-guidelines`). If one exists, load it now and follow it together with this skill; where the two differ, the counterpart wins. With several, the last one wins; the `context-management` skill gives the order. If none exists, carry on with this skill's defaults.

## When to use this skill

Load it at the start of any coding task, before the first design, plan, ticket, mockup or question. It sets how an agent behaves while it works; it does not replace the project's own instructions (`AGENTS.md`, `CLAUDE.md`) or the user's instructions, which win on any conflict. Other skills (`token-saver` for cost, `dev-ui-ux` for UI, `atlassian-jira` for tickets) point here instead of repeating these rules.

## Ask only what you cannot find

A question costs the user a round trip and shows the agent did not look. Before asking anything, try to answer it from the project: the code, the existing behaviour, the project's instructions, the docs, the tickets, and the user's earlier messages.

- **Follow the existing mechanism.** When the project already does the same kind of thing (how a date is set, how a default is chosen, what a derived record is called, where a setting lives, how a similar step is validated), do it the same way and say so in one line. Never offer the user a choice between "what the project does today" and an invented alternative.
- **Look at the user's sibling projects before choosing an approach.** IF the user has another repository that already solves the same problem (a deploy workflow, a runner type, a webhook call, a config pattern), THEN read how it does it and follow that. It shows what already works on the user's account and plan, which beats a guess about cost or availability. IF the user points to a sibling repository, THEN read it before answering.
- **Decide small things, report them.** A detail with a clear conventional default, or one the user can undo cheaply, is decided by the agent and listed under "decisions an agent made" in the report.
- **Ask only a real decision**: product behaviour, scope, a trade-off with a cost the user owns, or something destructive or irreversible, where the project gives no answer and two sensible answers lead to different results. State the options, recommend one, and give the consequence of each.
- **Never ask the user to explain the project to the agent**, and never ask a question whose answer is already in the conversation. Re-read the messages first.
- **A question the user answers with "follow the current behaviour" was not needed.** Treat that as a correction: next time, look for the current behaviour first.

## Judge against the goal

A question such as "does X support Y?" asks whether the user can reach Y, not whether X has a feature named Y.

1. Write Y down in the user's words (for example "the user can save the receipt as a PDF").
2. Find how the product already meets Y: its own convention, a sibling feature, the existing help text. A route the product already uses for the same goal counts (a print dialog with "Save as PDF" is a PDF download in an app that does this everywhere).
3. Answer yes or no on that basis, with the evidence you checked.
4. Name any real gap separately and label it as a gap, for example a missing way to reopen an old document. Never blur the answer with "partly" because a different mechanism exists that the user did not ask about.

## Stay inside the current flow

A request names what the user wants. A design that adds capabilities the request did not name makes the user review, reject and undo them. "Design the best flow" means the best arrangement of what exists, not extra features.

1. **Write down what exists today** before designing anything that touches an existing object: its states, what can be edited and by whom, which steps and actions it has, how defaults, dates and options are set. Cite where each line comes from (a file, a doc, a ticket). Keep it to a few lines.
2. **Build only on that note.** Every element of the design points to something that exists, or to the user's request. A control, state, operation, setting or edit path that does not exist today is new: leave it out unless the user asked for it.
3. **Extras go to a short "possible follow-ups" list**, outside the scope, the acceptance criteria and the mockup. The user adds one by asking.
4. **Make the smallest change that satisfies the request.** Prefer the existing mechanism over a new one, and one place to configure something over two.
5. **One pass before showing anything** (a design, a plan, a ticket, a mockup): "what here did the user not ask for, and does the current flow already have it?" Remove it or move it to follow-ups.

## Keep MCP tools in sync with the code

In a project that has an MCP server, the code that a tool exposes carries a comment tag: `@mcp <tool_name>[, <tool_name>]` directly above the route handler, controller method, resolver, or shared schema or type that a tool takes as input. `@mcp none: <reason>` marks code deliberately not exposed (a binary download, an upload). The tag works in any comment syntax.

- **When you change code that carries an `@mcp` tag, update the tools it names in the same change**: path, method, input schema, permissions and description.
- **A new route in an area that has MCP tools gets a tool, or `@mcp none: <reason>`.**
- **Never keep the mapping in prose.** `AGENTS.md` holds the convention only, never a list of routes and tools; a list drifts, a tag moves with the code.
- A pure refactor that needs no tool change says so in the commit message with the line `MCP: unchanged — <reason>`.
- In Claude Code with the `agency` plugin, a hook blocks `git commit` when tagged code changed and the tool did not. A project without `@mcp` tags is never affected. Elsewhere the project's CI is the backstop.

## Adding a guideline

Keep each guideline here short and general: a rule an agent can apply to any project, with no brand, client or product detail. Put team-specific rules in an extension, and rules about one tool in that tool's skill. When this skill changes, increment its `version`.
