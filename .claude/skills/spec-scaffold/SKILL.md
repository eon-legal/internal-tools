---
name: spec-scaffold
description: >
  Generate a co-located *.spec.ts next to an existing component, service,
  guard, interceptor, pipe, directive, or signalStore that lacks one.
  Matches the plain TestBed style used in this repo (see
  src/app/app.component.spec.ts) — does NOT use ng-mocks helpers unless
  the file already imports them. Use when user says "add tests", "missing
  spec", "scaffold spec", or invokes /spec-scaffold. Auto-trigger after
  touching logic in a file without an existing spec.
---

# spec-scaffold

Coverage is ~23% (49 specs / 214 source files). Project rules require a test for every logic change in components/services/directives/pipes/stores. This skill closes the gap one file at a time.

## Inputs

- **Target file** — absolute path to the source file needing a spec.
- (Optional) **Mocked dependencies** — list of services/tokens to provide as test doubles. If omitted, infer from the file's constructor `inject()` calls and `imports`.

## Steps

1. Read the target file. Identify:
   - Kind (component / service / guard / interceptor / pipe / directive / signalStore).
   - `inject()` calls and constructor params — these become spec providers.
   - `imports` array on standalone components — copy them into the spec's `TestBed`.
   - Public methods, public signals/computeds, and any `@Input/@Output` (or `input()` / `output()`) signals.
2. Create `<file>.spec.ts` alongside the source. Use this template, tailored to kind:

   ### Component
   ```ts
   import { ComponentFixture, TestBed } from '@angular/core/testing';
   import { <Name>Component } from './<name>.component';

   describe('<Name>Component', () => {
     let component: <Name>Component;
     let fixture: ComponentFixture<<Name>Component>;

     beforeEach(async () => {
       await TestBed.configureTestingModule({
         imports: [<Name>Component /*, ...component imports */],
         providers: [/* mocked services */],
       }).compileComponents();

       fixture = TestBed.createComponent(<Name>Component);
       component = fixture.componentInstance;
       fixture.detectChanges();
     });

     it('should create', () => {
       expect(component).toBeTruthy();
     });

     // TODO: assert one rendered element, one input default, one event emit
   });
   ```

   ### Service / Store
   ```ts
   import { TestBed } from '@angular/core/testing';
   import { <Name> } from './<name>.<service|store>';

   describe('<Name>', () => {
     let instance: <Name>;

     beforeEach(() => {
       TestBed.configureTestingModule({
         providers: [<Name> /*, mocked deps */],
       });
       instance = TestBed.inject(<Name>);
     });

     it('should be created', () => {
       expect(instance).toBeTruthy();
     });

     // TODO: one method test, one signal/computed assertion
   });
   ```

   ### Functional guard / interceptor
   Mirror `src/app/core/interceptors/auth.interceptor.spec.ts` — wrap the function in `TestBed.runInInjectionContext` so `inject()` resolves.

3. Provide jest doubles for typical deps:
   - `Router` → `{ navigate: jest.fn() }`
   - `TranslateService` → `{ instant: (k: string) => k, get: (k: string) => of(k) }`
   - `LanguageService` → `{ getText: (k: string) => k }`
   - `SupabaseService` / data-access services → minimal object with the methods the SUT calls, all returning `of(...)` or `Promise.resolve(...)`.
   - HTTP → `provideHttpClientTesting()` from `@angular/common/http/testing`.
4. Mark all non-trivial assertions as `// TODO:` so a human writes the real expectations. Do not invent business assertions.
5. Run `npx jest <new-spec-path>` to confirm it compiles and the smoke test passes. Report failures verbatim; do not silently mutate the SUT to make the spec pass.

## What not to do

- Never delete or rewrite an existing spec — extend it.
- Never use `ng-mocks` helpers if the file's existing siblings don't already use them (consistency over cleverness; the codebase is mixed).
- Never mock the SUT itself.
- Never assert against private fields — use the public API.

## Output

`Spec written at <path>. Smoke test: <pass|fail>. TODO assertions: <count>.`
