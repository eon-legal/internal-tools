import { Component, inject, ViewChild } from '@angular/core';
import { FormGenericComponent } from '../../../../shared/components/form-generic/form-generic.component';
import { Validators } from '@angular/forms';
import { FormField } from '../../../../core/interfaces/form-field';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DataInvoicesTable } from '../../interfaces/data-invoices-table';

@Component({
  selector: 'app-form-invoices-data',
  standalone: true,
  imports: [FormGenericComponent, ButtonModule],
  templateUrl: './form-invoices-data.component.html',
  styleUrl: './form-invoices-data.component.scss',
})
export class FormInvoicesDataComponent {
  @ViewChild('formTable') formTable!: FormGenericComponent;
  formConfig: FormField[] = [
    {
      name: 'description',
      label: 'Descripción',
      type: 'input',
      cols: 12,
      validators: [Validators.required],
    },
    {
      name: 'id',
      label: 'ID',
      type: 'input',
      cols: 6,
      validators: [Validators.required],
    },
    {
      name: 'qtt',
      label: 'QTT',
      type: 'number',
      cols: 6,
      //validators: [Validators.required],
    },
    {
      name: 'price',
      label: 'Precio',
      type: 'number',
      cols: 6,
      //validators: [Validators.required],
    },
    {
      name: 'sTotal',
      label: 'S.Total',
      type: 'number_currency',
      cols: 6,
      validators: [Validators.required],
    },
    {
      name: 'perCentIva',
      label: '% IVA',
      type: 'number_percent',
      cols: 6,
      validators: [Validators.required],
    },
    {
      name: 'total',
      label: 'Total',
      type: 'number_currency',
      cols: 6,
      validators: [Validators.required],
    },
  ];
  ref: DynamicDialogRef<DataInvoicesTable | null> = inject(DynamicDialogRef);
  accept() {
    if (this.formTable.formValid()) {
      this.ref.close(this.formTable.getDataFormComplete());
    }
    this.formTable.doMarkField();
  }
  close() {
    this.ref.close(null);
  }
  //asignarCountsUltraOptimo<T extends { count?: number }>(arr: T[]): (T & { count: number })[] {
}
