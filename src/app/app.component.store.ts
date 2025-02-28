import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { FisrtForm } from './components/invoices/interfaces/first-form';
import { SecondForm } from './components/invoices/interfaces/second-form';
import { DataInvoicesTable } from './components/invoices/interfaces/data-invoices-table';
import { computed } from '@angular/core';

type InvoicesState = {
  firstForm: FisrtForm;
  second: SecondForm;
  tableContain: DataInvoicesTable[];
  isValidFirstForm: boolean;
  isValidSecondForm: boolean;
  touchedFirstForm: boolean;
  touchedSecondForm: boolean;
  iva: number;
};

const initialState: InvoicesState = {
  firstForm: {
    numberInvoice: '',
    dateOrDateRange: false,
    date: null,
    rangeDates: null,
    name: '',
    national: true,
    address: '',
    passport: '',
  },
  second: {
    nameDestination: '',
    accountDestination: '',
    addressDestination: '',
    nameBank: '',
    addressBank: '',
    nif: '',
  },
  tableContain: [],
  iva: 0,
  isValidFirstForm: false,
  isValidSecondForm: false,
  touchedFirstForm: false,
  touchedSecondForm: false,
};

export const InvoicesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(
    ({
      firstForm,
      second,
      tableContain,
      isValidFirstForm,
      isValidSecondForm,
      touchedFirstForm,
      touchedSecondForm,
      iva
    }) => ({
      getFirstForm: computed(() => firstForm()),
      getIVA: computed(() => iva()),
      getIsValidFirstForm: computed(() => isValidFirstForm()),
      getIsValidSecondForm: computed(() => isValidSecondForm()),
      getSeconfForm: computed(() => second()),
      getTableContain: computed(() => tableContain()),
      getTouchedFirstForm: computed(() => touchedFirstForm()),
      getTouchedSecondForm: computed(() => touchedSecondForm()),
    })
  ),
  withMethods((store) => ({
    updateIVA(iva: number): void {
      patchState(store, (state) => ({ ...state, iva }));
    },
    updateFirstForm(firstForm: FisrtForm): void {
      patchState(store, (state) => ({ ...state, firstForm }));
    },
    updateSecondForm(second: SecondForm): void {
      patchState(store, (state) => ({ ...state, second }));
    },
    updateTable(tableContain: DataInvoicesTable[]): void {
      patchState(store, (state) => ({ ...state, tableContain }));
    },
    updateValidFirstForm(isValidFirstForm: boolean): void {
      patchState(store, (state) => ({ ...state, isValidFirstForm }));
    },
    updateValidSecondForm(isValidSecondForm: boolean): void {
      patchState(store, (state) => ({ ...state, isValidSecondForm }));
    },
    updateTouchedFirstForm(touchedFirstForm: boolean): void {
      patchState(store, (state) => ({ ...state, touchedFirstForm }));
    },
    updateTouchedSecondForm(touchedSecondForm: boolean): void {
      patchState(store, (state) => ({ ...state, touchedSecondForm }));
    },
    resetInvoices(): void {
      patchState(store, (state) => initialState);
    },
    resetTableInvoices(): void {
      patchState(store, (state) => ({...state, tableContain: []}));
    },
  }))
);
