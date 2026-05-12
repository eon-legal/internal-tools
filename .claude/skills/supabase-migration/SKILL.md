---
name: supabase-migration
description: >
  Scaffold the next sequentially-numbered Supabase SQL migration in
  supabase/migrations/, matching the existing 00N_description.sql naming
  pattern. Includes optional RLS enable + policy stub and an updated_at
  trigger template. Use when user says "new migration", "add column",
  "alter table", "supabase schema change", or invokes /supabase-migration.
---

# supabase-migration

Migrations live in `supabase/migrations/` and follow `00N_short_description.sql` (currently 001..006). This skill picks the next number, writes the file, and updates `supabase/README.md` if the change is schema-level.

## Inputs

1. **Short description** — snake_case, ≤ 5 words (becomes filename suffix).
2. **Kind** — one of: `create-table`, `alter-table`, `add-column`, `add-index`, `function`, `policy`, `data-fix`.
3. **Target table(s)** — when applicable.
4. **Needs RLS?** — yes for any new user-facing table.

## Steps

1. List `supabase/migrations/` and compute the next zero-padded number.
2. Create `supabase/migrations/<NNN>_<description>.sql` containing:
   - A header comment: purpose, ticket id (if any), rollback note.
   - The DDL/DML.
   - For new tables: `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ DEFAULT now()` columns and the standard `updated_at` trigger:
     ```sql
     CREATE TRIGGER set_updated_at
       BEFORE UPDATE ON <table>
       FOR EACH ROW EXECUTE FUNCTION moddatetime ('updated_at');
     ```
     (If `moddatetime` extension isn't enabled yet, add `CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;` at top.)
   - For RLS-required tables:
     ```sql
     ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
     CREATE POLICY "<table>_owner_all" ON <table>
       FOR ALL TO authenticated
       USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
     ```
     Adjust the predicate to the real ownership column.
3. Update `supabase/README.md` schema section when adding/removing tables or columns. Keep the existing per-table field list format.
4. Print the SQL applied + a reminder to run it via the Supabase dashboard or `supabase db push` (project does not currently ship a local `supabase` CLI workflow — confirm with user before suggesting CLI).
5. If the migration changes a column referenced by TypeScript interfaces (e.g. `src/app/features/invoices/interfaces/database-models.ts`), list the interfaces that need a matching edit. Do not edit the interfaces silently.

## What not to do

- Never edit a previously-committed migration file — always add a new one.
- Never reuse a migration number, even if a draft is uncommitted; pick the next free slot.
- Never disable RLS on an existing table without explicit user confirmation (security regression).
- Never embed plaintext secrets, API keys, or service-role JWTs in migrations.

## Output

`Migration <NNN>_<description>.sql written. RLS: <yes|no|n/a>. Interfaces to update: <list or "none">.`
