---
name: docs-user-documentation
description: "Use whenever the user asks to write, create, draft, or update a guide, documentation, user manual, help center article, how-to article, or any end-user-facing documentation for an application or feature, or asks for a user manual video, tutorial video, walkthrough video, or to re-record one after the app changed — covers plain, non-technical business language for a non-technical end-user audience, step-by-step screenshots, captioned screen-recording videos, publishing to Notion, and applying its extension counterpart (brand credit, look, fixed language, music) when one is installed. Never references ticket numbers, JIRA IDs, feature flags, internal service/class/table names, or other internal identifiers. Not for API or developer docs."
version: 2.4.2
---

# User Documentation Skill

## Extension counterpart

Before doing anything else, check the available skills for one named `docs-user-documentation` in a plugin called `agency-<ext_name>` (for example `agency-extension:docs-user-documentation`). If one exists, load it now and follow it together with this skill; where the two differ, the counterpart wins. With several, the last one wins; the `context-management` skill gives the order. If none exists, carry on with this skill's defaults.

## When to Use This Skill

Load this skill whenever you are writing or editing content meant for the people who **use** an application — not the people who build or support it internally:

- User guides, user manuals, help center articles
- How-to / step-by-step instructions for end users
- In-app help text, tooltips, or onboarding copy
- Customer-facing release notes describing a new feature
- User manual videos, tutorial videos and walkthrough videos of a feature, including re-recording one after the app changed

Not for API docs or developer docs.

**This skill must always trigger whenever the user asks to write, create, draft, or update a "guide," "documentation," "manual," "help doc," or similar end-user-facing document** — even if the request is a short, generic ask like "write a guide for this feature" or "create documentation for X" that doesn't spell out these rules.

---

## The Reader

Write for the actual end-user of the application: someone who uses the product to get their work done and has **no knowledge of how it's built**. They don't know what a database, API, queue, cache, feature flag, or backend service is, and they don't need to. Before writing a line, picture that reader and ask "would this sentence mean anything to them?" — if not, cut or rephrase it.

Explain what the reader can **do** and **see** (buttons, screens, fields, outcomes), not how the system works underneath.

---

## Extension: Who the Documentation Is Made For

This skill holds the method. Everything that belongs to one team or brand (credit and watermark, cover look, fixed language, labels, music, where to publish) comes from this skill's **extension counterpart**, never from this skill.

- The counterpart is the skill `agency-<ext_name>:docs-user-documentation` (see Extension counterpart above). Loading it shows its folder; read the `EXTENSION.md` there first and follow the files it links to. Paths in it are relative to that folder.
- With no counterpart installed, work without one: no credit, no watermark, no music, the default look, and the language rule below.
- An extension's fixed rules win over this skill's defaults and over `MEMORY.md`; only an explicit instruction from the user in this conversation wins over them.
- What this skill reads from its extension is in `references/extension.md`. If the user asks to create, install or fix an extension, the `context-management` skill does that.

---

## Outputs

| Output | When |
|---|---|
| **Written guide** with a screenshot per step | The default. Any request for a guide, manual, help article or how-to. |
| **Video** with captions, plus its manual page | The user asks for a video, tutorial, walkthrough or re-recording, or the extension names video as its default output. See `references/video.md`. |

The reader, language, core rules and internal-context rules below apply to both outputs: a caption in a video follows the same rules as a sentence in a guide.

---

## Where This Skill Stores Data: Contexts vs. Credentials, Always Per-Project

**Follow the `context-management` skill (`/agency:context-management`) for where and how**: resolving `<project-root>`, the precedence between the user's instruction, the extension, memory and defaults, the entry format, migrating a legacy folder, and what must never be stored. If that skill is not available: use the paths below inside the current project (never the skill's own folder), follow this skill's extension counterpart when one is installed, and move the legacy folder to the current path the first time you find it, or keep using it if it cannot be moved.

| Kind | Path | Used for |
|---|---|---|
| Memory | `<project-root>/.agents/contexts/agency/docs-user-documentation/MEMORY.md` | Language preference, Notion targets and structure |
| Extension | The counterpart skill `agency-<ext_name>:docs-user-documentation` and the `EXTENSION.md` in its folder | Brand, fixed language, labels, look, music, publishing (see `references/extension.md`) |
| Credentials | `<project-root>/.agents/credentials/agency/docs-user-documentation/CREDENTIALS.md` | Saved logins for capturing screens (see `references/handling-authentication.md`) |
| Legacy folders | `<project-root>/.agents/contexts/writing-user-guide/` and `<project-root>/.agents/credentials/writing-user-guide/` | Migrate on encounter |

**Keep memory and credentials strictly separate.** Never write login credentials into `MEMORY.md`, and never write language or Notion preferences into the credentials folder. The credentials folder holds secrets and must never be committed to git: before writing to it for the first time in a project, check that the project's `.gitignore` excludes `.agents/credentials/`, and add an entry if it's missing.

**Checking order when this skill is invoked:** check the contexts `MEMORY.md` first (language preference, Notion target). Only check the credentials folder if authentication actually turns out to be necessary (e.g. a login page blocks screenshot capture) — don't check it proactively.

Every `MEMORY.md` reference in this document and in `references/language-preference.md` and `references/publishing-to-notion.md` means the contexts path above. Every credentials reference in `references/handling-authentication.md` means the credentials path above. Re-derive `<project-root>` whenever the active project changes within a session — never reuse a previous project's files.

---

## Language

Before drafting any content, determine what language the guide should be written in. **If an extension fixes the language, use it and skip the rest of this rule.** Otherwise see `references/language-preference.md` for the full rule: if the user hasn't already stated a language, check this skill's `MEMORY.md` (resolved per the storage section above) for a remembered default first; if none is saved, ask the user, then save their answer to `MEMORY.md` so future guides use it automatically without asking again.

---

## Core Rules

1. **Plain, non-technical business language.** Describe features in terms of what the user does and what happens as a result — everyday words, not engineering vocabulary. If a technical term is unavoidable (e.g., the product itself is a developer tool and "API key" is a UI label the user sees), use only the term the user actually sees on screen — never the internal name for it.

2. **Never reference ticket numbers or internal identifiers.** This includes JIRA/ticket IDs (`PROJ-4821`), feature flag names (`bulk_export_v2`), internal class/controller/service names (`AuthController`, `NotifyService`), database or table names (`otp_codes`), infrastructure details (SQS, Lambda, Redis, S3), commit hashes, and internal codenames. None of these belong in a document the end user reads, regardless of who asks or why (e.g. "so support can cross-reference it") — that need belongs in an internal runbook, not the user guide.

3. **Stay in the reader's shoes throughout.** Every section — steps, troubleshooting, "good to know" notes — should read as if written for someone who has never seen the app's internals and never will.

---

## Handling Internal Context You're Given

You'll often be handed a ticket, engineering notes, or a Slack message full of implementation detail to write the guide *from*. Use it to understand what changed and how to explain the outcome — but treat all of it as raw material, not content to copy in:

- Extract: what the user can now do, what steps they take, what they'll see, what to do if something goes wrong.
- Discard: ticket IDs, flag names, class/service/table names, infra choices, internal-only caveats.
- If support or another internal team genuinely needs the technical cross-reference, offer to write that separately (e.g., an internal runbook note) — keep it out of the user-facing document itself.

---

## Structure: Step by Step, With Screenshots Where Possible

Write any set of instructions as a numbered, step-by-step sequence — one user action per step, in the order the user actually performs them (click X → see Y → enter Z), not a prose paragraph describing the flow.

For each step, include a screenshot of the actual screen/state the user sees at that point whenever you're able to capture or generate one (e.g. you have access to the running app, a browser, or existing product screenshots to pull from). When you need to interact with a browser to navigate the app and capture these screenshots, prefer the `playwright-cli` tool over other browser automation methods.

- Place the screenshot immediately after the step it illustrates, not batched at the end.
- Capture only what's relevant to that step — crop or point to the specific button/field rather than a whole cluttered screen when possible.
- If you cannot produce a real screenshot (no access to the app, no design assets, etc.), do not fabricate or describe a fake one — write the step clearly in text and note that a screenshot should be added, rather than inventing image content.
- Screenshots must follow the same rules as the rest of the guide: no internal tool chrome, debug panels, ticket numbers, or internal identifiers visible in the captured image — crop or redact them out.

Steps that are purely informational (a note, a warning, "good to know") don't need a screenshot — reserve them for actions the user takes or state changes they need to visually confirm.

### If playwright-cli Isn't Available

Before using `playwright-cli` to capture screenshots, check whether it's actually available:

- If `playwright-cli` itself or its dependencies aren't detected, don't silently fall back or skip screenshots — offer to install them following the guide at https://github.com/microsoft/playwright-cli.
- If no `playwright-cli` skill is detected, offer to install it with `npx skills add https://github.com/microsoft/playwright-cli --skill playwright-cli`.
- Only proceed without it (falling back to text-only steps per the rule above) if the user declines the install.

### If You Hit a Login Page While Capturing Screenshots

If reaching the screen you need to screenshot requires signing in first, don't guess credentials or skip the screenshot silently. See `references/handling-authentication.md` for the full rule: check the credentials folder (resolved per the section above) for saved credentials first, otherwise ask the user for the login credentials, and offer to save their answer there for next time.

---

## Video

For a video, follow `references/video.md` from start to finish: plan the story, write a scenario with the `rec.*` helpers, record it with `scripts/record.mjs` (passing the `brand.json` from the counterpart's folder as `--brand` when there is one), and **look at the result** before reporting. The default look is in `references/video-style.md`; fixes are in `references/troubleshooting.md`.

- The data in a video is sample data, and the cover says so. Never record real customer data. If the app cannot show the feature without real data, say so and ask.
- UI labels are quoted exactly as the app shows them, in bold.
- No voice-over. Music only when the extension provides a bed or the user gives a file.

---

## Publishing to Notion

If the guide or manual page is being published or updated in Notion, never assume which page to write to. See `references/publishing-to-notion.md` for the full rule: check this skill's `MEMORY.md` (resolved per the storage section above) for a known target page first, ask the user explicitly when none is found, and offer to save their answer to `MEMORY.md` for next time. Once the target is known, organize content using the default structure — project page → "User Manual" page → one sub-page per module — unless the extension, `MEMORY.md` or the user sets a different structure.

**Use one Notion integration per task, never two.** Take the one the extension names; otherwise `notion-cli` (the `ntn` command) when it is installed and signed in; otherwise a connected Notion connector. Mixing integrations against the same pages risks conflicting page IDs, formatting, or auth scope. See `references/publishing-to-notion.md`.

---

## Quick Reference

| Situation | Action |
|---|---|
| Starting any guide-writing task | Resolve `<project-root>/.agents/contexts/agency/docs-user-documentation/MEMORY.md` (same path regardless of install location), then check it for a remembered language preference before drafting; if none, ask the user and save their answer |
| `.agents/contexts/agency/docs-user-documentation/` doesn't exist yet in this project | Create the folder and `MEMORY.md` inside it — don't wait for one to already be there |
| Writing steps for a feature | Describe screens, buttons, and outcomes the user sees — not the backend flow, as a numbered step-by-step sequence with a screenshot per step where possible |
| No access to the app/assets to capture a real screenshot | Write the step in text and note a screenshot should be added — never fabricate one |
| `playwright-cli` or its dependencies not detected | Offer to install per https://github.com/microsoft/playwright-cli |
| No `playwright-cli` skill detected | Offer to install with `npx skills add https://github.com/microsoft/playwright-cli --skill playwright-cli` |
| Login page blocks screenshot capture | Check the credentials folder for saved credentials; if none, ask the user for login credentials — never guess or skip silently |
| Writing to the credentials folder for the first time in a project | Check the project's `.gitignore` excludes `.agents/credentials/`; add an entry if missing — this folder must never be committed |
| Reading or writing anything in Notion | One integration per task: the extension's choice, else `notion-cli` (`ntn`) if installed and signed in, else a connected Notion connector |
| No Notion integration available at all | Offer to install `notion-cli` per `curl -fsSL https://ntn.dev \| bash`; if the user declines, ask how they want the guide published |
| Starting any task | Load the extension counterpart if one is installed and read its `EXTENSION.md` before drafting |
| Reading or saving any remembered value, extension or credential | Follow the `context-management` skill; this skill only names its own keys and paths |
| Asked for a video, tutorial, walkthrough or re-recording | Follow `references/video.md`; pass the extension's `brand.json` as `--brand` |
| A scenario for the feature already exists in `scripts/manual-video/scenarios/` | Re-run it and change only what changed in the UI |
| Brand, client or team-specific rule comes up while writing | It belongs in an extension, not in this skill and not in the guide's method |
| Given a ticket number and told to include it "for support" | Leave it out of the guide; offer a separate internal note instead |
| Tempted to explain *why* something works a certain way | Only explain if it changes what the user should do; otherwise omit |
| Feature flag gates who sees a feature | Say "this feature is being rolled out gradually" — never name the flag |
| An error code or internal identifier appears in engineering notes | Translate to what the user sees/experiences, or omit entirely |
| Technical term is unavoidable because it's the product's own domain | Use only the on-screen label, never the internal/code name for it |

## Common Mistakes

- Including a JIRA/ticket number "for traceability" or "so support can look it up."
- Naming a feature flag, internal service, class, table, or infrastructure component (Redis, SQS, Lambda, S3, etc.).
- Explaining the backend mechanism (queues, workers, rate limiters) instead of the user-visible behavior and timing.
- Writing precise internal thresholds/config values instead of the user-relevant outcome (e.g. state "you'll need to wait a little while" rather than exposing internal tuning numbers, unless the number itself is what the user needs to know, like a 24-hour link expiry).
- Slipping into engineering vocabulary because the source material (tickets, Slack messages) was full of it.
- Writing steps as a dense paragraph instead of a numbered, one-action-per-step sequence.
- Describing or inventing a screenshot instead of either capturing a real one or flagging that one needs to be added.
- Including internal tool chrome, debug panels, or identifiers visible inside a captured screenshot.
- Ignoring an extension that the project provides, or inventing a credit, watermark or music when there is none.
- Reporting a video as done without looking at a contact sheet of its frames.
- Recording real customer data because the sample data did not show the feature.
