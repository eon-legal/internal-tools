# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Task | Command | Notes |
|------|---------|-------|
| Dev server | `npm start` | uses `src/environments/environment.ts` |
| Prod build | `npm run build` | substitutes `environment.prod.ts`; outputs `dist/internal-tools/` |
| Dev watch build | `npm run watch` | `ng build --watch --configuration development` |
| All tests | `npm test` | Jest (`jest-preset-angular`), jsdom env |
| Watch tests | `npm run test:watch` | |
| Coverage | `npm run test:coverage` | |
| Single test file | `npx jest path/to/file.spec.ts` | `testMatch: **/*.spec.ts` |
| Single test by name | `npx jest -t "test name"` | |
| Generate artifact | `npx ng generate component features/<x>/components/<name>` | default style is SCSS |

There is no lint script. `ng test` is **not** wired — use `npm test` (Jest) instead of Karma.

Deploy: `.github/workflows/deploy.yaml` is manual (`workflow_dispatch`); builds prod and FTPs `dist/internal-tools/browser/` to Hostinger using `EON_FTP_*` secrets.

## Stack

Angular 18 (standalone components only — no NgModules), `@ngrx/signals` for state, PrimeNG 18 + PrimeFlex + PrimeIcons (Aura theme), `@ngx-translate` for i18n (wrapped by `LanguageService`), `@supabase/supabase-js` for backend, Jest + `ng-mocks` for tests, PDF stack: `jspdf` + `pdf-lib` + `pdfmake` + `jszip` for batch downloads.

## Bootstrap & DI

- `src/main.ts` calls `bootstrapApplication(AppComponent, appConfig)`. No `AppModule`.
- `src/app/app.config.ts` is the single source of providers:
  - `provideRouter(routes)`, `provideAnimationsAsync()`, `provideToastr({ timeOut: 2000, preventDuplicates: true })`
  - `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]), withInterceptorsFromDi())`
  - `providePrimeNG({ theme: { preset: Aura } })` — change theme **only here**
  - `TranslateModule.forRoot` with `HttpLoaderFactory` pointing at `./assets/i18n/`
  - `APP_INITIALIZER` (`initializeTranslations`) preloads the active language **before** components render. Default `es`; saved choice in `localStorage['selectedLanguage']`; falls back to browser lang.

## Folder layout

```
src/app/
  core/             layout shell, guards, interceptors, route constants
  features/         feature UIs (auth, dashboard, invoices, clients, crud-addressee, images-to-pdf, pdf-merge)
  data-access/      HTTP + Supabase services (addressees, auth, clients, invoice-presets, invoices, rocketchat, supabase)
  domain/           framework-agnostic pure TS (dashboard, invoices calculations)
  shared/           reusable components, constants, services, validators
  store/            app-level signal store re-exports (currently InvoicesStore)
```

**Drift note:** `.augment/rules/project_rules.md` references `src/app/modules/*` but the codebase uses `src/app/features/*`. Treat `features/` as the canonical location for feature UIs.

Strict layering: components orchestrate UI only; calculations go in `domain/`; all HTTP goes through `data-access/` services injected via DI. Cross-cutting HTTP behavior (auth headers, error handling) must be an interceptor in `src/app/core/interceptors`, registered in `app.config.ts`.

## Routing

`src/app/app.routes.ts` is the only routing file. Public routes (`/login`, `/register`) use `noAuthGuard` (+ `registrationGuard` on register). All other routes are children of a layout route protected by `authGuard` and load via `loadComponent: () => import(...).then(m => m.X)`. When adding a route: dashed lower-case path, set a `title`, update `APP_ROUTES` in `core/constants/app-routes.ts`, and update `MENU_ITEMS` in `core/constants/routes.ts` if it should appear in the sidebar.

## State

Two patterns coexist:
1. **App-level singleton store** `src/app/store/app.store.ts` (`InvoicesStore`, `providedIn: 'root'`) — used by the multi-step invoice generator.
2. **Feature stores** under `features/<x>/state/*.store.ts` (e.g. `invoices-list.store.ts`) — use `withState/withComputed/withMethods` and `rxMethod` for async, follow this shape for any new store. No classic NgRx, NGXS, or Akita.

Mutate only via `patchState`. Expose only the signals/computed/methods that components actually consume.

## Auth & Supabase

- `SupabaseService` (singleton in `data-access/supabase/`) creates one `SupabaseClient` with `autoRefreshToken: true`, `persistSession: true`. Reads creds from `environment.supabase.{url,anonKey}` and throws if placeholders remain.
- Server-side: `jwt_exp = 43200` (12h). Client-side `AuthService` enforces a 24h `sessions_timebox` cap (Supabase Pro feature, replicated locally).
- `authInterceptor` attaches `Authorization: Bearer <access_token>` to every outgoing request **except** URLs containing `/auth/v1/` (handled by Supabase JS) or `/assets/` (i18n JSON, images). When changing this list, also update the constant header doc on the interceptor.
- Guards in `core/guards/auth.guard.ts`: `authGuard` (poll-waits up to 5s for `isLoading()` then redirects to `/login?returnUrl=...`), `noAuthGuard` (kicks signed-in users off `/login`+`/register`), `registrationGuard` (blocks `/register` when `AuthService.isRegistrationEnabled` is false).

Edge function: `supabase/functions/rocketchat-webhook-proxy/` (used by `data-access/rocketchat/`).

Migrations: `supabase/migrations/00{1..6}_*.sql`. Domain model: `clients` (individual|company union with constraints), `invoices` (JSONB `invoice_items`, `EON-YY-LXXX` numbering), `addressees`. See `supabase/README.md` for field-by-field schema.

## i18n

Add every user-facing string as a key in **both** `public/assets/i18n/en.json` and `public/assets/i18n/es.json` — there is no fallback at runtime. In code use `LanguageService.getText('your.key', params?)` (sync) or its observable equivalents; do not import `TranslateService` directly in components. No hard-coded labels in templates.

## Environments

`src/environments/environment.ts` (dev) and `environment.prod.ts` (prod) are swapped by Angular's `fileReplacements` at build time. `environment.interface.ts` defines the shared shape — extend it when adding env keys. `SupabaseService` logs `[SupabaseService] Connected to Supabase (DEVELOPMENT|PRODUCTION): <project-id>` on startup in dev mode.

## Testing

- Jest config: `jest.config.ts` (`preset: jest-preset-angular`, `setupFilesAfterEnv: setup-jest.ts`, env `jsdom`).
- Specs live next to source: `<file>.spec.ts`. Use `ng-mocks` for component deps; `firestore-jest-mock` and `jest-canvas-mock` are available.
- Project rules require a unit test for every logic change in components/services/directives/pipes/stores. Current coverage is ~23% (49 specs / 214 source files) — assume any logic touched without an existing spec needs one written or extended.

## Conventions

- Critical files (auth, payments, routing, request-signing, config, telemetry, DI/bootstrap, entrypoints) carry a header comment block: **Responsibilities / Dependencies / Side Effects / Invariants** (see `auth.interceptor.ts`, `supabase.service.ts` for the canonical shape). Preserve and update these when editing.
- DRY, SOLID, KISS. Minimal focused diffs, no unrelated refactors, no behavior change unless asked.
- Confirm function/class/config existence and signatures before editing (the codebase has several `*.spec.ts`-less and partially-renamed modules).
- Multi-file / cross-layer / ambiguous work: plan before editing; update plan as you learn.

## PRs

- Title prefixes: `APP-123: ...` (Trello id) or `No-Trello: ...`.
- Always add the repo owner as assignee.
- Use `@PULL_REQUEST_TEMPLATE.md` (note: template file is not currently committed under `.github/` — restore from history or coordinate with owner if missing).
- Body must include: **Risk Assessment**, **Invariants affected**, **Tests added/updated**.
- GitFlow branch names. Never commit or push without explicit user confirmation. Never `--no-verify` or force-push.
