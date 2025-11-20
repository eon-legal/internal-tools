/**
 * Invoices List Store
 * 
 * Responsibilities:
 * - Manage invoice list state (loading, data, filters, selection)
 * - Integrate with Supabase for CRUD operations
 * - Handle batch operations (mark as paid, delete)
 * - Manage filter state for invoice history view
 * 
 * Business Rules:
 * - Invoices are loaded from Supabase on demand
 * - Filters are applied client-side and server-side
 * - Selected invoices can be batch processed
 * 
 * Dependencies:
 * - InvoicesDataService for database operations
 * - CompaniesDataService for company data
 * 
 * Side Effects:
 * - Performs database operations via data services
 * - Updates UI state based on async operations
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
import { InvoicesDataService } from '../../../data-access/invoices/invoices-data.service';
import { CompaniesDataService } from '../../../data-access/companies/companies-data.service';
import {
  Invoice,
  InvoiceFilters,
  Company,
} from '../interfaces/database-models';

/**
 * State structure for the invoices list store
 */
type InvoicesListState = {
  invoices: Invoice[];
  companies: Company[];
  selectedInvoiceIds: string[];
  filters: InvoiceFilters;
  isLoading: boolean;
  error: string | null;
};

/**
 * Initial state for the invoices list store
 */
const initialState: InvoicesListState = {
  invoices: [],
  companies: [],
  selectedInvoiceIds: [],
  filters: {},
  isLoading: false,
  error: null,
};

/**
 * Invoices List Store
 * Manages the state for the invoice history/list view
 */
export const InvoicesListStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ invoices, selectedInvoiceIds, filters, isLoading, error, companies }) => ({
    // Computed: Get all invoices
    allInvoices: computed(() => invoices()),
    
    // Computed: Get selected invoices
    selectedInvoices: computed(() => {
      const ids = selectedInvoiceIds();
      return invoices().filter((inv) => ids.includes(inv.id));
    }),
    
    // Computed: Check if any invoices are selected
    hasSelection: computed(() => selectedInvoiceIds().length > 0),
    
    // Computed: Get current filters
    currentFilters: computed(() => filters()),
    
    // Computed: Get loading state
    loading: computed(() => isLoading()),
    
    // Computed: Get error state
    errorMessage: computed(() => error()),
    
    // Computed: Get all companies
    allCompanies: computed(() => companies()),
    
    // Computed: Get invoice count
    invoiceCount: computed(() => invoices().length),
    
    // Computed: Get selected count
    selectedCount: computed(() => selectedInvoiceIds().length),
  })),
  withMethods(
    (
      store,
      invoicesDataService = inject(InvoicesDataService),
      companiesDataService = inject(CompaniesDataService)
    ) => ({
      /**
       * Load invoices from Supabase with optional filters
       */
      loadInvoices: rxMethod<InvoiceFilters | void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((filters) => {
            const currentFilters = filters || store.currentFilters();
            return invoicesDataService.getInvoices(currentFilters).pipe(
              tap((invoices) =>
                patchState(store, {
                  invoices,
                  filters: currentFilters,
                  isLoading: false,
                })
              ),
              catchError((error) => {
                patchState(store, {
                  error: error.message || 'Failed to load invoices',
                  isLoading: false,
                });
                return of([]);
              })
            );
          })
        )
      ),

      /**
       * Load companies from Supabase
       */
      loadCompanies: rxMethod<void>(
        pipe(
          switchMap(() =>
            companiesDataService.getCompanies().pipe(
              tap((companies) => patchState(store, { companies })),
              catchError((error) => {
                console.error('Failed to load companies:', error);
                return of([]);
              })
            )
          )
        )
      ),

      /**
       * Update filters and reload invoices
       */
      updateFilters(filters: InvoiceFilters): void {
        patchState(store, { filters });
      },

      /**
       * Toggle invoice selection
       */
      toggleInvoiceSelection(invoiceId: string): void {
        const currentSelection = store.selectedInvoiceIds();
        const isSelected = currentSelection.includes(invoiceId);

        const newSelection = isSelected
          ? currentSelection.filter((id) => id !== invoiceId)
          : [...currentSelection, invoiceId];

        patchState(store, { selectedInvoiceIds: newSelection });
      },

      /**
       * Select all invoices
       */
      selectAllInvoices(): void {
        const allIds = store.allInvoices().map((inv) => inv.id);
        patchState(store, { selectedInvoiceIds: allIds });
      },

      /**
       * Clear all selections
       */
      clearSelection(): void {
        patchState(store, { selectedInvoiceIds: [] });
      },

      /**
       * Mark selected invoices as paid
       */
      markSelectedAsPaid: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() => {
            const selectedIds = store.selectedInvoiceIds();
            if (selectedIds.length === 0) {
              patchState(store, { isLoading: false });
              return of([]);
            }

            return invoicesDataService.markInvoicesAsPaid(selectedIds).pipe(
              tap(() => {
                // Reload invoices after marking as paid
                const currentFilters = store.currentFilters();
                invoicesDataService.getInvoices(currentFilters).subscribe({
                  next: (invoices) => {
                    patchState(store, {
                      invoices,
                      selectedInvoiceIds: [],
                      isLoading: false,
                    });
                  },
                  error: (error) => {
                    patchState(store, {
                      error: error.message || 'Failed to reload invoices',
                      isLoading: false,
                    });
                  },
                });
              }),
              catchError((error) => {
                patchState(store, {
                  error: error.message || 'Failed to mark invoices as paid',
                  isLoading: false,
                });
                return of([]);
              })
            );
          })
        )
      ),

      /**
       * Delete selected invoices
       */
      deleteSelectedInvoices: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() => {
            const selectedIds = store.selectedInvoiceIds();
            if (selectedIds.length === 0) {
              patchState(store, { isLoading: false });
              return of(undefined);
            }

            return invoicesDataService.deleteInvoices(selectedIds).pipe(
              tap(() => {
                // Reload invoices after deletion
                const currentFilters = store.currentFilters();
                invoicesDataService.getInvoices(currentFilters).subscribe({
                  next: (invoices) => {
                    patchState(store, {
                      invoices,
                      selectedInvoiceIds: [],
                      isLoading: false,
                    });
                  },
                  error: (error) => {
                    patchState(store, {
                      error: error.message || 'Failed to reload invoices',
                      isLoading: false,
                    });
                  },
                });
              }),
              catchError((error) => {
                patchState(store, {
                  error: error.message || 'Failed to delete invoices',
                  isLoading: false,
                });
                return of(undefined);
              })
            );
          })
        )
      ),

      /**
       * Delete a single invoice
       */
      deleteInvoice: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((invoiceId) =>
            invoicesDataService.deleteInvoice(invoiceId).pipe(
              tap(() => {
                // Remove invoice from state
                const updatedInvoices = store.allInvoices().filter(
                  (inv) => inv.id !== invoiceId
                );
                patchState(store, {
                  invoices: updatedInvoices,
                  isLoading: false,
                });
              }),
              catchError((error) => {
                patchState(store, {
                  error: error.message || 'Failed to delete invoice',
                  isLoading: false,
                });
                return of(undefined);
              })
            )
          )
        )
      ),

      /**
       * Update download timestamp for an invoice
       */
      updateDownloadTimestamp: rxMethod<string>(
        pipe(
          switchMap((invoiceId) =>
            invoicesDataService.updateDownloadTimestamp(invoiceId).pipe(
              tap((updatedInvoice) => {
                // Update invoice in state
                const updatedInvoices = store.allInvoices().map((inv) =>
                  inv.id === invoiceId ? updatedInvoice : inv
                );
                patchState(store, { invoices: updatedInvoices });
              }),
              catchError((error) => {
                console.error('Failed to update download timestamp:', error);
                return of(null);
              })
            )
          )
        )
      ),

      /**
       * Reset store to initial state
       */
      reset(): void {
        patchState(store, initialState);
      },
    })
  )
);


