---
name: signal-store
description: >
  Scaffold a @ngrx/signals signalStore under src/app/features/<feature>/state
  matching the shape of invoices-list.store.ts: withState/withComputed/
  withMethods, optional rxMethod for async data-access integration, header
  comment block, and a co-located *.spec.ts stub. Use when user says
  "new store", "feature store", "signal store", or invokes /signal-store.
---

# signal-store

The repo uses `@ngrx/signals`. No NgRx classic, NGXS, or Akita. Reference implementations: `src/app/features/invoices/state/invoices-list.store.ts` (feature-level, injects data services) and `src/app/store/app.store.ts` (app-level singleton).

## Inputs

1. **Feature name** — must match an existing folder under `src/app/features/`.
2. **Store name** — kebab-case (e.g. `clients-list`); filename becomes `<name>.store.ts`.
3. **Scope** — `feature` (default; provided on a component/route) or `root` (`providedIn: 'root'` — only for genuinely app-wide state like the multi-step invoice generator).
4. **Data services to inject** — list of `data-access/*` services this store will call.
5. **State shape** — list of fields with types.

## Steps

1. Create `src/app/features/<feature>/state/<name>.store.ts` with this skeleton:

   ```ts
   /**
    * <Name> Store
    *
    * Responsibilities:
    *   - <fill in>
    *
    * Dependencies:
    *   - <data-access services>
    *
    * Side Effects:
    *   - <network / persistence>
    *
    * Invariants:
    *   - State mutations only via patchState
    *   - Async flows via rxMethod from @ngrx/signals/rxjs-interop
    */

   import { computed, inject } from '@angular/core';
   import {
     patchState,
     signalStore,
     withComputed,
     withMethods,
     withState,
   } from '@ngrx/signals';
   import { rxMethod } from '@ngrx/signals/rxjs-interop';
   import { pipe, switchMap, tap, catchError, of } from 'rxjs';

   type <Name>State = {
     // fields here
     isLoading: boolean;
     error: string | null;
   };

   const initialState: <Name>State = {
     isLoading: false,
     error: null,
   };

   export const <Name>Store = signalStore(
     // omit { providedIn: 'root' } for feature-scoped stores
     withState(initialState),
     withComputed((state) => ({
       // computed selectors
     })),
     withMethods((store, /* inject deps here */) => ({
       // patchState updates + rxMethod async flows
     }))
   );
   ```

2. For root-scoped stores, add `{ providedIn: 'root' }` as the first argument and remind the user this is reserved for cross-feature state.
3. For feature-scoped stores, provide the store on the route (`providers: [<Name>Store]` on the `loadComponent` route definition) or on the parent feature component. Do not register it in `app.config.ts`.
4. Generate a sibling `<name>.store.spec.ts` with:
   - `TestBed.configureTestingModule({ providers: [<Name>Store, ...mocked deps] })`
   - Tests asserting the initial state, one computed selector, and one method invocation.
5. Re-export from `src/app/store/app.store.ts` **only** if the store is `providedIn: 'root'` and consumed by code outside its owning feature.

## What not to do

- Never mutate state outside `patchState`.
- Never expose raw signals that shouldn't be writeable to consumers — wrap behind `computed` and a method.
- Never bypass `rxMethod` for async — manual `subscribe` inside methods leaks subscriptions.
- Never put HTTP calls directly in the store; inject a service from `data-access/`.

## Output

`Created <Name>Store at <path>. Scope: <feature|root>. Spec stub written. Reminder: <register on route | re-export from app.store>.`
