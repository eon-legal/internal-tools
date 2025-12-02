import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed } from '@angular/core';
import { FisrtForm } from '../features/invoices/interfaces/first-form';
import { SecondForm } from '../features/invoices/interfaces/second-form';
import { DataInvoicesTable } from '../features/invoices/interfaces/data-invoices-table';
import { SELECT_DATA_INITIAL } from '../shared/components/form-generic/constants/select-data-initial';

/**
 * Represents the state structure for the invoices store.
 */
type InvoicesState = {
  firstForm: FisrtForm; // State for the first form
  second: SecondForm; // State for the second form
  tableContain: DataInvoicesTable[]; // State for the table data
  isValidFirstForm: boolean; // Indicates if the first form is valid
  isValidSecondForm: boolean; // Indicates if the second form is valid
  touchedFirstForm: boolean; // Indicates if the first form has been touched
  touchedSecondForm: boolean; // Indicates if the second form has been touched
  iva: number; // VAT (IVA) value
  allMarkFieldForm: boolean; // Indicates if all fields in the form are marked
};

/**
 * Initial state for the invoices store.
 */
const initialState: InvoicesState = {
  firstForm: {
    numberInvoice: '',
    date: new Date(),
    name: '',
    passport: '',
  },
  second: {
    chooseDestination: SELECT_DATA_INITIAL,
    nameDestination: '',
    accountDestination: '',
    addressDestination: '',
    nameBank: '',
    addressBank: '',
    nif: '',
  },
  tableContain: [], // Initial empty table data
  iva: 0, // Initial VAT value
  isValidFirstForm: false, // First form is initially invalid
  isValidSecondForm: false, // Second form is initially invalid
  touchedFirstForm: false, // First form is initially untouched
  touchedSecondForm: false, // Second form is initially untouched
  allMarkFieldForm: false, // Initially, not all fields are marked
};

/**
 * Interface representing the type of the invoices store.
 * This includes methods and computed properties.
 */
export interface InvoicesStoreType {
  resetInvoices: () => void; // Resets the entire store to the initial state
  resetTableInvoices: () => void; // Resets only the table data
  // Add other methods and properties here if needed
}

/**
 * InvoicesStore is a signal-based store for managing the state of invoices.
 * It includes state, computed properties, and methods for updating the state.
 */
export const InvoicesStore = signalStore(
  { providedIn: 'root' }, // Provided at the root level for global access
  withState(initialState), // Initializes the store with the initial state
  withComputed(
    ({
      firstForm,
      second,
      tableContain,
      isValidFirstForm,
      isValidSecondForm,
      touchedFirstForm,
      touchedSecondForm,
      iva,
      allMarkFieldForm,
    }) => ({
      // Computed properties for accessing state values
      getFirstForm: computed(() => firstForm()), // Returns the first form state
      getIVA: computed(() => iva()), // Returns the VAT value
      getIsValidFirstForm: computed(() => isValidFirstForm()), // Returns the validity of the first form
      getIsValidSecondForm: computed(() => isValidSecondForm()), // Returns the validity of the second form
      getSecondForm: computed(() => second()), // Returns the second form state
      getTableContain: computed(() => tableContain()), // Returns the table data
      getTouchedFirstForm: computed(() => touchedFirstForm()), // Returns the touched state of the first form
      getTouchedSecondForm: computed(() => touchedSecondForm()), // Returns the touched state of the second form
      getAllMarkFieldForm: computed(() => allMarkFieldForm()), // Returns the state of all marked fields
    })
  ),
  withMethods((store) => ({
    /**
     * Updates the VAT (IVA) value in the store.
     * @param iva - The new VAT value.
     */
    updateIVA(iva: number): void {
      patchState(store, (state) => ({ ...state, iva }));
    },

    /**
     * Updates the state of all marked fields in the store.
     * @param allMarkFieldForm - The new state for all marked fields.
     */
    updateAllMarkFieldForm(allMarkFieldForm: boolean): void {
      patchState(store, (state) => ({ ...state, allMarkFieldForm }));
    },

    /**
     * Updates the first form state in the store.
     * @param firstForm - The new state for the first form.
     */
    updateFirstForm(firstForm: FisrtForm): void {
      patchState(store, (state) => ({ ...state, firstForm }));
    },

    /**
     * Updates the second form state in the store.
     * @param second - The new state for the second form.
     */
    updateSecondForm(second: SecondForm): void {
      patchState(store, (state) => ({ ...state, second }));
    },

    /**
     * Updates the table data in the store.
     * @param tableContain - The new table data.
     */
    updateTable(tableContain: DataInvoicesTable[]): void {
      patchState(store, (state) => ({ ...state, tableContain }));
    },

    /**
     * Updates the validity state of the first form in the store.
     * @param isValidFirstForm - The new validity state for the first form.
     */
    updateValidFirstForm(isValidFirstForm: boolean): void {
      patchState(store, (state) => ({ ...state, isValidFirstForm }));
    },

    /**
     * Updates the validity state of the second form in the store.
     * @param isValidSecondForm - The new validity state for the second form.
     */
    updateValidSecondForm(isValidSecondForm: boolean): void {
      patchState(store, (state) => ({ ...state, isValidSecondForm }));
    },

    /**
     * Updates the touched state of the first form in the store.
     * @param touchedFirstForm - The new touched state for the first form.
     */
    updateTouchedFirstForm(touchedFirstForm: boolean): void {
      patchState(store, (state) => ({ ...state, touchedFirstForm }));
    },

    /**
     * Updates the touched state of the second form in the store.
     * @param touchedSecondForm - The new touched state for the second form.
     */
    updateTouchedSecondForm(touchedSecondForm: boolean): void {
      patchState(store, (state) => ({ ...state, touchedSecondForm }));
    },

    /**
     * Resets the entire store to the initial state.
     */
    resetInvoices(): void {
      patchState(store, (state) => initialState);
    },

    /**
     * Resets only the table data in the store.
     */
    resetTableInvoices(): void {
      patchState(store, (state) => ({ ...state, tableContain: [] }));
    },
  }))
);
