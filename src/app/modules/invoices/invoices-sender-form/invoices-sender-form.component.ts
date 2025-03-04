import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGenericComponent } from '../../../shared/components/form-generic/form-generic.component';
import { Validators } from '@angular/forms';
import { FormField } from '../../../shared/interfaces/form-field';
import { InvoicesStore } from '../../../store/app.component.store';
import { FisrtForm } from '../interfaces/first-form';
import {
  dateRangeValidator,
  noOneDateValidator,
} from '../utils/date-range-validator';

@Component({
  selector: 'app-invoices-sender-form',
  standalone: true,
  imports: [FormGenericComponent],
  templateUrl: './invoices-sender-form.component.html',
  styleUrl: './invoices-sender-form.component.scss',
})
export class InvoicesSenderFormComponent
  implements AfterViewInit, OnDestroy, OnInit
{
  readonly store = inject(InvoicesStore);
  @ViewChild('formSenderGenericComponent')
  formSenderGenericComponent!: FormGenericComponent<FisrtForm>;
  usualValidate = [
    { validator: Validators.required, message: 'Campo requerido.' },
  ];
  arrayRangeDate = [
    { validator: Validators.required, message: 'Campo requerido.' },
    {
      validator: dateRangeValidator,
      message: 'La primera fecha debe ser menor que la segunda.',
    },
    {
      validator: noOneDateValidator,
      message: 'Debes elegir un rango de fechas.',
    },
  ];
  formConfig: FormField<FisrtForm>[] = [
    {
      name: 'numberInvoice',
      label: 'Número Factura *',
      type: 'input',
      cols: 4,
      initialData: this.getFirstFormStore().numberInvoice,
      validators: this.usualValidate,
    },
    {
      name: 'dateOrDateRange',
      label: 'Período',
      type: 'toggle',
      initialData: this.getFirstFormStore().dateOrDateRange,
      cols: 4,
    },
    {
      name: 'date',
      label: 'Fecha *',
      type: 'calendar',
      cols: 4,
      initialData: this.getFirstFormStore().date,
      validators: this.getFirstFormStore().dateOrDateRange
        ? null
        : this.usualValidate,
      showComponent: this.getFirstFormStore().dateOrDateRange ? false : true,
    },
    {
      name: 'rangeDates',
      label: 'Rango Fecha *',
      type: 'calendar',
      initialData: this.getFirstFormStore().rangeDates,
      cols: 4,
      validators: this.getFirstFormStore().dateOrDateRange
        ? this.arrayRangeDate
        : undefined,
      showComponent: this.getFirstFormStore().dateOrDateRange ? true : false,
      primeNgConfig: { selectionMode: 'range' },
    },
    {
      name: 'name',
      label: 'Nombre Remitente *',
      type: 'input',
      cols: 4,
      initialData: this.getFirstFormStore().name,
      validators: this.usualValidate,
    },
    {
      name: 'national',
      label: 'Nacional',
      type: 'toggle',
      initialData: this.getFirstFormStore().national,
      cols: 4,
    },
    {
      name: 'address',
      label: 'Dirección Remitente *',
      type: 'input',
      cols: 4,
      initialData: this.getFirstFormStore().address,
      validators: this.getFirstFormStore().national
        ? this.usualValidate
        : undefined,
      showComponent: this.getFirstFormStore().national ? true : false,
    },
    {
      name: 'passport',
      label: 'Pasaporte Remitente *',
      type: 'input',
      cols: 4,
      initialData: this.getFirstFormStore().passport,
      validators: this.getFirstFormStore().national ? null : this.usualValidate,
      showComponent: this.getFirstFormStore().national ? false : true,
    },
  ];

  constructor(public cdr: ChangeDetectorRef) {}
  ngOnInit(): void {}

  ngAfterViewInit() {
    const first = this.store.firstForm();
    if (this.store.getAllMarkFieldForm())
      this.formSenderGenericComponent?.doMarkField();
    this.formSenderGenericComponent?.establishDataParams(first);
    // Escuchar cambios de valor
    this.setupConditionaDateRemitenteValidation();
    this.setupConditionalNationalRemitente();
    //this.formSenderGenericComponent?.doMarkField();
  }

  private setupConditionaDateRemitenteValidation() {
    this.formSenderGenericComponent
      ?.getFormControl('dateOrDateRange')
      ?.valueChanges.subscribe((value: boolean) => {
        const fieldDate = this.formSenderGenericComponent?.form?.get('date');
        const fieldRangeDate =
          this.formSenderGenericComponent?.form?.get('rangeDates');
        const positionDate = this.formConfig.findIndex(
          (v) => v.name === 'date'
        );
        const positionRange = this.formConfig.findIndex(
          (v) => v.name === 'rangeDates'
        );

        if (positionDate !== -1 && positionRange !== -1) {
          if (value) {
            this.formConfig[positionDate].showComponent = false;
            this.formConfig[positionRange].showComponent = true;

            this.formConfig[positionDate].validators = undefined;
            this.formConfig[positionRange].validators = this.arrayRangeDate;

            fieldDate?.disable();
            fieldDate?.setValue('');
            fieldRangeDate?.enable();
            fieldRangeDate?.setValidators(
              this.arrayRangeDate.map((v) => v.validator)
            );
          } else {
            this.formConfig[positionDate].showComponent = true;
            this.formConfig[positionRange].showComponent = false;

            this.formConfig[positionDate].validators = this.usualValidate;
            this.formConfig[positionRange].validators = undefined;

            fieldRangeDate?.disable();
            fieldRangeDate?.setValue('');
            fieldDate?.enable();
            fieldDate?.setValidators(this.usualValidate[0].validator);
          }

          fieldDate?.updateValueAndValidity();
          fieldRangeDate?.updateValueAndValidity();
          // Forzar la detección de cambios
          this.cdr.detectChanges();
        }
      });
  }
  private setupConditionalNationalRemitente() {
    this.formSenderGenericComponent
      ?.getFormControl('national')
      ?.valueChanges.subscribe((value: boolean) => {
        const fieldAddress =
          this.formSenderGenericComponent?.form?.get('address');
        const fieldPassport =
          this.formSenderGenericComponent?.form?.get('passport');
        const positionAddress = this.formConfig.findIndex(
          (v) => v.name === 'address'
        );
        const positionPassport = this.formConfig.findIndex(
          (v) => v.name === 'passport'
        );
        if (positionAddress !== -1 && positionPassport !== -1) {
          if (value) {
            this.formConfig[positionAddress].showComponent = true;
            this.formConfig[positionPassport].showComponent = false;

            fieldAddress?.disable();
            fieldAddress?.setValue('');

            fieldPassport?.enable();
            fieldPassport?.setValidators(this.usualValidate[0].validator);

            fieldPassport?.disable();
            fieldPassport?.setValue('');

            fieldAddress?.enable();
            fieldAddress?.setValidators(this.usualValidate[0].validator);
          } else {
            this.formConfig[positionAddress].showComponent = false;
            this.formConfig[positionPassport].showComponent = true;
            fieldAddress?.disable();
            fieldAddress?.setValue('');
            fieldPassport?.enable();
            fieldPassport?.setValidators(this.usualValidate[0].validator);
          }
          fieldAddress?.updateValueAndValidity();
          fieldPassport?.updateValueAndValidity();
        }
      });
  }
  changeData(data: object) {
    this.formSenderGenericComponent.establishDataParams(data);
  }
  ngOnDestroy(): void {
    this.store.updateFirstForm(
      this.formSenderGenericComponent?.getDataFormComplete()
    );
    if (this.formSenderGenericComponent?.formValid()) {
      this.store.updateValidFirstForm(true);
    } else {
      this.store.updateValidFirstForm(false);
    }
  }
  getFirstFormStore() {
    return this.store.getFirstForm();
  }
}
