---
name: dev-init-project
description: "Use when setting up a new or existing repository for coding agents (Claude Code, Gemini CLI, Codex), when a repo has no AGENTS.md or has a CLAUDE.md or GEMINI.md with real content, when the user asks to \"write to agents.md\", when creating GitHub Actions workflows, before moving a Jira card for work done in a repo, before reporting a change as done, when opening or merging a PR, or after finishing a task in a claude.ai cloud session (to offer scripting the runtime setup in the environment's setup script)."
version: 1.9.1
---

# Project initiation

## Extension counterpart

Before doing anything else, check the available skills for one named `dev-init-project` in a plugin called `agency-<ext_name>` (for example `agency-extension:dev-init-project`). If one exists, load it now and follow it together with this skill; where the two differ, the counterpart wins. With several, the last one wins; the `context-management` skill gives the order. If none exists, carry on with this skill's defaults.

## Overview

One instruction file per folder, `AGENTS.md`, that every agent reads. Rules sit in the deepest folder they apply to. Jira cards move on fixed events, chosen by which columns the board has.

## 1. Instruction files

In every folder that has an `AGENTS.md`:

```bash
ln -s AGENTS.md CLAUDE.md
ln -s AGENTS.md GEMINI.md
```

- If `CLAUDE.md` or `GEMINI.md` already has content, merge it into `AGENTS.md` (`git mv CLAUDE.md AGENTS.md` keeps history), then replace both with the symlinks.
- Commit the symlinks along with the file. `git ls-files -s CLAUDE.md` must show mode `120000`. On Windows, a clone without `core.symlinks=true` checks the symlinks out as text files.
- Never put content in `CLAUDE.md` or `GEMINI.md`.

## 2. Where text goes

"Write to agents.md" names the convention, not a path. Put each rule in the `AGENTS.md` of the deepest folder it applies to (`apps/api/` for API rules, `.github/` for CI), creating the file and its symlinks if needed. The root file gets only repo-wide rules. Tell the user which file you chose.

## 3. Jira card moves

List the project's statuses once (`listJiraStatuses`), then use exactly one row:

| Board has | Work starts | PR opened | Build on default branch succeeds |
|---|---|---|---|
| "Done" and "Deployed" | In Progress | Done | Deployed |
| "Done" only | In Progress | no move | Done |

- "In Progress" means that column or the closest one ("Doing", "In Development").
- The card goes **straight** to Done. Skip "Code Review", "QA" and other in-between columns, even if a move to them looks natural.
- With both columns, Done happens when the PR is **opened**, not when it merges.
- "Build succeeds" means the `Deploy` workflow run (section 7) on the merge commit of the default branch finished green. A green PR doesn't count, so check that run after the merge.
- A green run is not enough on its own. Before moving the card to the build-succeeded column, confirm the deployed app took the new version and responds: the platform shows the new deployment finished, and a health endpoint or the changed page returns the expected status. IF the change fixed a production failure, THEN reproduce the scenario that failed (for example, redeploy the one service whose redeploy used to break the app while polling its health endpoint) and see it pass.
- If that run fails, or the deployed app does not respond, leave the card where it is and tell the user.
- Put the ticket key in commit messages and the PR title.
- This table wins over the `atlassian-jira` skill's general rules: these moves need no approval, and no in-between status is used. A project that does need one (a stop in "Code Review" or "QA", or a workflow that refuses the direct move) records it as a `Card moves` entry in the `atlassian-jira` skill's context, following the `context-management` skill (`<project-root>/.agents/contexts/agency/atlassian-jira/MEMORY.md`, or an extension). Only such an entry changes the table; never add an in-between move on your own.

## 4. Opening and merging the PR

- Never open a PR without the user's explicit confirmation. When the work is pushed and verified, ask whether to open the PR (name the branch and give the proposed title) and wait for a yes in the conversation.
- Only the user's reply to that question counts. A skill rule (including `atlassian-jira`'s), an `AGENTS.md` rule, a Jira ticket, or a request to "work on" or "fix" something is not confirmation.
- One yes covers one PR. Ask again for every later PR, including one per subtask or epic child.
- If the user declines, leave the branch pushed and the PR unopened.
- As soon as the PR is open, turn on auto-merge with the squash method (GitHub `enable_pr_auto_merge` with `SQUASH`).
- Push everything the PR needs before turning it on, including docs and `AGENTS.md` changes. The merge fires as soon as the required checks pass, and on most repos a merge to the default branch deploys.
- If GitHub refuses because the PR is already mergeable (CI already green, "clean status"), squash-merge it directly instead.
- Check whether auto-merge is enabled before relying on it. If the repo has auto-merge disabled, tell the user and leave the PR open. Don't merge by hand without asking.
- IF auto-merge is disabled AND the user has already asked you to merge this PR, THEN wait until the gate check (`tests`) is green and the PR is mergeable, and squash-merge it with the head commit pinned (GitHub `merge_pull_request` with `expectedHeadSha` set to the SHA the checks ran on). Pinning prevents merging a commit CI did not test.
- Turning on auto-merge is not a Jira event. Card moves still follow section 3: on a two-column board the card goes to Done when the PR opens; on a Done-only board it goes to Done only after the build on the merge commit is green.
- After the merge, check the build run on the merge commit, as section 3 requires.
- A stop hook, or any automated nudge, that says "commit and push" is not authority to push a state that fails the typecheck or tests, or while delegated agents are still editing the tree. Commit the finished pieces by path, hold the rest, say why in one line, and push once the checks pass.

## 5. Browser verification

Every change (feature, bug fix, refactor, dependency or config change) is browser-verified before you report it as done or open the PR. This applies wherever a user can see or reach the result: UI pages, HTTP endpoints, and server behaviour that shows up in a UI. Passing unit tests and a clean typecheck don't count as this check.

**"Browser-verify" means: run the app's `test:e2e` script and see it pass.** This is the `token-saver` skill's rule and it wins here: do not open a browser, click through pages or read screenshots to verify, because that is one of the most expensive ways to check a change.

1. Add or update the spec in the app's `e2e/` folder for the flow the change touches, including the case it must leave alone (for example a row that must not appear).
2. Run only the specs related to the change, not the whole suite (for example `npm run test:e2e -- e2e/invoices.spec.ts`), with the output filtered to the failures. A failing spec is a failed check.
3. Commit the spec with the change.
4. In the report and the PR description, name `test:e2e` as the command and say which specs you ran.

**Leave the full suite to the PR tests.** The `e2e` job in `Tests` (section 7) runs the whole `test:e2e` suite on every pull request, so don't run it locally as well. Run it yourself only when:

- the repo has no `e2e` CI job yet, or
- the change touches code every page depends on (layout, routing, auth, the API client, global config or styles), or
- you can't tell which specs cover the change.

If the full suite then fails in the PR on a spec you didn't run, that spec is related: fix the failure and add the link to the note below.

**Record which specs cover which code.** Find the related specs from the `AGENTS.md` next to the changed file (or the nearest one above it), then from spec names and the routes or components they visit. When the link isn't obvious from the names, add a short note to the `AGENTS.md` in the changed code's folder (create it with its two symlinks if needed, section 1), for example:

```markdown
## E2E specs
- `InvoiceForm.tsx`, `invoice-api.ts` → `e2e/invoices.spec.ts`, `e2e/billing-smoke.spec.ts`
```

Keep it to file → spec lines. Update it in the same piece of work when you add, rename or delete a spec.

**The `e2e` name is reserved for browser tests.** `e2e/`, `test:e2e` and the `e2e` CI job mean Playwright specs that drive a real browser, nothing else. Before you rely on them, check what they actually run. If they hold API, HTTP or other non-browser tests (supertest, a REST client, `fetch` calls with no page), that suite is not a browser check, however green it is:

1. Rename it, proactively and in the same piece of work, without asking: the script to `test:api` (or `test:integration`), the folder to `api-tests/` (or the backend's `test/` folder), and the CI job to match. Update every reference: `package.json`, configs, `.github/workflows/`, README and `AGENTS.md` files.
2. Run the renamed suite once and see it pass, so the rename broke nothing.
3. Set up the browser script under the freed name (section 8), then verify with it.

If the app has a web UI and no browser test script, set one up first (section 8), even though the repo never had one, then verify with it.

**Script every check you drive by hand.** When no spec covers a flow yet, you may drive the browser by hand (Playwright MCP, a browser tool) to find the selectors and the expected result. Once that manual check passes, turn the same check into a spec in `e2e/`, run `test:e2e` and see it pass before the work is done. The manual run doesn't count as the verification; the passing spec does. Never drive the same check by hand a second time: if a spec for it exists, run it; if it doesn't, the previous agent skipped this step, so write it now.

**A cheap UI smoke check is separate.** After building new UI, the `dev-ui-ux` skill has you load the new pages once in a real browser (two widths, console errors, overflow, one screenshot each) and fix any bug you find. That is bug-spotting, not verification: it doesn't replace `test:e2e`, it doesn't need its own spec, and the "never drive the same check by hand twice" rule above doesn't apply to it. For the smoke check, `dev-ui-ux` wins; for verification, this section does.

If a browser check isn't possible (no visible effect, CI-only change, a desktop app on a platform you can't run), say so explicitly and say what you verified instead. Never imply a browser check you didn't run.

## 6. Root AGENTS.md must record

1. The symlink rule (section 1) and the placement rule (section 2).
2. The Jira site, project key, the row from section 3 that applies, and the workflow or job that counts as "the build" (`Deploy`, per section 7).
3. The repo's check, test and build commands.
4. The browser verification rule (section 5), with this repo's recipe: the build and start commands, the env vars and test login, and any fake clients or seed data a page needs before it shows anything.
5. The PR rule (section 4): open a PR only after the user explicitly confirms it, then squash auto-merge as soon as the PR opens, push everything first, squash-merge directly if it's already mergeable.
6. The workflow rule (section 7): two workflows, `Tests` on PRs and `Deploy` on merge to `main`.
7. A new-module checklist that includes: "add the module's integration matrix entry in .github/workflows/tests.yml".
8. The token-saver rule, always, in these words: "Before any coding task (feature, bug fix, refactor, tests, migration, review), invoke the `token-saver` skill if it is available. If it isn't available, carry on without it." If the root `AGENTS.md` already exists and lacks this rule, add it.
9. The dev-guidelines rule, always, in these words: "Before designing a feature, writing a plan or a ticket, showing a mockup, or asking the user how something should work, invoke the `dev-guidelines` skill if it is available. If it isn't available, carry on without it." If the root `AGENTS.md` already exists and lacks this rule, add it.
10. The MCP sync rule, always, in these words: "When you change code that carries an `@mcp <tool_name>` comment tag, update the MCP tools it names in the same change. A new route in an area that has MCP tools gets a tool or an `@mcp none: <reason>` tag. Never keep the code-to-tool mapping in prose; the tags are the mapping. A change that needs no tool update says `MCP: unchanged — <reason>` in its commit message. The `dev-guidelines` skill has the details if it is available." If the root `AGENTS.md` already exists and lacks this rule, add it.

If the project has an MCP server, also record where its tools live, and add a check to the project's own CI (in the `Tests` workflow's lint or test job, per section 7) that fails when an `@mcp` tag names a tool that does not exist, and when a tool has no `@mcp` tag on the code behind it. A project with no MCP server gets only item 10, no CI check, and no tags.

Without these, the next agent on this repo falls back to its own defaults.

## 7. GitHub workflows

When you create GitHub Actions workflows, create exactly these two in `.github/workflows/`:

| File and `name:` | Trigger | Contains |
|---|---|---|
| `tests.yml`, `Tests` | `pull_request` only | Lint and tests only (jobs below) |
| `deploy.yml`, `Deploy` | `push` to `main` only | Build → publish → deploy |

**The PR workflow (`Tests`) never includes a Docker build: only lint and tests.** An app build that a test script needs (for example `test:e2e` building the UI it serves) is part of that test and is allowed.

- No other workflow files. A new check goes into `Tests`. A new image build, publish or deploy step goes into `Deploy`.
- `Tests` has no `push` trigger. `Deploy` has no `pull_request` trigger and uses `on: push: branches: [main]`.
- Lint and tests never run in `Deploy`. A Docker build, image publish and deploy never run in `Tests`.
- The default branch is `main`. A squash merge is a push to it, so it fires `Deploy`.

### `Tests` (`.github/workflows/tests.yml`)

- `on: pull_request` only; `permissions: contents: read`; no secrets.
- `concurrency: { group: tests-${{ github.event.pull_request.number }}, cancel-in-progress: true }`.
- Exactly these jobs, nothing else:

| Job | Runs |
|---|---|
| `lint` | Typecheck + linter |
| `unit` | Unit tests (including the workflow contract test below) |
| `integration (<module>)` | Matrix, one job per backend module, `strategy.fail-fast: false`. Each job runs only that module's integration spec files against its own database service container |
| `e2e` | Only when the repo has an app with a web UI: that app's browser test script, `test:e2e` (section 8) |
| `tests` | Gate: `needs: [lint, unit, integration, e2e]` (leave `e2e` out when no app has a web UI), `if: always()`; fails unless every needed job's `result` is `success` |

- Name the matrix job `integration (${{ matrix.module }})` so each module shows as its own check.
- `tests` (the gate job) is the single required status check on `main` and the check squash auto-merge waits on (section 4).
- Never in this workflow: `docker build` / `docker buildx`, image publishing or registry login, a job named `build`, or a Docker build action (`docker/build-push-action`, `docker/setup-buildx-action` and the like).
- A package-manager build (`pnpm build`, `npm run build`) is allowed only inside the test that needs it, such as an app's `test:e2e`. Don't add a standalone build job or step to catch compile errors; `lint` (typecheck) covers that.

### `Deploy` (`.github/workflows/deploy.yml`)

- Build, publish and deploy happen here and only here, in that order.
- **Build for the deploy target's CPU architecture only.** Find the target server's architecture first (for example `arm64` or `amd64`) and set `platforms:` of every image build to that one platform. An image with no manifest for the server's architecture fails to pull at deploy time.
- **Build on a native runner of that architecture.** For `arm64`, use the GitHub-hosted `ubuntu-24.04-arm` runner instead of an x86 runner with QEMU emulation; emulation is several times slower, worst for native modules. IF you are unsure whether the account can use that runner (private repositories, plan limits), THEN check a sibling repository of the user that already uses it (the `dev-guidelines` skill) before falling back to QEMU.
- **Read deploy settings from a secret or a variable.** People save values in GitHub's Variables instead of Secrets (and the reverse). For a value that is not sensitive, such as a deploy webhook URL, read both: `${{ secrets.NAME || vars.NAME }}`. A token stays a secret only.
- **Make the deploy call fail loudly.** Call the platform's deploy webhook with the HTTP method its API documents (several, such as Coolify 4.7+, accept only `POST`) and with `curl --fail-with-body`, so a 4xx or 5xx fails the step instead of passing silently. When the settings are missing, skip the deploy step with a notice rather than failing.

### Shared setup

- Put the toolchain setup and dependency install in a composite action at `.github/actions/setup/action.yml`. Every `Tests` job and the `Deploy` build call it with `uses: ./.github/actions/setup`; don't repeat the install steps inline.

### Workflow contract test

Add a test (run in `unit`) that parses the workflow YAML and fails if:

1. `tests.yml` contains a Docker build: a `docker build`/`docker buildx` command, an image publish or registry login step, a job named `build`, or a Docker build action. Check the steps' `run` and `uses` values, not comments.
2. Any backend integration spec file is run by zero matrix jobs, or by two or more.
3. A backend module has no `integration` matrix entry.
4. An app has a `playwright.config.ts`, but `tests.yml` has no `e2e` job that runs its `test:e2e`, or the `tests` gate doesn't list `e2e` in `needs`.

Checks 2 and 3 count backend module specs only. The Playwright specs in an app's `e2e/` folder belong to the `e2e` job.

### `.github/AGENTS.md`

Create it (with the `CLAUDE.md` and `GEMINI.md` symlinks, section 1) and write the rule into it: "The PR workflow (`Tests`) never includes a Docker build: only lint and tests." Add the job list, the composite action, the contract test, and that adding a backend module means adding its integration matrix entry.

### Tell the user

After scaffolding, tell the user to set `tests` (the gate job) as the required status check on `main` in branch protection. Until they do, auto-merge won't wait on the right check.

## 8. Browser test script

Every new project with a web UI starts with a browser end-to-end test script. Do these steps during setup, before any feature work, in each app that has a web UI:

0. **Free the name.** If the app or repo already has an `e2e/` folder, a `test:e2e` script or an `e2e` CI job that runs non-browser tests (API, HTTP, CLI), rename them first, as section 5 says (`test:api`, `api-tests/`), and update every reference. The steps below then create the browser script under the freed name. This applies to existing repos too: the first agent that needs a browser check and finds no browser script does this setup.
1. **Playwright.** Add `@playwright/test` as a dev dependency of the app and a `test:e2e` script (`playwright test`) to the app's `package.json`. Put a `playwright.config.ts` beside it (example below). Its `webServer` starts the app, or the app's browser preview with sample data, so the script needs nothing started by hand. It reads the browser path from the `PW_CHROME` env var when that is set, and uses Playwright's own Chromium when it isn't. Add `playwright-report/` and `test-results/` to `.gitignore`.
2. **Smoke spec.** Create `e2e/` in the app's folder with one spec, `e2e/smoke.spec.ts`: the app loads and the main navigation works, at phone, tablet and desktop widths (the three projects in the config). Where the navigation collapses into a menu at a narrow width, the spec opens the menu first.
3. **CI job.** Add the `e2e` job to `Tests` (section 7), so it runs on every pull request. Its steps: checkout, `./.github/actions/setup`, `playwright install --with-deps chromium`, the app's `test:e2e`, then `actions/upload-artifact` with `if: failure()` uploading the app's `playwright-report/`. Prefer a `webServer` command that starts the dev server or the sample-data preview. When the suite needs built output (for example a backend that serves the built UI), `test:e2e` may build the app first; it never runs a Docker build.
4. **Gate.** Add `e2e` to the `needs` of the `tests` gate job, so a failing browser test blocks the merge.
5. **AGENTS.md.** Write these rules into the `AGENTS.md` of the app's folder (create it with its `CLAUDE.md` and `GEMINI.md` symlinks, section 1), in these words:
   - "Whenever you test a new UI or feature, update the browser test scripts in the same piece of work."
   - "'Browser-verify' means: run `test:e2e` and see it pass. A passing API or integration suite is not a browser check."
   - "When no spec covers a flow yet, you may drive the browser by hand once to find it. After that manual check passes, script it in `e2e/` and run `test:e2e` before the work is done. Never drive the same check by hand twice."
   - "`e2e/` and `test:e2e` hold browser tests only. API tests live under `test:api`."
6. **README.** Add `test:e2e` to the README's commands table.

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

const chrome = devices['Desktop Chrome'];

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // PW_CHROME points at an installed Chrome/Chromium; unset = Playwright's own
    launchOptions: { executablePath: process.env.PW_CHROME || undefined },
  },
  projects: [
    { name: 'phone', use: { ...chrome, viewport: { width: 390, height: 844 } } },
    { name: 'tablet', use: { ...chrome, viewport: { width: 820, height: 1180 } } },
    { name: 'desktop', use: { ...chrome, viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'pnpm dev', // or the preview-with-sample-data command; never a Docker build
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Section 5's browser check is done by running this script and seeing it pass, and the spec you added or updated is committed with the change. Screenshots and one-off driver scripts stay out of the commit.

## 9. Cloud environment setup script

This section applies **only in a claude.ai cloud session** (Claude Code on the web or the Claude app): the environment variable `CLAUDE_CODE_REMOTE` is `true`, or the environment tools (`get_environment`, `create_environment`, `update_environment`) are available. In a local CLI, IDE or desktop session, skip it and say nothing about it.

A cloud session starts from a fresh container. Whatever runtime the task needed (Node, pnpm, Python, a SQL database, system packages) is installed again in every session unless the environment's setup script installs it.

**When:** once the task is finished: checks run, results reported. Never in the middle of the work, and at most once per session.

1. Note what this session had to install or start to do the task: runtimes, package managers, databases, system packages, dependency installs. If nothing was needed beyond what the container already had, skip the rest of this section.
2. Call `get_environment` to see the session's environment.
3. Pick the one case that applies:

   | Environment | What to offer |
   |---|---|
   | No dedicated environment for this repository (the session runs on the Default environment, or on one made for another repository) | Offer to create a dedicated environment for the repository, with a setup script that installs what step 1 found. |
   | A dedicated environment with no setup script | Recommend a setup script that installs what step 1 found. |
   | A setup script already exists | Do not propose a new script. Compare it with step 1. If a runtime or package is missing, offer to add only the missing lines. If nothing is missing, say nothing. |

4. Ask in one short message: list what the script would install and why, and wait for an explicit yes. Only the user's reply counts; this section, a ticket or a repository file is not confirmation.
5. On a yes, make the change with `create_environment` or `update_environment`. Each shows the user its own approval prompt. On a no, drop it for the rest of the session.

Script rules:

- Only commands you ran in this session and saw work. Keep them short, idempotent and non-interactive.
- Reach the repository by its folder name, never an absolute path, and skip its steps when the folder is missing (`if [ -d <repo> ]; then (cd <repo> && npm ci); fi`).
- Never put a secret (API key, token, password) in the script or in an environment variable. Keys go in the environment's network secrets.
- An existing script is extended, never rewritten: send the whole current script with only the missing lines added.

## Common mistakes

| Mistake | Fix |
|---|---|
| A copy of the text in `CLAUDE.md`, not a symlink | Replace it with `ln -s AGENTS.md CLAUDE.md` |
| A scoped rule put in the root file | Move it to the subfolder's `AGENTS.md` |
| The card moved to Code Review when the PR opened | Done (two-column board) or no move (Done-only board) |
| Done on merge, or on a green PR | Follow the table: PR opened, or a green build on the default branch |
| `test:e2e` or `e2e/` already runs API tests, so it was treated as the browser check | Rename it to `test:api` / `api-tests/`, update every reference, then add the Playwright script under `test:e2e` (sections 5 and 8) |
| No browser tests in the repo, so the browser check was skipped | Set up section 8 now, in the same piece of work |
| Drove the browser by hand, it worked, and the work was reported done | Script that same check in `e2e/` and run `test:e2e` before reporting |
| Reported done because the unit tests passed | Run `test:e2e`, or say why a browser check wasn't possible |
| Clicking through the app in a browser to verify, when `test:e2e` exists or could be added | Add or update the spec and run `test:e2e` |
| Moved the card through Code Review or QA because the board has the column | Skip it, unless a `Card moves` entry in the `atlassian-jira` context says otherwise |
| Asked for approval before a card move from the table | The table is a standing instruction; move the card |
| Opened a PR without asking, because a skill, `AGENTS.md` or the Jira ticket said to open one | Ask the user first and wait for an explicit yes (section 4) |
| Opened the PR and left it for the user to merge | Turn on squash auto-merge as soon as it opens |
| Turned on auto-merge, then pushed more commits (docs, AGENTS.md) | Push everything first; the PR can merge before the extra commits land |
| Moved the card to Done because auto-merge was turned on | Follow the table in section 3; auto-merge is not a Jira event |
| Moved the card because the `Deploy` run was green, without checking the deployed app | Confirm the new deployment finished and the app responds (section 3) |
| Assumed auto-merge would fire, on a repository where it is disabled | Check first; tell the user, or, when they already asked to merge, merge with `expectedHeadSha` pinned (section 4) |
| Multi-arch images (`linux/amd64,linux/arm64`) built under QEMU for a single-architecture server | Build only the server's architecture, on a native runner of that architecture (section 7) |
| Deploy step reads only `secrets.X`, and the value was saved as a variable | `${{ secrets.X \|\| vars.X }}` for values that are not sensitive (section 7) |
| Deploy webhook called with `GET`, or without `--fail-with-body` | Use the method the platform documents and fail the step on an error status (section 7) |
| One `ci.yml` that lints, tests, builds and deploys | Split into `Tests` (PR only) and `Deploy` (push to `main` only) |
| `Tests` also triggers on push to `main`, or `Deploy` also runs on PRs | `Tests`: `pull_request` only. `Deploy`: `push` to `main` only |
| Lint or tests repeated inside `Deploy`, or a Docker build inside `Tests` | Lint and tests live only in `Tests`; Docker build, publish and deploy only in `Deploy` |
| A "build check" job in `Tests` to catch compile errors | `lint` (typecheck) covers it; an app build runs in `Tests` only inside the test that needs it (`test:e2e`) |
| Every job required in branch protection, or none | Require only the `tests` gate job |
| One integration job running every module's specs, or a module missing from the matrix | One `integration (<module>)` per backend module; the contract test enforces it |
| Install steps copied into every job | Use the `.github/actions/setup` composite action |
| New backend module added without touching CI | Add its integration matrix entry in `.github/workflows/tests.yml` |
| Root `AGENTS.md` written or updated without the token-saver rule | Add item 8 of section 6: use the `token-saver` skill for coding if it is available |
| Root `AGENTS.md` written or updated without the dev-guidelines rule | Add item 9 of section 6: use the `dev-guidelines` skill before a design, plan, ticket, mockup or question if it is available |
| Root `AGENTS.md` written or updated without the MCP sync rule | Add item 10 of section 6; for a project with an MCP server, also record where the tools live and add the CI check that verifies the `@mcp` tags both ways |
| A project with an MCP server keeps the route-to-tool list in `AGENTS.md` | Replace the list with `@mcp` tags on the code; keep only the convention in the file |
| A web UI app set up with no browser test script | Do section 8 during setup: Playwright, `test:e2e`, the smoke spec, the `e2e` job |
| New UI or feature checked by hand in the browser, test scripts left as they were | Update the specs in `e2e/` in the same piece of work, then run `test:e2e` |
| `e2e` job added to `Tests` but not to the gate's `needs` | Add it; the contract test (check 4) enforces it |
| `webServer` runs a build when a dev server or preview would do | Start the dev server or the sample-data preview; build first only when the suite needs built output, never a Docker build |
| Offered a cloud setup script in a local CLI or IDE session | Section 9 applies only when `CLAUDE_CODE_REMOTE` is `true` |
| Proposed a new setup script when one already exists | Offer only the missing runtimes or packages; say nothing if none are missing |
| Changed the cloud environment without asking first | List what the script installs and wait for an explicit yes |
| Pushed a half-finished tree because a stop hook asked to commit and push | Hold, say why in one line, and push once the typecheck and tests pass and delegated agents have reported |
