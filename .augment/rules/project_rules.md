---
type: "always_apply"
---

## Code Style and Conventions
- Logic change → write+run unit tests
- Smart detection for test dirs + i18n files
- Follow best practices + conventions
- DRY: minimize code duplication
- Follow Clean Code, SOLID, KISS
- Minimal focused changes. No unrelated refactors. Preserve behavior unless asked
- Multi-file/cross-layer/ambiguous changes: plan first (Investigate/Triage task, update incrementally)
- Confirm function/class/config existence + signatures before editing
- New/modified class/module: add header comment — responsibilities, dependencies, invariants, side effects

## Angular-Specific Code Style and Conventions
- Single Angular 18 CLI app bootstrapped with `bootstrapApplication` in `src/main.ts` + `ApplicationConfig` in `src/app/app.config.ts`. No NgModules. New UI = standalone components only.
- Folder layout:
  - `src/app/core` — layout/shell components (header, sidebar, layout), cross-cutting services (e.g. `ThemeService`, `LayoutService`), route constants
  - `src/app/modules/*` — feature UIs (`home`, `images-to-pdf`, `invoices`, etc.)
  - `src/app/domain/*` — framework-agnostic business logic (pure TypeScript, own tests): invoice date + table calculations
  - `src/app/data-access/*` — HTTP + data-access services (e.g. `LanguageApiService`)
  - `src/app/shared/*` — reusable components, services, interfaces, utilities shared across features
  - `src/app/store` — app-level feature store exposure (currently re-exporting `InvoicesStore`)
- Thin components, strict layering: UI orchestration in components, calculations in `domain`, HTTP/data loading in `data-access` via Angular DI.
- All routing in `src/app/app.routes.ts`. New page:
  - Child of layout route via `loadComponent: () => import('...').then(m => m.YourComponent)`
  - Dashed lower-case path (e.g. `new-feature`), update `APP_ROUTES` in `src/app/core/constants/app-routes.ts`, update `MENU_ITEMS` in `src/app/core/constants/routes.ts` if sidebar-visible
  - Set meaningful `title`
- Components must be standalone, declare deps in `imports` array (follow `HomeComponent`, `ImagesToPdfComponent`). Import only PrimeNG modules actually used.
- SCSS for styles. Component styles live next to component (`*.component.scss`); global styles + third-party CSS (PrimeFlex, PrimeIcons, ngx-toastr) in `src/styles.scss`. No new global CSS frameworks without explicit decision.
- Use PrimeNG, PrimeFlex, PrimeIcons for UI + layout. Theme configured via `providePrimeNG` with Aura preset in `src/app/app.config.ts` — change theme only there.
- Feature state: `@ngrx/signals` `signalStore`, following `src/app/modules/invoices/state/invoices.store.ts`:
  - New stores under `src/app/modules/<feature>/state`
  - Use `withState`, `withComputed`, `withMethods` + `patchState` for immutable updates
  - Expose only signals/computed values + methods needed by components
  - No other global state libs (classic NgRx store, NGXS, Akita, custom singletons) without explicit refactor
- i18n via `LanguageService` (`src/app/shared/services/language.service.ts`) + `LanguageApiService` (`src/app/data-access/i18n/language-api.service.ts`), JSON files in `public/assets/i18n/en.json` + `public/assets/i18n/es.json`:
  - New user-facing text → add keys to both `en.json` + `es.json`
  - Use `LanguageService.getText('your.key')` (see `ButtonGenericComponent`). No hard-coded labels
  - No `@ngx-translate` or other i18n frameworks unless explicitly migrated
- All HTTP through services in `src/app/data-access` injected via DI. Cross-cutting HTTP behavior (auth headers, logging, global error handling) → Angular interceptor under `src/app/core/services`, registered via `provideHttpClient(withInterceptors([...]))` in `app.config.ts`. No logic duplication per service.
- Logic change in Angular components/services/directives/pipes/stores → create/update Jasmine/Karma unit tests next to file (see `*.spec.ts` in `modules` + `shared`), run with `npm test` (`ng test`).
- Use Angular CLI commands from `package.json` (`npm start`, `npm run build`, `npm test`) + `ng generate` for new artifacts. Default component schematic: SCSS.

## Script Conventions
- Validate required args at script start
- Error messages → `>&2` (stderr)
- Non-zero exit on errors
- Include usage/help functions
- `set -e` in critical scripts
- Always use `--no-select` with `melos` (e.g. `melos run run-builder --no-select`)

## Documentation
- Document intent in comments. No standalone docs for routine changes
- Critical files (auth, payments, routing, request-signing, config, telemetry, DI/bootstrap, entrypoints): short header — sensitivity, owner, purpose, invariants, side effects, related test suites, change contract

## Github
- GitFlow branch naming
- **PR creation:**
  - Trello ticket in title (e.g. `APP-123: Add feature X`)
  - `No-Trello` prefix if no ticket (e.g. `No-Trello: Change X`)
  - Always add me as assignee
  - Always use @PULL_REQUEST_TEMPLATE.md
  - Include Risk Assessment, Invariants affected, Tests added/updated
- Feature branches + small commits. Clear imperative messages. No force-push unless instructed
- Never commit/push before asking