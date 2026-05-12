---
type: "always_apply"
---

## Code Style and Conventions
- When changing logic, write and run unit tests to confirm correctness
- Use smart detection for test directories and i18n files
- Always follow best practices and conventions
- Follow DRY (Don't Repeat Yourself) principles to minimize code duplication
- Follow Clean Code, SOLID, and KISS principles
- Prefer minimal, focused changes; avoid unrelated refactors. Preserve behavior unless explicitly asked to change it
- For multi-file, cross-layer, or ambiguous changes, plan first (create a small "Investigate/Triage" task and update incrementally)
- Confirm existence and signatures of functions, classes, and configs before editing
- For new or modified classes/modules, add a brief header comment describing responsibilities, dependencies, key business rules/invariants, and side effects

## Angular-Specific Code Style and Conventions
- This project is a single Angular 18 CLI app bootstrapped with `bootstrapApplication` in `src/main.ts` and `ApplicationConfig` in `src/app/app.config.ts`. Do not introduce NgModules; new UI must be implemented as standalone components.
- Follow the existing folder layout:
  - `src/app/core` for layout/shell components (header, sidebar, layout), cross-cutting services (for example, `ThemeService`, `LayoutService`), and route constants.
  - `src/app/modules/*` for feature UIs (`home`, `images-to-pdf`, `invoices`, etc.).
  - `src/app/domain/*` for framework-agnostic business logic (pure TypeScript, with its own tests), such as invoice date and table calculations.
  - `src/app/data-access/*` for HTTP and other data-access services (for example, `LanguageApiService`).
  - `src/app/shared/*` for reusable components, services, interfaces, and utilities shared across features.
  - `src/app/store` for app-level exposure of feature stores (currently re-exporting `InvoicesStore`).
- Keep components thin and aligned with this layering: UI orchestration stays in components, calculations go into `domain`, and HTTP/data loading stays in `data-access` services injected via Angular DI.
- All routing is centralized in `src/app/app.routes.ts`. When adding a new page:
  - Add it as a child of the layout route using `loadComponent: () => import('...').then(m => m.YourComponent)`.
  - Use dashed lower-case paths (for example, `new-feature`), update `APP_ROUTES` in `src/app/core/constants/app-routes.ts`, and update `MENU_ITEMS` in `src/app/core/constants/routes.ts` if the page should appear in the sidebar.
  - Set a meaningful `title` for the route.
- Components must be standalone and declare their dependencies in the `imports` array, following existing components like `HomeComponent` and `ImagesToPdfComponent`. Import only the PrimeNG modules you actually use.
- Styles use SCSS. Component-specific styles live next to the component (`*.component.scss`); global styles and third-party CSS (PrimeFlex, PrimeIcons, ngx-toastr) belong in `src/styles.scss`. Do not introduce additional global CSS frameworks without an explicit decision.
- Use PrimeNG, PrimeFlex, and PrimeIcons consistently for UI controls and layout. The PrimeNG theme is configured via `providePrimeNG` with the Aura preset in `src/app/app.config.ts`; change theme configuration only there.
- Feature state should use `@ngrx/signals` `signalStore`, following the pattern in `src/app/modules/invoices/state/invoices.store.ts`:
  - Place new stores under `src/app/modules/<feature>/state`.
  - Use `withState`, `withComputed`, and `withMethods` plus `patchState` for immutable updates.
  - Expose only the signals/computed values and methods needed by components.
  - Do not introduce other global state libraries (classic NgRx store, NGXS, Akita, custom singletons) without an explicit refactor.
- i18n is implemented via `LanguageService` (`src/app/shared/services/language.service.ts`) + `LanguageApiService` (`src/app/data-access/i18n/language-api.service.ts`) using JSON files in `public/assets/i18n/en.json` and `public/assets/i18n/es.json`:
  - When adding user-facing text, add keys to both `en.json` and `es.json`.
  - Use `LanguageService.getText('your.key')` (as in `ButtonGenericComponent`) instead of hard-coding labels.
  - Do not start using `@ngx-translate` or other i18n frameworks unless the project is explicitly migrated.
- All HTTP calls should go through services in `src/app/data-access` (for example, `LanguageApiService`) and be injected into higher layers. If you introduce cross-cutting HTTP behavior (authentication headers, logging, global error handling), implement it as an Angular interceptor under `src/app/core/services` and register it via `provideHttpClient(withInterceptors([...]))` in `app.config.ts` instead of duplicating logic in each service.
- When changing logic in Angular components, services, directives, pipes, or stores, create or update Jasmine/Karma unit tests next to the file (see existing `*.spec.ts` in `modules` and `shared`), and run them with `npm test` (which calls `ng test`).
- Use Angular CLI commands defined in `package.json` (`npm start`, `npm run build`, `npm test`) and `ng generate` for new Angular artifacts instead of hand-wiring files; keep the default component schematic style as SCSS.

## Script Conventions
- Always validate required arguments at the start of scripts
- Use `>&2` for error messages to write to stderr
- Exit with non-zero status codes on errors
- Include usage/help functions in scripts
- Use `set -e` to exit on errors in critical scripts
- Use `--no-select` always while using a `melos` command (Ex: `melos run run-builder --no-select`)

## Documentation
- Document intent in code comments; do not create standalone docs for routine code changes
- Critical files (auth, payments, routing, request-signing, configuration, telemetry, DI/bootstrap, entrypoints) should include a short header noting sensitivity, owner, purpose, invariants, side effects, related test suites, and change contract

## Github
- Follow GitFlow workflow for naming branches
- **When creating a PR:**
  - Make sure to add the Trello ticket number in the PR title (e.g., `APP-123: Add feature X`)
  - Add `No-Trello` to the PR title if the change is not related to a Trello ticket (e.g., `No-Trello: Change X`)
  - Add me always as the assignee
  - Always use @PULL_REQUEST_TEMPLATE.md
  - Include a brief Risk Assessment, Invariants affected, and Tests added/updated
- Prefer feature branches with multiple small commits; write clear, imperative commit messages; avoid force-push unless instructed
- Do not commit or push any change before asking