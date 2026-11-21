---
name: dev-guidelines
description: "General coding guidelines for any coding task. Invoke before designing a feature, writing a plan or a ticket, showing a mockup, or asking the user a question about how something should work. Today it holds two rules: ask only what the project cannot answer, and stay inside the current flow (no capability the request did not ask for)."
version: 1.0.0
---

# Dev Guidelines

## Extension counterpart

Before doing anything else, check the available skills for one named `dev-guidelines` in a plugin called `agency-<ext_name>` (for example `agency-extension:dev-guidelines`). If one exists, load it now and follow it together with this skill; where the two differ, the counterpart wins. With several, the last one wins; the `context-management` skill gives the order. If none exists, carry on with this skill's defaults.

## When to use this skill

Load it at the start of any coding task, before the first design, plan, ticket, mockup or question. It sets how an agent behaves while it works; it does not replace the project's own instructions (`AGENTS.md`, `CLAUDE.md`) or the user's instructions, which win on any conflict. Other skills (`token-saver` for cost, `dev-ui-ux` for UI, `atlassian-jira` for tickets) point here instead of repeating these rules.

## Ask only what you cannot find

A question costs the user a round trip and shows the agent did not look. Before asking anything, try to answer it from the project: the code, the existing behaviour, the project's instructions, the docs, the tickets, and the user's earlier messages.

- **Follow the existing mechanism.** When the project already does the same kind of thing (how a date is set, how a default is chosen, what a derived record is called, where a setting lives, how a similar step is validated), do it the same way and say so in one line. Never offer the user a choice between "what the project does today" and an invented alternative.
- **Decide small things, report them.** A detail with a clear conventional default, or one the user can undo cheaply, is decided by the agent and listed under "decisions an agent made" in the report.
- **Ask only a real decision**: product behaviour, scope, a trade-off with a cost the user owns, or something destructive or irreversible, where the project gives no answer and two sensible answers lead to different results. State the options, recommend one, and give the consequence of each.
- **Never ask the user to explain the project to the agent**, and never ask a question whose answer is already in the conversation. Re-read the messages first.
- **A question the user answers with "follow the current behaviour" was not needed.** Treat that as a correction: next time, look for the current behaviour first.

## Stay inside the current flow

A request names what the user wants. A design that adds capabilities the request did not name makes the user review, reject and undo them. "Design the best flow" means the best arrangement of what exists, not extra features.

1. **Write down what exists today** before designing anything that touches an existing object: its states, what can be edited and by whom, which steps and actions it has, how defaults, dates and options are set. Cite where each line comes from (a file, a doc, a ticket). Keep it to a few lines.
2. **Build only on that note.** Every element of the design points to something that exists, or to the user's request. A control, state, operation, setting or edit path that does not exist today is new: leave it out unless the user asked for it.
3. **Extras go to a short "possible follow-ups" list**, outside the scope, the acceptance criteria and the mockup. The user adds one by asking.
4. **Make the smallest change that satisfies the request.** Prefer the existing mechanism over a new one, and one place to configure something over two.
5. **One pass before showing anything** (a design, a plan, a ticket, a mockup): "what here did the user not ask for, and does the current flow already have it?" Remove it or move it to follow-ups.

## Adding a guideline

Keep each guideline here short and general: a rule an agent can apply to any project, with no brand, client or product detail. Put team-specific rules in an extension, and rules about one tool in that tool's skill. When this skill changes, increment its `version`.
