---
name: ng-scaffold
description: >
  Scaffold a new Angular 18 standalone artifact (component, service, guard,
  interceptor, pipe, directive) inside the correct folder for this repo's
  layering rules. Use when user says "new component", "scaffold X", "ng
  generate", or invokes /ng-scaffold. Auto-relocates the CLI output into
  features/<feature>/components|services or data-access/<x> as appropriate,
  wires a co-located *.spec.ts stub, and reminds about LanguageService keys
  when the artifact has user-facing labels.
---

# ng-scaffold

Generate Angular artifacts in the layout this repo actually uses (not the stale `modules/*` path in `.augment/rules/project_rules.md`).

## Inputs

Ask the user (or infer from request) for:

1. **Kind** — one of: `component`, `service`, `guard`, `interceptor`, `pipe`, `directive`, `store`.
2. **Layer** — pick by kind:
   - UI component → `features/<feature>/components`
   - Feature service (state, presenter) → `features/<feature>/services`
   - HTTP / Supabase access → `data-access/<entity>`
   - Pure TS calculations → `domain/<entity>`
   - Cross-cutting service / component used in 2+ features → `shared/...`
   - Layout / guard / interceptor / route constant → `core/...`
3. **Name** — kebab-case (e.g. `invoice-summary`).
4. **Feature** — when layer requires it.

If a guard or interceptor is requested, default to `core/guards` or `core/interceptors` and remind the user to register it in `src/app/app.config.ts` (`withInterceptors([...])`).

## Steps

1. Run the matching CLI command, always with the `app` prefix already configured in `angular.json`:
   - Component: `npx ng generate component <target>/<name> --standalone --style=scss --skip-tests=false`
   - Service: `npx ng generate service <target>/<name> --skip-tests=false`
   - Guard (functional): `npx ng generate guard <target>/<name> --functional --skip-tests=false`
   - Interceptor (functional): `npx ng generate interceptor <target>/<name> --functional --skip-tests=false`
   - Pipe / Directive: `npx ng generate pipe|directive <target>/<name> --standalone --skip-tests=false`
2. If the CLI dropped the files in the wrong path (older CLI templates default to `src/app/<name>`), move them to the chosen layer with `git mv`.
3. For new feature UIs, add the route lazily in `src/app/app.routes.ts` (child of the layout route, with `loadComponent`, dashed path, meaningful `title`) and update `APP_ROUTES` in `src/app/core/constants/app-routes.ts`. If sidebar-visible, also update `MENU_ITEMS` in `src/app/core/constants/routes.ts`.
4. For new critical files (auth, payments, routing, request-signing, config, telemetry, DI/bootstrap, entrypoints), prepend the standard header block: **Responsibilities / Dependencies / Side Effects / Invariants** — match the shape in `src/app/core/interceptors/auth.interceptor.ts`.
5. For components with user-facing labels, list the i18n keys that need to be added to `public/assets/i18n/en.json` + `es.json` and offer to invoke `i18n-add`.
6. Run `npm test -- --findRelatedTests <new-spec-path>` to confirm the generated spec compiles. Do not run the whole test suite.

## What not to do

- Never create files under `src/app/modules/` — that path is stale.
- Never import `TranslateService` in the new component; use `LanguageService` from `src/app/shared/services/language/language.service.ts`.
- Never add a new global state library or a non-PrimeNG UI library.
- Never edit `app.config.ts` to add per-feature providers; feature stores use `providedIn: 'root'` or are provided on the route.

## Output

End with a one-line summary: `Generated <name> at <path>. Spec stub written. <next step>.`
