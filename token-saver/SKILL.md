---
name: token-saver
description: "Invoke at the start of EVERY coding task the user requests (feature, bug fix, refactor, tests, migration, review), before reading code or writing a plan. Keeps token cost down by making the main model an orchestrator: plan once in a file, route each piece of work to the cheapest model that can do it, keep tool output out of the main context, and verify with commands instead of re-reading code."
version: 1.5.2
---

# Token Saver Skill

## Extension counterpart

Before doing anything else, check the available skills for one named `token-saver` in a plugin called `agency-<ext_name>` (for example `agency-extension:token-saver`). If one exists, load it now and follow it together with this skill; where the two differ, the counterpart wins. With several, the last one wins; the `context-management` skill gives the order. If none exists, carry on with this skill's defaults.

## When to use this skill

Load it for every coding task, as the first step. It sets how the work is run; it does not replace
the project's own instructions (`AGENTS.md`, `CLAUDE.md`) or the user's instructions, which win on
any conflict.

Size the process to the task first:

| Task size | What to do |
|---|---|
| Small (one or two files, a few tool calls) | Do it yourself. Apply only "Keep the main context small". A delegation costs more than it saves. |
| Medium (one module, clear steps) | Short plan in your head or a few lines, one or two delegated tasks. |
| Large (several modules, new feature) | Full flow below: plan file, routed tasks, parallel groups. |

## Before the plan

Follow the `dev-guidelines` skill (ask only what the project cannot answer, stay inside the current flow) before any design, plan or question.

## The flow for a large task

1. **Settle the requirements before any code.** Ask only the questions that pass the test in the
   `dev-guidelines` skill, in one batch. Rework is the most expensive token cost there is.
2. **Plan once, in a file.** Have the strongest model write one plan file in the repo (e.g.
   `docs/plans/<date>-<topic>.md`): the decisions (names, columns, endpoints, keys, no "TBD"), then
   numbered tasks in dependency order. Each task names the exact files it creates or changes, its
   tests, and the commands that must pass. A task that adds or changes a UI or a user-visible
   feature also names the browser spec files it adds, updates or must run (in the app's `e2e/`
   folder) and lists `test:e2e -- <those specs>` among its commands, not the full suite. Mark which tasks can run in parallel.
3. **Route each task to the cheapest model that can do it** (table below), one task per agent.
4. **Verify with commands, commit, start the next group.** The orchestrator does not write the code.

## Model routing

| Work | Model tier | Claude example |
|---|---|---|
| Architecture, the plan file, a hard debugging diagnosis, final review of risky logic | Strongest, used once | Opus / Fable |
| Implementing a planned task, writing tests, a normal bug fix | Mid | Sonnet |
| Searching the codebase, reading files to answer a question, renames, formatting, boilerplate, fetching a web page | Cheapest | Haiku |

- Escalate only on evidence: a task that failed its commands twice on the mid tier goes up one tier
  with the failing output, not the whole history.
- Never use the strongest model to read files or run searches whose result is a short answer.

## Writing a brief for a delegated task

The brief is the only context the agent has. Keep it short by pointing, not pasting.

- Point at files: "Implement task T3 of `docs/plans/...md`; read its Global constraints and the
  Decisions it references". Do not paste the plan or the code into the prompt.
- State what is already done and the facts the agent would otherwise rediscover: environment
  (database already running, no Docker), names that differ from the plan, decisions made by earlier
  tasks.
- List the files it may touch and say what is off limits.
- Give the commands that must pass.
- **Cap the reply**: "Final reply, max 12 lines: files changed, command results, deviations from the
  plan with reasons". The reply is what enters the expensive context.
- Tell it not to commit or push; the orchestrator does that.

## Running tasks in parallel

- Parallel tasks must not share files. Split by folder (API / web / shared) where possible.
- Shared contract first. When parallel tasks depend on the same types, schemas, constants or API shape, the orchestrator writes and builds that contract before starting them. Each brief says it is done and off limits (an agent that needs a change reports it instead of editing it). Until all tasks land, the repo-wide check can be red outside the contract; that is expected.
- Agents that share one working tree must not run `git add` or `git commit`: a staged change from
  one agent ends up in another's commit. The orchestrator commits each task by path
  (`git add <paths>`), after that task reports.
- Tell each agent which folders other agents are editing, and to verify only its own package when a
  repo-wide check fails on someone else's half-written files.
- Run the repo-wide check once per group, after all its agents have finished.

## Keep the main context small

- Trim command output at the source: `| tail -5`, `| grep -E "passed|failed"`, `git diff --stat`.
- Read excerpts, not whole files: search first, then read the line range you need.
- Never read a sub-agent's transcript; use its capped reply.
- Send independent tool calls in one batch.
- Do not load skills, docs or reference files the task does not need.
- Do not re-derive decided facts or restate the plan in chat; the plan file is the record.
- Do not delegate and then do the same work yourself.

## Verify cheaply

- Trust commands over reading: typecheck, lint, unit and integration tests, a build, the app's
  `test:e2e` script (the browser tests).
- Review a delegated task by its reported deviations and `git diff --stat`; open only the hunks that
  touch risky logic (money, permissions, migrations, data deletion).
- A failed check goes back to the same agent with only the failing output.

Browser verification:

- "Browser-verify" means: run `test:e2e` and see it pass. Do not open a browser, click through pages
  or read screenshots to verify. Driving a browser is one of the most expensive ways to verify; one
  command with filtered output is the cheapest.
- Exception: after building new UI, the `dev-ui-ux` skill's cheap smoke check (one short script
  loading only the new pages at two widths, one look at the screenshots, bugs fixed at once) is
  allowed. It spots bugs; it is not the verification, which is still `test:e2e`.
- Whenever a task tests a new UI or feature, the same task updates the browser test scripts. The
  agent that built the feature writes or updates the spec in the app's `e2e/` folder; the
  orchestrator only runs the command.
- `e2e/` and `test:e2e` are reserved for browser tests. If they run API or other non-browser tests,
  a green run is not a browser check: rename that suite (`test:api`, `api-tests/`) and every
  reference to it, proactively and in the same task, then set up the browser script under the freed
  name (`dev-init-project` sections 5 and 8).
- If the app has a web UI and no browser test script at all, set one up first by following section
  8 of the `dev-init-project` skill (Playwright, `e2e/smoke.spec.ts`, the `e2e` CI job), even though
  the repo never had one, then carry on.
- When no spec covers a flow yet, the agent may drive the browser by hand once to find it. After
  that manual check passes, it scripts the same check in `e2e/` and runs `test:e2e` before the task
  is done. The passing spec is the verification, not the manual run. Never drive the same check by
  hand twice.
- Run only the specs related to the change (`test:e2e -- e2e/<spec>`), with the output filtered to
  the failures. A failing spec is a failed check: it goes back to the same agent with only the
  failing output.
- Leave the full suite to the PR's `e2e` CI job. Run it locally only when there is no such job, the
  change touches code every page depends on (layout, routing, auth, global config), or the related
  specs are unknown. `dev-init-project` section 5 has the details and wins on any difference.
- Find the related specs in the `AGENTS.md` next to the changed code. When the link isn't obvious
  from the names, the agent that made the change adds a short file → spec note there.

## Report to the user

- Say which tasks are done, which are verified and by which command, and which are not verified yet.
- When a UI change is reported as verified, name `test:e2e` as the command and say which spec covers
  it. If a check was first driven by hand, say so and name the spec that now scripts it. If an API
  suite was renamed off `test:e2e`, say what it was renamed to.
- List every decision an agent made that the user did not approve, so they can object early.

## Pitfalls

- Asking the user a question the project already answers (an existing mechanism, a convention, an
  earlier message). Look first; ask only what `dev-guidelines` allows.
- Delegating a five-minute edit: the brief and the reply cost more than the edit.
- A vague plan: every agent then re-explores the codebase at full cost. Spend the tokens on the plan.
- Uncapped agent replies and unfiltered test output: the two largest avoidable costs.
- Fanning out many agents without asking: tell the user the rough scale first when it is large.
- An agent clicking through the app in a browser to verify, when a `test:e2e` script exists or could
  be added.
- Treating a green `test:e2e` that only calls an API as the browser check.
- Running the full e2e suite locally after every change, when the PR's `e2e` job runs it anyway.
- A manual browser check that never became a spec, so the next agent drives it by hand again.
