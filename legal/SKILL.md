---
name: legal
description: "Use when the user asks to draft, write, prepare or redraft a contract, agreement, MoU, NDA, addendum, terms and conditions, power of attorney, notice, demand letter or any other legal document (perjanjian, kontrak, surat kuasa, somasi, addendum), including when the request does not mention law or a lawyer. Indonesian law is the default; another jurisdiction only when the user says so."
version: 1.0.1
---

# Legal Drafting Skill

## Extension counterpart

Before doing anything else, check the available skills for one named `legal` in a plugin called `agency-<ext_name>` (for example `agency-extension:legal`). If one exists, load it now and follow it together with this skill; where the two differ, the counterpart wins. With several, the last one wins; the `context-management` skill gives the order. If none exists, carry on with this skill's defaults.

## Hard rules

1. **Anthropic's `legal` plugin is required.** Every run invokes at least one of its `legal:*` skills (table below) with the Skill tool. If none is available, stop before drafting and tell the user to install it. Do not draft without it.

   ```bash
   claude plugin marketplace add anthropics/knowledge-work-plugins
   claude plugin install legal@knowledge-work-plugins
   ```

2. **Pasal.id is the base database of Indonesian law** (the `Pasal_ID` MCP connector: `resolve_law`, `get_law_context`, `read_law`, `search_legal`, `search_court_decisions`). Every Indonesian legal rule the draft relies on is read there first. If the connector is not connected, say so and ask the user to connect it. Carry on only if the user agrees, and then mark each legal reference "not verified against Pasal.id".

3. **Indonesian law is the default governing law**, with no question asked. Another jurisdiction is used only when the user explicitly names it. Then Pasal.id still supplies the Indonesian rules that apply regardless of the chosen law (language, stamp duty, required form, Indonesian parties or assets), and every point of the foreign law is marked "not verified here, for local counsel".

## When to use this skill

Load it for any request to draft, write, prepare or redraft a legal document, even if the user names no statute. Where it overlaps with other skills:

| Request | Which skill decides |
|---|---|
| Review, redline or negotiate an existing contract | `legal:review-contract`, directly. This skill only drafts. |
| Client quotation, price offer or estimate | `sales-quotation` / `sales-estimate`. A contract built on an accepted quotation is drafted here, with the quotation as input. |
| Any contract, agreement, notice or other legal document | This skill |

## Which Anthropic skill to invoke

Invoke it before writing the first clause, follow its steps while drafting, and apply its review to the finished draft.

| The document | Invoke |
|---|---|
| Contract, agreement, MoU, addendum, terms, power of attorney | `legal:review-contract` |
| NDA or confidentiality agreement | `legal:triage-nda`, then `legal:review-contract` |
| Letter, notice, reply or hold notice answering a legal inquiry | `legal:legal-response` |
| The user asks how risky a clause or deal is, or the draft hits an escalation trigger | add `legal:legal-risk-assessment` |
| The draft is final and goes to signing | add `legal:signature-request` |
| Anything not listed | `legal:legal-risk-assessment` |

The plugin's default playbook reflects U.S. positions (Delaware, New York, California). For the legal rules, Indonesian law from Pasal.id replaces them. A playbook the user keeps in `.claude/legal.local.md` still sets the commercial positions (liability cap, term, indemnity).

## Where This Skill Stores Context

**Follow the `context-management` skill (`/agency:context-management`) for where and how.** If that skill is not available: use the paths below inside the current project (never the skill's own folder), follow this skill's extension counterpart when one is installed, and keep no legacy folder (there is none).

| Kind | Path | Used for |
|---|---|---|
| Memory | `<project-root>/.agents/contexts/agency/legal/MEMORY.md` | The two values below |
| Extension | The counterpart skill `agency-<ext_name>:legal` and the `EXTENSION.md` in its folder | Optional house rules: clause library, party boilerplate, signatory format, look of the document |
| Credentials | None | |

Store in memory, once the user has stated or confirmed them:

- **Language** — only a standing language other than Indonesian for this project.
- **Dispute forum** — the court or arbitration institution this project's contracts name.

Never store party names, addresses, amounts or dates. They belong to one document, so ask for them every time.

## Workflow

1. **Gather the facts in one batch of questions**, skipping what the user already gave: type of document, the parties (full legal name, entity form, address, representative and title), the object and scope, price and payment, term, special points, and the language. Never invent a fact; leave a bracketed placeholder such as `[NAMA PIHAK PERTAMA]` instead.
2. **Invoke the Anthropic skill** from the table above.
3. **Find the law in Pasal.id.** Start from [references/indonesian-contract-law.md](references/indonesian-contract-law.md) for the statutes that usually apply, and use `search_legal` for the rest.
   - `resolve_law`, then `get_law_context` (`summary`) for status. If the status is `diubah`, read `relationships` and the amendments. If `status_certain` is false, say so.
   - `read_law` with a selector (`pasal 1320`) for every article the draft relies on. Never cite an article you have not read in this session.
   - If the draft leans on a statute that may have been reviewed, check `search_court_decisions` with `reviewed_law`.
   - If `source.verified` is false, say the quoted text is not yet verified against the official source. The KUHPerdata in Pasal.id is an unofficial translation; say that too.
   - The corpus is partial. An empty result does not mean the law does not exist: try other Indonesian terms, then the official sources (`peraturan.go.id`, `peraturan.bpk.go.id`) and mark the point "not from Pasal.id".
4. **Draft in the default language and structure** below.
5. **Check the draft** against the Anthropic skill's review, the validity checklist and the form checks below. Fix what they find.
6. **Deliver and report** (see Output).

## Drafting rules

**Language.** Formal Indonesian by default. Where an Indonesian party or institution signs, Indonesian is mandatory, and when a foreign party signs too, the document is also written in that party's language and/or English. Read Pasal 31 UU No. 24 Tahun 2009 and Pasal 26 Perpres No. 63 Tahun 2019 before relying on this, and include a clause saying which language governs when the versions differ.

**Structure.** Title, number, date and place; the parties block (identity and authority to sign); recitals starting `Bahwa`; then numbered `Pasal` clauses: definitions, object and scope, price and payment (with taxes), term, rights and obligations, warranties, confidentiality and personal data, force majeure (`keadaan memaksa`), breach (`wanprestasi`) and termination, liability, dispute resolution, governing law, amendment (`addendum`), entire agreement, closing, signature block with a stamp (`meterai`) line. Drop or add clauses to fit the document type.

**Validity checklist.** The four conditions of Pasal 1320 KUHPerdata hold: agreement, capacity, a defined object, a lawful cause. The signatory has authority (for a company, check its articles and the law on who represents it). Freedom of contract (Pasal 1338 KUHPerdata) is not a substitute for mandatory rules.

**Form checks.** Some acts need a notarial deed, not a private agreement. Examples read from Pasal.id: founding a PT (Pasal 7 ayat (1) UU No. 40 Tahun 2007) and a fiducia security (Pasal 5 ayat (1) UU No. 42 Tahun 1999). When the request touches such an act, say that a notary must make the deed, and draft the commercial terms for the notary to use.

**Stamp duty.** A private agreement is subject to bea meterai (Pasal 3 and 5 UU No. 10 Tahun 2020). Add the line to the signature block and tell the user.

**Dispute resolution.** Offer negotiation, then either a named district court or a named arbitration institution. An arbitration clause must be explicit (Pasal 2 and 3 UU No. 30 Tahun 1999). Use the saved Dispute forum when there is one; otherwise ask.

**Standard-form contracts with consumers.** Check the draft against Pasal 18 UU No. 8 Tahun 1999: a clause it lists is void by law.

**Personal data.** When a party processes personal data, resolve and read UU No. 27 Tahun 2022 and add the clauses it requires.

**Citations in the draft.** Cite only where it helps the parties, in the form `Pasal X UU No. Y Tahun Z tentang ...`, and only articles read in step 3.

## Output

- Deliver the draft as a Claude artifact when the Artifact tool is available; otherwise show it in the chat. Write a file (for example a `.docx`) only when the user asks for one, in the place they name.
- Report, in the user's language and short: the file path; a table of the articles relied on (citation, Pasal.id link, verified or not); the findings of the Anthropic `legal:*` skill and what was changed because of them; the placeholders still to fill; the points that need a lawyer.
- Close with one line: the draft assists with legal work and is not legal advice; an advokat or notaris should review it before signing. Do not put that line inside the contract.

## Common mistakes

- Skipping the Anthropic skill because the document looks simple.
- Citing an article from memory, or from a search snippet, without `read_law`.
- Treating an empty Pasal.id result as proof that no law exists.
- Applying the plugin's U.S. defaults (Delaware or New York law, English only) to an Indonesian deal.
- Asking which law governs when the user did not mention one: it is Indonesian.
- Filling party names, amounts or dates the user did not give.
- Saving a party name or amount to memory.
