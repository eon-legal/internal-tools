import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { FormGenericComponent } from '../../../../shared/components/form-generic/form-generic.component';
import { FisrtForm } from '../../interfaces/first-form';
import { InvoicesStore } from '../../../../store/app.component.store';
import {
  dateRangeValidator,
  noOneDateValidator,
} from '../../utils/date-range-validator/date-range-validator';
import { FormField } from '../../../../shared/components/form-generic/interfaces/form-field';

/**
 * Component for managing the sender form in the invoice generation process.
 * This form collects details about the sender, such as name, address, and invoice dates.
 */
@Component({
  selector: 'app-invoices-sender-form',
  standalone: true,
  imports: [FormGenericComponent],
  templateUrl: './invoices-sender-form.component.html',
  styleUrl: './invoices-sender-form.component.scss',
})
export class InvoicesSenderFormComponent implements AfterViewInit, OnDestroy {
  /** Injected store for managing invoice data */
  readonly store = inject(InvoicesStore);

  /** Reference to the FormGenericComponent for managing the form */
  @ViewChild('formSenderGenericComponent')
  formSenderGenericComponent!: FormGenericComponent<FisrtForm>;

  /**  Common validators for required fields */
  usualValidate = [
    { validator: Validators.required, message: 'Campo requerido.' },
  ];

  /** Validators for date range fields */
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

  /** Configuration for the form fields */
  formConfig: FormField<FisrtForm>[] = [
    {
      name: 'numberInvoice',
      label: 'Número Factura *',
      type: 'input',
      cols: 4,
      initialData: this.getFirstFormStore()?.numberInvoice,
      validators: this.usualValidate,
    },
    {
      name: 'dateOrDateRange',
      label: 'Período',
      type: 'toggle',
      initialData: this.getFirstFormStore()?.dateOrDateRange,
      cols: 4,
    },
    {
      name: 'date',
      label: 'Fecha *',
      type: 'calendar',
      cols: 4,
      initialData: this.getFirstFormStore()?.date,
      validators: this.getFirstFormStore()?.dateOrDateRange
        ? null
        : this.usualValidate,
      showComponent: this.getFirstFormStore()?.dateOrDateRange ? false : true,
      disabled: this.getFirstFormStore()?.dateOrDateRange ? true : false,
    },
    {
      name: 'rangeDates',
      label: 'Rango Fecha *',
      type: 'calendar',
      initialData: this.getFirstFormStore()?.rangeDates,
      cols: 4,
      validators: this.getFirstFormStore()?.dateOrDateRange
        ? this.arrayRangeDate
        : undefined,
      showComponent: this.getFirstFormStore()?.dateOrDateRange ? true : false,
      primeNgConfig: { selectionMode: 'range' },
      disabled: this.getFirstFormStore()?.dateOrDateRange ? false : true,
    },
    {
      name: 'name',
      label: 'Nombre Remitente *',
      type: 'input',
      cols: 4,
      initialData: this.getFirstFormStore()?.name,
      validators: this.usualValidate,
    },
    {
      name: 'national',
      label: 'Nacional',
      type: 'toggle',
      initialData: this.getFirstFormStore()?.national,
      cols: 4,
    },
    {
      name: 'address',
      label: 'Dirección Remitente *',
      type: 'input',
      cols: 4,
      initialData: this.getFirstFormStore()?.address,
      validators: this.getFirstFormStore()?.national
        ? this.usualValidate
        : undefined,
      showComponent: this.getFirstFormStore()?.national ? true : false,
      disabled: this.getFirstFormStore()?.national ? false : true,
    },
    {
      name: 'passport',
      label: 'Pasaporte Remitente *',
      type: 'input',
      cols: 4,
      initialData: this.getFirstFormStore()?.passport,
      validators: this.getFirstFormStore()?.national
        ? null
        : this.usualValidate,
      showComponent: this.getFirstFormStore()?.national ? false : true,
      disabled: this.getFirstFormStore()?.national ? true : false,
    },
  ];

  /** Injected ChangeDetectorRef for manually triggering change detection */
  cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  /**
   * Lifecycle hook that runs after the view is initialized.
   * Sets up the form with initial data and validators.
   */
  ngAfterViewInit() {
    const first = this.store.firstForm();
    if (this.store.getAllMarkFieldForm())
      this.formSenderGenericComponent?.getGroupForm?.markAllAsTouched();
    this.formSenderGenericComponent?.getGroupForm?.patchValue(first);

    // Set up conditional validators for date and national fields
    this.setupConditionaDateRemitenteValidation();
    this.setupConditionalNationalRemitente();
  }

  /**
   * Sets up conditional validation for the date and date range fields.
   * Toggles validators and visibility based on the `dateOrDateRange` field value.
   */
  private setupConditionaDateRemitenteValidation() {
    this.formSenderGenericComponent
      ?.getFormControl('dateOrDateRange')
      ?.valueChanges.subscribe((value: boolean) => {
        const fieldDate =
          this.formSenderGenericComponent?.getGroupForm?.get('date');
        const fieldRangeDate =
          this.formSenderGenericComponent?.getGroupForm?.get('rangeDates');
        const positionDate = this.formConfig.findIndex(
          (v) => v.name === 'date'
        );
        const positionRange = this.formConfig.findIndex(
          (v) => v.name === 'rangeDates'
        );

        if (positionDate !== -1 && positionRange !== -1) {
          if (value) {
            // Show range date field and hide single date field
            this.formConfig[positionDate].showComponent = false;
            this.formConfig[positionRange].showComponent = true;

            // Update validators
            this.formConfig[positionDate].validators = undefined;
            this.formConfig[positionRange].validators = this.arrayRangeDate;

            // Disable single date field and enable range date field
            fieldDate?.disable();
            fieldDate?.setValue('');
            fieldDate?.clearValidators();
            fieldRangeDate?.enable();
            fieldRangeDate?.setValidators(
              this.arrayRangeDate.map((v) => v.validator)
            );
          } else {
            // Show single date field and hide range date field
            this.formConfig[positionDate].showComponent = true;
            this.formConfig[positionRange].showComponent = false;

            // Update validators
            this.formConfig[positionDate].validators = this.usualValidate;
            this.formConfig[positionRange].validators = undefined;

            // Disable range date field and enable single date field
            fieldRangeDate?.disable();
            fieldRangeDate?.setValue('');
            fieldRangeDate?.clearValidators();
            fieldDate?.enable();
            fieldDate?.setValidators(this.usualValidate[0].validator);
          }

          // Update field validity and trigger change detection
          fieldDate?.updateValueAndValidity();
          fieldRangeDate?.updateValueAndValidity();
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Sets up conditional validation for the address and passport fields.
   * Toggles validators and visibility based on the `national` field value.
   */
  private setupConditionalNationalRemitente() {
    this.formSenderGenericComponent
      ?.getFormControl('national')
      ?.valueChanges.subscribe((value: boolean) => {
        const fieldAddress =
          this.formSenderGenericComponent?.getGroupForm?.get('address');
        const fieldPassport =
          this.formSenderGenericComponent?.getGroupForm?.get('passport');
        const positionAddress = this.formConfig.findIndex(
          (v) => v.name === 'address'
        );
        const positionPassport = this.formConfig.findIndex(
          (v) => v.name === 'passport'
        );
        if (positionAddress !== -1 && positionPassport !== -1) {
          if (value) {
            // Show address field and hide passport field
            this.formConfig[positionAddress].showComponent = true;
            this.formConfig[positionPassport].showComponent = false;

            // Disable passport field and enable address field
            /*fieldAddress?.disable();
            fieldAddress?.setValue('');
            fieldAddress?.clearValidators();*/

            /*fieldPassport?.enable();
            fieldPassport?.setValidators(this.usualValidate[0].validator);*/

            fieldPassport?.disable();
            fieldPassport?.setValue('');
            fieldPassport?.clearValidators();

            fieldAddress?.enable();
            fieldAddress?.setValidators(this.usualValidate[0].validator);
          } else {
            // Show passport field and hide address field
            this.formConfig[positionAddress].showComponent = false;
            this.formConfig[positionPassport].showComponent = true;

            // Disable address field and enable passport field
            fieldAddress?.disable();
            fieldAddress?.setValue('');
            fieldAddress?.clearValidators();

            fieldPassport?.enable();
            fieldPassport?.setValidators(this.usualValidate[0].validator);
          }
          // Update field validity
          fieldAddress?.updateValueAndValidity();
          fieldPassport?.updateValueAndValidity();
        }
      });
  }

  /**
   * Updates the form data with the provided object.
   * @param data - The data to update the form with.
   */
  changeData(data: object) {
    this.formSenderGenericComponent.getGroupForm.patchValue(data);
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Updates the store with the current form data.
   */
  ngOnDestroy(): void {
    this.store.updateFirstForm(
      this.formSenderGenericComponent?.getDataFormComplete()
    );
    if (this.formSenderGenericComponent?.getGroupForm.valid) {
      this.store.updateValidFirstForm(true);
    } else {
      this.store.updateValidFirstForm(false);
    }
  }

  /**
   * Retrieves the first form data from the store.
   * @returns The first form data.
   */
  getFirstFormStore() {
    return this.store.getFirstForm();
  }
}
