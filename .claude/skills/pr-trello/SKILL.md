---
name: pr-trello
description: >
  Create a GitHub pull request via gh CLI with the title format required
  by this repo (Trello id prefix like "APP-123:" or "No-Trello:") and a
  body containing the Risk Assessment / Invariants affected / Tests
  added-or-updated sections. Auto-assigns the user. Use when user says
  "open PR", "create pull request", "gh pr create", or invokes /pr-trello.
  NEVER run gh pr create without explicit user confirmation of the title
  and body draft.
---

# pr-trello

The project's PR template requires Trello id prefixing, owner-as-assignee, and a structured body. This skill assembles those without skipping any field.

## Inputs

1. **Trello id** — e.g. `APP-123`. If none, ask explicitly; use `No-Trello` prefix only when confirmed.
2. **Short title** — imperative, ≤ 70 chars after the prefix.
3. **Base branch** — default `main` unless user states otherwise. Confirm if branch tree suggests a different base.

## Steps

1. Run in parallel:
   - `git status` (no `-uall`)
   - `git diff <base>...HEAD`
   - `git log <base>..HEAD --oneline`
   - `git branch --show-current`
2. From the diff and log, draft:
   - **Summary** — 1–3 bullets, the *why* of the change.
   - **Risk Assessment** — what could break in prod. Touch any of: auth, interceptors, routes, Supabase migrations, environment files, deploy workflow → call it out explicitly.
   - **Invariants affected** — list any of: auth token attachment rules, RLS predicates, invoice number format `EON-YY-LXXX`, i18n key parity between `en.json`/`es.json`, signal store immutability, route guards.
   - **Tests added / updated** — list spec files in the diff. If a logic file changed without a matching spec, flag it and offer to invoke `spec-scaffold` first.
   - **Test plan** — checkbox list a reviewer can walk through.
3. Print the full draft (title + body) to the user. **Wait for explicit confirmation.** Do not skip this step even if the user said "open a PR" — the body content needs eyes.
4. After confirmation, push the branch if not already pushed:
   - `git push -u origin <branch>` only if upstream is unset.
5. Run:
   ```bash
   gh pr create \
     --base <base> \
     --assignee @me \
     --title "<APP-123|No-Trello>: <short title>" \
     --body "$(cat <<'EOF'
   ## Summary
   - …

   ## Risk Assessment
   - …

   ## Invariants affected
   - …

   ## Tests added / updated
   - …

   ## Test plan
   - [ ] …

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```
6. Return the PR URL.

## What not to do

- Never `git push --force` or `--no-verify`.
- Never open a PR with an empty Risk Assessment or Invariants section — at minimum write "None — <one-sentence justification>".
- Never auto-merge or auto-approve.
- Never include secrets or `environment.prod.ts` values in the body.
- Never skip the assignee flag.

## Output

`PR opened: <url>. Title: "<prefix>: <title>". Assignee: @me.`
