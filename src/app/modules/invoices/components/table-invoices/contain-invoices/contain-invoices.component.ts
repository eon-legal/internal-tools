import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TableGenericComponent } from '../../../../../shared/components/table-generic/table-generic.component';
import { InvoicesStore } from '../../../../../store/app.store';
import { DataInvoicesTable } from '../../../interfaces/data-invoices-table';
import {
  ButtonGenericInterface,
  FormatOptions,
} from '../../../../../shared/components/button-generic/interfaces/buttons';
import { HeaderTable } from '../../../../../shared/components/table-generic/interfaces/header-table';
import { DataInvoicesConstant } from '../../../constants/data-invoices';
import { FormInvoicesDataComponent } from '../form-invoices-data/form-invoices-data.component';
import { getSumArrayNumber } from '../../../utils/sum-attribute-object/sum-attribute-object';
import { ButtonGenericComponent } from '../../../../../shared/components/button-generic/button-generic.component';

import { mapAtrribute } from '../../../utils/mapeo/mapeo';
import { getNextID } from '../../../utils/next-id/next-id';
import { CustomModalService } from '../../../../../shared/services/custom-modal/custom-modal.service';
import { IVA } from '../constants/iva-constants';

/**
 * Component for managing and displaying invoice data in a table.
 * This component allows users to add, delete, and update invoice data,
 * and it integrates with a store for state management.
 */
@Component({
  selector: 'app-contain-invoices',
  standalone: true,
  imports: [TableGenericComponent, ButtonGenericComponent],
  templateUrl: './contain-invoices.component.html',
  styleUrl: './contain-invoices.component.scss',
})
export class ContainInvoicesComponent implements OnDestroy, OnInit {
  /** Injected store for managing invoice data */
  readonly store = inject(InvoicesStore);

  /** List of pagination options for the table */
  listPagination = [5, 10, 20];

  // Configuration for buttons in the component
  buttons: ButtonGenericInterface = {
    css: 'noClass',
    buttons: [
      {
        id: 1,
        icon: 'pi pi-check',
        label: 'Agregar Dato Facturas',
        severity: 'primary',
        action: () => this.show(), // Action to open the dialog for adding invoice data
      },
    ],
  };

  /** Configuration for table operations (e.g., delete) */
  operation: ButtonGenericInterface = {
    buttons: [
      {
        id: 1,
        icon: 'pi pi-trash',
        severity: 'danger',
        action: (row: DataInvoicesTable) => this.deleteRow(row), // Action to delete a row
        hideDependsFunction: (row: DataInvoicesTable) => this.hideLastRows(row), // Function to hide the delete button for specific rows
      },
    ],
  };

  /** Header configuration for the table */
  headerData: HeaderTable<DataInvoicesTable>[] = [
    {
      field: 'id',
      header: 'ID',
    },
    {
      field: 'description',
      header: 'Descripción',
    },
    {
      field: 'qtt',
      header: 'QTT',
    },
    {
      field: 'price',
      header: 'Price',
    },
    {
      field: 'sTotal',
      header: 'S.Total',
    },
    {
      field: 'perCentIva',
      header: '% IVA',
    },
    {
      field: 'total',
      header: 'Total',
    },
  ];

  /** Format options for table columns */
  formatOptions: FormatOptions<DataInvoicesTable> = {
    sTotal: {
      formatFunction: (v) => {
        return `${v.sTotal} ${
          v.sTotal !== undefined && v.sTotal !== '' && v.sTotal !== null
            ? '€'
            : ''
        }`;
      },
    },
    perCentIva: {
      formatFunction: (v) => {
        return `${v.perCentIva} ${
          v.perCentIva !== undefined &&
          v.perCentIva !== null &&
          v.perCentIva !== DataInvoicesConstant.TOTAL &&
          v.perCentIva !== DataInvoicesConstant.IVA
            ? '%'
            : ''
        }`;
      },
    },
    total: {
      formatFunction: (v) => {
        return `${v.total} ${
          v.total !== undefined && v.total !== null ? '€' : ''
        } `;
      },
    },
  };

  /** Array to store the rows of the table */
  rowTable: DataInvoicesTable[] = [];

  /** Injected service for managing custom dialogs */
  customModalService: CustomModalService = inject(CustomModalService);

  /**
   * Lifecycle hook that runs when the component is initialized.
   * Initializes the table data and ensures the presence of summary rows (IVA and TOTAL).
   */
  ngOnInit() {
    this.rowTable = this.store.getTableContain() || [];
    if (
      !this.rowTable.length ||
      this.rowTable.some(
        (v) =>
          v.perCentIva === DataInvoicesConstant.TOTAL &&
          v.perCentIva === DataInvoicesConstant.IVA
      )
    ) {
      // Add summary rows if they don't exist
      this.rowTable = [
        ...this.rowTable,
        {
          id: '',
          description: '',
          sTotal: '',
          perCentIva: DataInvoicesConstant.IVA,
          total: 0,
        },
        {
          id: '',
          description: '',
          sTotal: '',
          perCentIva: DataInvoicesConstant.TOTAL,
          total: 0,
        },
      ];
    }
  }

  /**
   * Determines whether to hide the delete button for a specific row.
   * @param row - The row to check.
   * @returns True if the row is a summary row (IVA or TOTAL), otherwise false.
   */
  hideLastRows(row: DataInvoicesTable): boolean {
    return (
      row.perCentIva === DataInvoicesConstant.IVA ||
      row.perCentIva === DataInvoicesConstant.TOTAL
    );
  }

  /**
   * Deletes a row from the table.
   * @param data - The row to delete.
   */
  deleteRow(data: DataInvoicesTable) {
    this.rowTable = this.rowTable.filter(
      (v) => v.indexDelete !== data.indexDelete
    );
    this.updateFieldTableSumAllExcepIVA(); // Update summary rows after deletion
  }

  /**
   * Rounds a number to a specified number of decimal places.
   * @param numero - The number to round.
   * @param decimales - The number of decimal places.
   * @returns The rounded number.
   */
  redondearDecimal(numero: number, decimales: number): number {
    const factor = Math.pow(10, decimales);
    const numeroMultiplicado = numero * factor;
    const numeroRedondeado = Math.round(numeroMultiplicado);
    return numeroRedondeado / factor;
  }

  /**
   * Opens a dialog to add new invoice data.
   */
  show() {
    const { modalServiceRef } = this.customModalService.open(
      FormInvoicesDataComponent,
      {
        title: 'Inserte Datos Factura',
        width: '60vw',
        data: {},
        buttons: {
          css: 'flex flex-column md:flex-row md:justify-content-between gap-2',
          buttons: [
            {
              id: 1,
              label: 'Guardar',
              icon: 'pi pi-save',
              severity: 'success',
              action: () => {
                const formInstance = modalServiceRef.getInstance();
                if (formInstance && formInstance?.formTable?.getForm?.valid) {
                  modalServiceRef.close(
                    formInstance?.formTable?.getDataFormComplete()
                  );
                } else {
                  formInstance?.formTable?.getForm?.markAllAsTouched();
                }
              },
            },
            {
              id: 2,
              label: 'Cancelar',
              icon: 'pi pi-times',
              severity: 'danger',
              action: () => modalServiceRef.close(),
            },
          ],
        },
      }
    );

    modalServiceRef.onClose((data: DataInvoicesTable | undefined) => {
      if (data) {
        const positionIVA = this.rowTable.findIndex(
          (r) => r.perCentIva === DataInvoicesConstant.IVA
        );
        const save = this.assingnIndexDeleteUltraOptimo(this.rowTable, data);
        if (positionIVA !== -1) {
          save.id = getNextID(this.rowTable);
          const perCentIva = save.perCentIva as {
            label: string;
            value: number;
          };
          let perCentIvaValue = perCentIva.value;
          const sTotal = !perCentIvaValue
            ? save.total
            : this.redondearDecimal(
                //82.6446 / 100
                IVA * (save.total as number),
                2
              );
          save.sTotal = sTotal;
          save.perCentIva = perCentIvaValue;
          this.rowTable.splice(positionIVA, 0, save);
        }
        this.updateFieldTableSumAllExcepIVA(); // Update summary rows after adding new data
      }
    });
  }

  /**
   * Updates the summary rows (IVA and TOTAL) based on the current table data.
   */
  updateFieldTableSumAllExcepIVA() {
    const positionTotal = this.rowTable.findIndex(
      (r) => r.perCentIva === DataInvoicesConstant.TOTAL
    );
    const positionIVA = this.rowTable.findIndex(
      (r) => r.perCentIva === DataInvoicesConstant.IVA
    );
    const total = getSumArrayNumber(
      mapAtrribute<DataInvoicesTable>(
        this.rowTable.filter(
          (v) =>
            v.perCentIva !== DataInvoicesConstant.IVA &&
            v.perCentIva !== DataInvoicesConstant.TOTAL
        ),
        'total'
      )
    );
    const sTotal = getSumArrayNumber(
      mapAtrribute<DataInvoicesTable>(
        this.rowTable.filter(
          (v) =>
            v.perCentIva !== DataInvoicesConstant.IVA &&
            v.perCentIva !== DataInvoicesConstant.TOTAL
        ),
        'sTotal'
      )
    );
    if (positionTotal !== -1 && positionIVA !== -1) {
      const getDataPosTotal = this.rowTable[positionTotal];
      this.rowTable[positionTotal] = { ...getDataPosTotal, total };

      const getDataPosIva = this.rowTable[positionIVA];
      this.rowTable[positionIVA] = {
        ...getDataPosIva,
        total: this.redondearDecimal(total - sTotal, 2),
      };
    }
  }

  /**
   * Assigns a unique `indexDelete` value to a new row.
   * @param arr - The array of existing rows.
   * @param nuevoObjeto - The new row to assign an `indexDelete` value.
   * @returns The new row with a unique `indexDelete` value.
   */
  assingnIndexDeleteUltraOptimo(
    arr: DataInvoicesTable[],
    nuevoObjeto: DataInvoicesTable
  ): DataInvoicesTable {
    let max = 0;
    const indexDeletes = new Set<number>();

    for (const { indexDelete } of arr) {
      if (indexDelete !== undefined) {
        indexDeletes.add(indexDelete);
        if (indexDelete > max) max = indexDelete;
      }
    }
    let indexDelete = nuevoObjeto.indexDelete ?? ++max;
    while (indexDeletes.has(indexDelete)) indexDelete = ++max;
    return { ...nuevoObjeto, indexDelete };
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Updates the store with the current table data.
   */
  ngOnDestroy(): void {
    this.store.updateTable(this.rowTable);
  }
}
