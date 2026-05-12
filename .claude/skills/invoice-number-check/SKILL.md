---
name: invoice-number-check
description: >
  Validate that invoice numbers across the codebase follow the canonical
  EON-YY-LXXX format (fixed prefix EON, 2-digit year, category letter,
  3-digit zero-padded sequence). Greps for invoice number literals,
  regexes, and database constraints; flags drift between TypeScript
  validators, Supabase migrations, and test fixtures. Use when user says
  "check invoice format", "validate invoice numbers", or invokes
  /invoice-number-check. Auto-trigger when editing invoice generation,
  invoice import, or invoice schema files.
---

# invoice-number-check

Canonical format from `supabase/README.md`: `EON-YY-LXXX`
- `EON` — fixed prefix
- `YY` — two-digit year (e.g. `25` for 2025)
- `L` — single category letter (currently `L` for "Legal" — extensible)
- `XXX` — zero-padded sequence starting at `001`

Regex (single category): `^EON-\d{2}-L\d{3}$`
Regex (any category letter): `^EON-\d{2}-[A-Z]\d{3}$`

## Steps

1. Search for every place the format is encoded:
   ```bash
   rg -n "EON-\d{2}|invoice_number|invoiceNumber" src supabase
   rg -n "EON-?[YL0-9X-]+" src supabase
   ```
2. Categorize hits:
   - **TypeScript validators / format helpers** under `src/app/shared/validators` and `src/app/domain/invoices`.
   - **Supabase column definitions / CHECK constraints** under `supabase/migrations`.
   - **Test fixtures** in `*.spec.ts` files — these must use a valid example like `EON-25-L001`.
   - **Hard-coded UI strings** — usually a bug; should be derived from data.
3. For each hit, verify the format matches the canonical regex. Flag:
   - Wrong prefix (`EOM-`, `eon-`, missing dashes).
   - Wrong year width (4 digits instead of 2, missing leading zero).
   - Missing or wrong category letter.
   - Sequence not zero-padded to 3 digits (`EON-25-L1` is invalid).
   - Lowercase letters.
4. Cross-check that the Supabase column (`invoice_number VARCHAR`) has either a CHECK constraint enforcing the regex or a documented reason it doesn't. If a constraint is missing, suggest a new migration and offer to invoke `supabase-migration`.
5. Cross-check that the client-side validator and the server-side constraint agree. If only one exists, that's a gap.

## Report shape

```
Invoice number format audit:

✅ Matches canonical EON-YY-LXXX:
  - src/app/domain/invoices/<file>.ts:<line>
  - supabase/migrations/00N_*.sql:<line>

⚠️  Drift / issues:
  - <path>:<line> — <what's wrong> — <suggested fix>

🧪 Test fixtures:
  - <count> valid, <count> invalid

🔒 Server constraint: <present | missing>
🛡️ Client validator: <present at <path> | missing>
```

## What not to do

- Never silently rewrite an invalid number — surface it, let the user decide whether it's a bug or an intentional special case (e.g. historical data).
- Never broaden the regex to "accept what the data has" without user confirmation — the format is a contract.
- Never edit migrations to add a constraint; always create a new migration via `supabase-migration`.

## Output

One-line summary at top: `Audited <N> hits across <M> files. Issues: <count>. Server constraint: <present|missing>.`
