import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TableGenericComponent } from '../../../../../shared/components/table-generic/table-generic.component';
import { InvoicesStore } from '../../../../../store/app.component.store';
import { DataInvoicesTable } from '../../../interfaces/data-invoices-table';
import {
  ButtonGenericInterface,
  FormatOptions,
} from '../../../../../shared/interfaces/buttons';
import { HeaderTable } from '../../../../../shared/interfaces/header-table';
import { DataInvoicesConstant } from '../../../constants/data-invoices';
import { CustomDialogService } from '../../../../../shared/services/modal/custom-dialog.service';
import { FormInvoicesDataComponent } from '../form-invoices-data/form-invoices-data.component';
import { getSumArrayNumber } from '../../../utils/sum-attribute-object';
import { ButtonGenericComponent } from '../../../../../shared/components/button-generic/button-generic.component';
import { getNextID } from '../../../utils/next-id';
import { mapAtrribute } from '../../../utils/mapeo';

@Component({
  selector: 'app-contain-invoices',
  standalone: true,
  imports: [TableGenericComponent, ButtonGenericComponent],
  templateUrl: './contain-invoices.component.html',
  styleUrl: './contain-invoices.component.scss',
})
export class ContainInvoicesComponent implements OnDestroy, OnInit {
  readonly store = inject(InvoicesStore);
  listPagination = [5, 10, 20];
  buttons: ButtonGenericInterface = {
    css: 'noClass',
    buttons: [
      {
        id: 1,
        icon: 'pi pi-check',
        label: 'Agregar Dato Facturas',
        severity: 'primary',
        action: () => this.show(),
      },
    ],
  };
  operation: ButtonGenericInterface = {
    buttons: [
      {
        id: 1,
        icon: 'pi pi-trash',
        severity: 'danger',
        action: (row: DataInvoicesTable) => this.deleteRow(row),
        hideDependsFunction: (row: DataInvoicesTable) => this.hideLastRows(row),
      },
    ],
  };

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

  rowTable: DataInvoicesTable[] = [];
  customDialogService: CustomDialogService = inject(CustomDialogService);
  ngOnInit() {
    this.rowTable = this.store.getTableContain();
    if (
      !this.rowTable.length ||
      this.rowTable.some(
        (v) =>
          v.perCentIva === DataInvoicesConstant.TOTAL &&
          v.perCentIva === DataInvoicesConstant.IVA
      )
    ) {
      this.rowTable.push({
        id: '',
        description: '',
        sTotal: '',
        perCentIva: DataInvoicesConstant.IVA,
        total: 0,
      });
      this.rowTable.push({
        id: '',
        description: '',
        sTotal: '',
        perCentIva: DataInvoicesConstant.TOTAL,
        total: 0,
      });
    }

    // this.updateFieldTableSumAllExcepIVA();
  }

  hideLastRows(row: DataInvoicesTable): boolean {
    return (
      row.perCentIva === DataInvoicesConstant.IVA ||
      row.perCentIva === DataInvoicesConstant.TOTAL
    );
  }

  deleteRow(data: DataInvoicesTable) {
    this.rowTable = this.rowTable.filter(
      (v) => v.indexDelete !== data.indexDelete
    );
    this.updateFieldTableSumAllExcepIVA();
  }

  redondearDecimal(numero: number, decimales: number): number {
    // Multiplicar por 10^decimales para mover el decimal deseado a la posición de las unidades
    const factor = Math.pow(10, decimales);
    const numeroMultiplicado = numero * factor;

    // Redondear el número
    const numeroRedondeado = Math.round(numeroMultiplicado);

    // Dividir por 10^decimales para devolver el número a su escala original
    return numeroRedondeado / factor;
  }

  // Método para abrir el modal con el componente dinámico
  show() {
    const dialogRef = this.customDialogService.openDialog(
      FormInvoicesDataComponent,
      'Inserte Datos Factura'
    );
    dialogRef.onClose.subscribe((data: DataInvoicesTable | null) => {
      if (data) {
        const position = this.rowTable.findIndex(
          (r) => r.perCentIva === DataInvoicesConstant.IVA
        );
        const save = this.assingnIndexDeleteUltraOptimo(this.rowTable, data);
        if (position !== -1) {
          save.id = getNextID(this.rowTable);
          const perCentIva = save.perCentIva as {
            label: string;
            value: number;
          };
          let perCentIvaValue = perCentIva.value;
          const sTotal = !perCentIvaValue
            ? save.total
            : this.redondearDecimal(
                (82.6446 / 100) * (save.total as number),
                2
              );
          save.sTotal = sTotal;

          save.perCentIva = perCentIvaValue;
          /**82.6446 / 100 */
          this.rowTable.splice(position, 0, save);
        } else {
          this.rowTable.push(save);
          this.rowTable.push({
            id: '',
            description: '',
            sTotal: '',
            perCentIva: DataInvoicesConstant.IVA,
            total: 0,
          });
          this.rowTable.push({
            id: '',
            description: '',
            sTotal: '',
            perCentIva: DataInvoicesConstant.TOTAL,
            total: 0,
          });
        }
        this.updateFieldTableSumAllExcepIVA();
      }
    });
  }

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

  ngOnDestroy(): void {
    this.store.updateTable(this.rowTable);
  }
}
