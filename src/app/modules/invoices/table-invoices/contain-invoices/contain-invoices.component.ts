import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  DialogService,
  DynamicDialog,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InvoicesStore } from '../../../../store/app.component.store';
import {
  ButtonOperation,
  FormatOptions,
} from '../../../../shared/interfaces/buttons';
import { DataInvoicesTable } from '../../interfaces/data-invoices-table';
import { FormField } from '../../../../shared/interfaces/form-field';
import { DataInvoicesConstant } from '../../constants/data-invoices';
import { FormInvoicesDataComponent } from '../form-invoices-data/form-invoices-data.component';
import { getSumAttribute } from '../../utils/sum-attribute-object';
import { FormGenericComponent } from '../../../../shared/components/form-generic/form-generic.component';
import { TableGenericComponent } from '../../../../shared/components/table-generic/table-generic.component';
import { ButtonModule } from 'primeng/button';
import { Iva } from '../../interfaces/iva';
import { HeaderTable } from '../../../../shared/interfaces/header-table';

@Component({
  selector: 'app-contain-invoices',
  standalone: true,
  imports: [
    FormGenericComponent,
    TableGenericComponent,
    ButtonModule,
    DynamicDialog,
  ],
  templateUrl: './contain-invoices.component.html',
  styleUrl: './contain-invoices.component.scss',
  providers: [DialogService],
})
export class ContainInvoicesComponent
  implements AfterViewInit, OnDestroy, OnInit
{
  readonly store = inject(InvoicesStore);
  dialogService: DialogService = inject(DialogService);
  listPagination = [5, 10, 20];
  operation: ButtonOperation<DataInvoicesTable>[] = [
    {
      icon: 'pi pi-trash',
      severity: 'danger',
      action: (row: DataInvoicesTable) => this.deleteRow(row),
      hideDependsFunction: (row: DataInvoicesTable) => this.hideLastRows(row),
    },
  ];
  formConfig: FormField<Iva>[] = [
    {
      name: 'iva',
      label: 'IVA Neto',
      type: 'number_currency',
      initialData: this.store.getIVA() || 0,
    },
  ];

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

  @ViewChild('formIVA') formIVA!: FormGenericComponent<Iva>;
  ref: DynamicDialogRef | undefined;

  ngAfterViewInit(): void {
    this.formIVA
      ?.getFormControl('iva')
      ?.valueChanges.subscribe((value: number | null) => {
        const positionIVA = this.rowTable.findIndex(
          (r) => r.perCentIva === DataInvoicesConstant.IVA
        );
        if (positionIVA !== -1) {
          this.rowTable[positionIVA].total = value ? value : 0;
        }
      });
  }

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
    const posIVA = this.rowTable.findIndex(
      (v) => v.perCentIva === DataInvoicesConstant.IVA
    );
    (this.rowTable[posIVA].total = this.store.getIVA() || 0),
      this.updateFieldTable();
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
    this.updateFieldTable();
  }

  show() {
    this.ref = this.dialogService.open(FormInvoicesDataComponent, {
      header: 'Inserte Datos Factura',
      width: '50vw',
      modal: true,
      contentStyle: { overflow: 'auto' },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
      focusOnShow: false,
    });

    this.ref.onClose.subscribe((data: DataInvoicesTable | null) => {
      if (data) {
        const position = this.rowTable.findIndex(
          (r) => r.perCentIva === DataInvoicesConstant.IVA
        );
        const save = this.assingnIndexDeleteUltraOptimo(this.rowTable, data);
        if (position !== -1) {
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
        this.updateFieldTable();
      }
    });
  }

  updateFieldTable() {
    const positionTotal = this.rowTable.findIndex(
      (r) => r.perCentIva === DataInvoicesConstant.TOTAL
    );
    const todoMenosTotalAndIVA = this.rowTable.filter(
      (r) =>
        r.perCentIva !== DataInvoicesConstant.TOTAL &&
        r.perCentIva !== DataInvoicesConstant.IVA
    );
    const total = getSumAttribute<DataInvoicesTable>(
      todoMenosTotalAndIVA,
      'total'
    );
    if (positionTotal !== -1) {
      const getDataPosTotal = this.rowTable[positionTotal];
      this.rowTable[positionTotal] = { ...getDataPosTotal, total };
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
    if (this.ref) {
      this.ref.close();
    }
    this.store.updateTable(this.rowTable);
    this.store.updateIVA(
      this.formIVA?.getDataFormComplete().iva
        ? this.formIVA?.getDataFormComplete().iva
        : 0
    );
  }
}
