---
name: dev-init-project
description: "Use when setting up a new or existing repository for coding agents (Claude Code, Gemini CLI, Codex), when a repo has no AGENTS.md or has a CLAUDE.md or GEMINI.md with real content, when the user asks to \"write to agents.md\", when creating GitHub Actions workflows, before moving a Jira card for work done in a repo, before reporting a change as done, or when opening or merging a PR."
version: 1.2.1
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
- If that run fails, leave the card where it is and tell the user.
- Put the ticket key in commit messages and the PR title.
- This table wins over the `atlassian-jira` skill's general rules: these moves need no approval, and no in-between status is used. A project that does need one (a stop in "Code Review" or "QA", or a workflow that refuses the direct move) records it as a `Card moves` entry in the `atlassian-jira` skill's context, following the `context-management` skill (`<project-root>/.agents/contexts/agency/atlassian-jira/MEMORY.md`, or an extension). Only such an entry changes the table; never add an in-between move on your own.

## 4. Merging the PR

- As soon as the PR is open, turn on auto-merge with the squash method (GitHub `enable_pr_auto_merge` with `SQUASH`).
- Push everything the PR needs before turning it on, including docs and `AGENTS.md` changes. The merge fires as soon as the required checks pass, and on most repos a merge to the default branch deploys.
- If GitHub refuses because the PR is already mergeable (CI already green, "clean status"), squash-merge it directly instead.
- If the repo has auto-merge disabled, tell the user and leave the PR open. Don't merge by hand without asking.
- Turning on auto-merge is not a Jira event. Card moves still follow section 3: on a two-column board the card goes to Done when the PR opens; on a Done-only board it goes to Done only after the build on the merge commit is green.
- After the merge, check the build run on the merge commit, as section 3 requires.

## 5. Browser verification

Every change (feature, bug fix, refactor, dependency or config change) is browser-verified before you report it as done or open the PR. This applies wherever a user can see or reach the result: UI pages, HTTP endpoints, and server behaviour that shows up in a UI. Passing unit tests and a clean typecheck don't count as this check.

**"Browser-verify" means: run the app's `test:e2e` script and see it pass.** This is the `token-saver` skill's rule and it wins here: do not open a browser, click through pages or read screenshots to verify, because that is one of the most expensive ways to check a change.

1. Add or update the spec in the app's `e2e/` folder for the flow the change touches, including the case it must leave alone (for example a row that must not appear).
2. Run `test:e2e` with its output filtered to the failures. A failing spec is a failed check.
3. Commit the spec with the change.
4. In the report and the PR description, name `test:e2e` as the command and say which spec covers the change.

If the app has a web UI and no `test:e2e` script, set one up first (section 8), then verify with it. The only time you look at a page yourself is a new UI that has no test script yet: look at it in the browser once, then add its script before the work is done.

If a browser check isn't possible (no visible effect, CI-only change, a desktop app on a platform you can't run), say so explicitly and say what you verified instead. Never imply a browser check you didn't run.

## 6. Root AGENTS.md must record

1. The symlink rule (section 1) and the placement rule (section 2).
2. The Jira site, project key, the row from section 3 that applies, and the workflow or job that counts as "the build" (`Deploy`, per section 7).
3. The repo's check, test and build commands.
4. The browser verification rule (section 5), with this repo's recipe: the build and start commands, the env vars and test login, and any fake clients or seed data a page needs before it shows anything.
5. The merge rule (section 4): squash auto-merge as soon as the PR opens, push everything first, squash-merge directly if it's already mergeable.
6. The workflow rule (section 7): two workflows, `Tests` on PRs and `Deploy` on merge to `main`.
7. A new-module checklist that includes: "add the module's integration matrix entry in .github/workflows/tests.yml".
8. The token-saver rule, always, in these words: "Before any coding task (feature, bug fix, refactor, tests, migration, review), invoke the `token-saver` skill if it is available. If it isn't available, carry on without it." If the root `AGENTS.md` already exists and lacks this rule, add it.

Without these, the next agent on this repo falls back to its own defaults.

## 7. GitHub workflows

When you create GitHub Actions workflows, create exactly these two in `.github/workflows/`:

| File and `name:` | Trigger | Contains |
|---|---|---|
| `tests.yml`, `Tests` | `pull_request` only | Lint and tests only (jobs below) |
| `deploy.yml`, `Deploy` | `push` to `main` only | Build → publish → deploy |

**The PR workflow (`Tests`) never includes a build: only lint and tests.**

- No other workflow files. A new check goes into `Tests`. A new build, publish or deploy step goes into `Deploy`.
- `Tests` has no `push` trigger. `Deploy` has no `pull_request` trigger and uses `on: push: branches: [main]`.
- Lint and tests never run in `Deploy`. Build, publish and deploy never run in `Tests`.
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
- Never in this workflow: `pnpm build` / `npm run build` (or any other package-manager build), `docker build`, image publishing or registry login, a job named `build`, or a build action (`docker/build-push-action` and the like).

### `Deploy` (`.github/workflows/deploy.yml`)

- Build, publish and deploy happen here and only here, in that order.

### Shared setup

- Put the toolchain setup and dependency install in a composite action at `.github/actions/setup/action.yml`. Every `Tests` job and the `Deploy` build call it with `uses: ./.github/actions/setup`; don't repeat the install steps inline.

### Workflow contract test

Add a test (run in `unit`) that parses the workflow YAML and fails if:

1. `tests.yml` contains a build: a build/`docker build` command, a publish step, a job named `build`, or a build action.
2. Any backend integration spec file is run by zero matrix jobs, or by two or more.
3. A backend module has no `integration` matrix entry.
4. An app has a `playwright.config.ts`, but `tests.yml` has no `e2e` job that runs its `test:e2e`, or the `tests` gate doesn't list `e2e` in `needs`.

Checks 2 and 3 count backend module specs only. The Playwright specs in an app's `e2e/` folder belong to the `e2e` job.

### `.github/AGENTS.md`

Create it (with the `CLAUDE.md` and `GEMINI.md` symlinks, section 1) and write the rule into it: "The PR workflow (`Tests`) never includes a build: only lint and tests." Add the job list, the composite action, the contract test, and that adding a backend module means adding its integration matrix entry.

### Tell the user

After scaffolding, tell the user to set `tests` (the gate job) as the required status check on `main` in branch protection. Until they do, auto-merge won't wait on the right check.

## 8. Browser test script

Every new project with a web UI starts with a browser end-to-end test script. Do these steps during setup, before any feature work, in each app that has a web UI:

1. **Playwright.** Add `@playwright/test` as a dev dependency of the app and a `test:e2e` script (`playwright test`) to the app's `package.json`. Put a `playwright.config.ts` beside it (example below). Its `webServer` starts the app, or the app's browser preview with sample data, so the script needs nothing started by hand. It reads the browser path from the `PW_CHROME` env var when that is set, and uses Playwright's own Chromium when it isn't. Add `playwright-report/` and `test-results/` to `.gitignore`.
2. **Smoke spec.** Create `e2e/` in the app's folder with one spec, `e2e/smoke.spec.ts`: the app loads and the main navigation works, at phone, tablet and desktop widths (the three projects in the config). Where the navigation collapses into a menu at a narrow width, the spec opens the menu first.
3. **CI job.** Add the `e2e` job to `Tests` (section 7), so it runs on every pull request. Its steps: checkout, `./.github/actions/setup`, `playwright install --with-deps chromium`, the app's `test:e2e`, then `actions/upload-artifact` with `if: failure()` uploading the app's `playwright-report/`. The `webServer` command must start the app without a build step, because `Tests` never builds.
4. **Gate.** Add `e2e` to the `needs` of the `tests` gate job, so a failing browser test blocks the merge.
5. **AGENTS.md.** Write these rules into the `AGENTS.md` of the app's folder (create it with its `CLAUDE.md` and `GEMINI.md` symlinks, section 1), in these words:
   - "Whenever you test a new UI or feature, update the browser test scripts in the same piece of work."
   - "'Browser-verify' means: run `test:e2e` and see it pass. The only exception is a new UI with no test script yet: look at it in the browser, then add its script before the work is done."
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
    command: 'pnpm dev', // or the preview-with-sample-data command; never a build
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Section 5's browser check is done by running this script and seeing it pass, and the spec you added or updated is committed with the change. Screenshots and one-off driver scripts stay out of the commit.

## Common mistakes

| Mistake | Fix |
|---|---|
| A copy of the text in `CLAUDE.md`, not a symlink | Replace it with `ln -s AGENTS.md CLAUDE.md` |
| A scoped rule put in the root file | Move it to the subfolder's `AGENTS.md` |
| The card moved to Code Review when the PR opened | Done (two-column board) or no move (Done-only board) |
| Done on merge, or on a green PR | Follow the table: PR opened, or a green build on the default branch |
| Reported done because the unit tests passed | Run `test:e2e`, or say why a browser check wasn't possible |
| Clicking through the app in a browser to verify, when `test:e2e` exists or could be added | Add or update the spec and run `test:e2e` |
| Moved the card through Code Review or QA because the board has the column | Skip it, unless a `Card moves` entry in the `atlassian-jira` context says otherwise |
| Asked for approval before a card move from the table | The table is a standing instruction; move the card |
| Opened the PR and left it for the user to merge | Turn on squash auto-merge as soon as it opens |
| Turned on auto-merge, then pushed more commits (docs, AGENTS.md) | Push everything first; the PR can merge before the extra commits land |
| Moved the card to Done because auto-merge was turned on | Follow the table in section 3; auto-merge is not a Jira event |
| One `ci.yml` that lints, tests, builds and deploys | Split into `Tests` (PR only) and `Deploy` (push to `main` only) |
| `Tests` also triggers on push to `main`, or `Deploy` also runs on PRs | `Tests`: `pull_request` only. `Deploy`: `push` to `main` only |
| Lint or tests repeated inside `Deploy`, or a build step inside `Tests` | Lint and tests live only in `Tests`; build, publish and deploy only in `Deploy` |
| A "build check" job in `Tests` to catch compile errors | `lint` (typecheck) covers it; never build in the PR workflow |
| Every job required in branch protection, or none | Require only the `tests` gate job |
| One integration job running every module's specs, or a module missing from the matrix | One `integration (<module>)` per backend module; the contract test enforces it |
| Install steps copied into every job | Use the `.github/actions/setup` composite action |
| New backend module added without touching CI | Add its integration matrix entry in `.github/workflows/tests.yml` |
| Root `AGENTS.md` written or updated without the token-saver rule | Add item 8 of section 6: use the `token-saver` skill for coding if it is available |
| A web UI app set up with no browser test script | Do section 8 during setup: Playwright, `test:e2e`, the smoke spec, the `e2e` job |
| New UI or feature checked by hand in the browser, test scripts left as they were | Update the specs in `e2e/` in the same piece of work, then run `test:e2e` |
| `e2e` job added to `Tests` but not to the gate's `needs` | Add it; the contract test (check 4) enforces it |
| `webServer` runs a build before serving | Start the dev server or the sample-data preview; `Tests` never builds |