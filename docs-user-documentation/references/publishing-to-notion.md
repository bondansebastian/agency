# Writing to Notion

Reference for publishing or updating a user guide or a video manual page in Notion instead of (or in addition to) a local file.

## One Notion Integration Per Task

Every Notion operation in one task — reading an existing page, creating a new one, updating content, listing pages to find a target — goes through a single integration. Mixing integrations against the same Notion workspace risks inconsistent page IDs, formatting quirks, or a narrower auth scope on one path than the other producing a broken or partial write.

Pick the integration in this order, before writing anything:

1. **The one the extension names** (see the `context-management` skill), when there is an extension and it names one.
2. **`notion-cli`** (the `ntn` command), when it runs and is signed in (it uses `NOTION_API_TOKEN` if set, otherwise `ntn login`).
3. **A connected Notion connector** (its `notion-*` tools), when one is available in the session.
4. **None available** — offer to install `notion-cli` with `curl -fsSL https://ntn.dev | bash` (and its skill with `npx skills add https://github.com/makenotion/skills.git --skill notion-cli`). If the user declines, stop and ask how they'd like the guide published instead.

Say which integration you used in the report.

## Core Rule: Never Assume the Target Page

Before creating or updating any Notion page for a user guide:

1. **Check `MEMORY.md`** at `<project-root>/.agents/contexts/agency/docs-user-documentation/MEMORY.md` (see the storage section in `SKILL.md`) for a matching entry — one that names the guide, feature, or product area you're about to write about.
2. **If a matching entry exists**, use the page/URL it records as the write target. Confirm with the user only if the request is ambiguous about which guide this is.
3. **If no matching entry exists**, do not guess a page, workspace, or parent based on naming similarity, recent activity, or search results. Stop and ask the user explicitly which Notion page (or parent page, for a new page) to write to.

## After the User Answers

Once the user tells you which Notion page to use, ask whether they'd like it remembered for next time:

> "Want me to remember this Notion page in MEMORY.md for future [guide/feature name] updates?"

- If yes, append an entry to `MEMORY.md` at that path (create the file if it doesn't exist) recording what the page is for and its page/URL.
- If no, proceed with the write without saving anything.

## Default Page Structure

Once the target project's Notion location is known (via the Core Rule above), organize the guide content using this default structure:

1. **Project page** — the page representing the project itself.
2. **"User Manual" page** — a page directly under the project page (create it if it doesn't already exist).
3. **Module pages** — for each module being documented, create a sub-page under "User Manual".

Apply this default only if neither the extension nor `MEMORY.md` records a different structure for this project — an extension's structure wins, then a `MEMORY.md` structure entry.

## A Manual Page With a Video

When the output includes a video, the guide page has this order (about 500 words at most; split into sub-pages if longer). Headings are in the guide's language; an extension may give the exact headings.

1. Two or three sentences: what the feature does for the user.
2. The video, then a short callout that the data in it is sample data.
3. The steps at a glance, as a numbered list.
4. One section per step: numbered actions with exact button labels in bold, then one sentence on what happens.
5. Other cases: bullets, one per alternative path.
6. A small table of statuses, only when the feature has statuses.
7. Tips: three to five bullets.

Never put a title at the top of the content (it is the page title), keep the step text in line with the video, and never delete an existing page — add a "superseded by" note instead.

Uploading the mp4 with a Notion connector:

1. `notion-create-file-upload` with `filename` = the mp4 name and `content_type` = `video/mp4` (single-part limit 20 MiB).
2. `POST` the file to the returned `upload_url` as `multipart/form-data` (field `file`) with the returned headers. The response status must be `uploaded`.
3. Put `<video source="file-upload://<file_upload_id>">caption</video>` on the page with `notion-create-pages` or `notion-update-page`. To replace an old video, upload the new file and replace the old `<video ...>` block.
4. `notion-fetch` the page and confirm the video block is there.

With `notion-cli`, use its file upload command (`ntn --help`) and confirm the same way.

## When the User Requests a Different Structure

If the user asks for a structure that differs from the default (e.g., flat pages, a different hierarchy, module docs as sections instead of sub-pages), follow their requested structure for this write. Then ask:

> "Want me to remember this structure in MEMORY.md so future guides for [project name] use it automatically instead of the default?"

- If yes, append a structure entry to `MEMORY.md` at that path.
- If no, use the requested structure for this write only — don't save anything.

## MEMORY.md Entry Format

Keep entries short and matchable by guide/feature name. Use two entry kinds:

**Target page** (which Notion page/parent to write to):
```markdown
- **<Guide or feature name>** — <Notion page title> — <page URL or ID>
```

**Structure override** (a non-default page hierarchy for a project):
```markdown
- **<Project name> structure** — <description of the hierarchy, e.g. "flat: one page per module directly under the project page, no 'User Manual' page">
```

## Quick Reference

| Situation | Action |
|---|---|
| Any Notion read or write | One integration for the whole task: the extension's choice, else `notion-cli` (`ntn`), else a connected Notion connector |
| No Notion integration available | Offer to install `notion-cli`; if declined, ask how the guide should be published |
| `MEMORY.md` has a matching target-page entry | Use it as the target; no need to ask |
| `MEMORY.md` doesn't exist yet | Treat as no entries — ask before writing |
| No matching entry for this guide | Ask the user explicitly which page to use — never assume |
| User names a page for a new/unmatched guide | After writing, ask if they want it saved to `MEMORY.md` |
| User declines to save | Write to the page as instructed, skip `MEMORY.md` |
| No structure override in `MEMORY.md` | Use the default structure: project page → "User Manual" page → one sub-page per module |
| `MEMORY.md` has a structure override for this project | Use the recorded structure instead of the default — it always wins |
| User requests a structure different from the default | Follow their request for this write, then offer to save it to `MEMORY.md` |
