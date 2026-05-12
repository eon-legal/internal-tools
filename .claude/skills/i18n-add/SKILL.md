---
name: i18n-add
description: >
  Add one or more translation keys to BOTH public/assets/i18n/en.json and
  public/assets/i18n/es.json in a single edit pass, preserving JSON
  structure and sorting. Use when user says "add translation", "new i18n
  key", "translate this string", or invokes /i18n-add. Auto-trigger when
  about to commit a component that adds a hard-coded label.
---

# i18n-add

The repo has no runtime fallback between locales — a key present only in `en.json` will render the raw key string under `es`. This skill guarantees both files stay in sync.

## Inputs

For each key: `key.path` (dot-notation), `en` value, `es` value.

If the user provides only one language, ask for the other. Do not invent translations silently — if uncertain, ask the user or mark the value `"TODO: <english>"` and flag it.

## Steps

1. Read both `public/assets/i18n/en.json` and `public/assets/i18n/es.json`.
2. For each new key:
   - Walk the dot-path, creating intermediate objects only when missing.
   - Refuse to overwrite an existing leaf without explicit confirmation — duplicates usually mean a typo or duplicated feature.
   - Insert in alphabetical order at each level to keep diffs reviewable.
3. Write both files. Verify both still parse as JSON (`node -e "JSON.parse(require('fs').readFileSync(p))"` on each).
4. Print the resulting key path and both values back to the user.
5. Remind the user how to consume the key in code:
   ```ts
   this.languageService.getText('your.key');
   this.languageService.getText('your.key', { name: 'John' });
   ```
   In templates use `{{ 'your.key' | translate }}` (the `TranslateModule` pipe is already provided globally via `app.config.ts`).

## What not to do

- Never edit only one of the two files.
- Never call `TranslateService` directly in code — always go through `LanguageService`.
- Never add a third locale file without explicit user instruction (and a corresponding `LanguageService` change).
- Never reformat unrelated sections of the JSON files.

## Output

One line per key: `Added: <key.path> → en: "…" / es: "…"`.
