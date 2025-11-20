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
import { InvoicesStore } from '../../../../store/app.store';
import {
  dateRangeValidator,
  noOneDateValidator,
} from '../../utils/date-range-validator/date-range-validator';
import { FormField } from '../../../../shared/components/form-generic/interfaces/form-field';
import { TranslateService } from '@ngx-translate/core';

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
  /** Injected services */
  private readonly translate = inject(TranslateService);
  readonly store = inject(InvoicesStore);
  cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  /** Reference to the FormGenericComponent for managing the form */
  @ViewChild('formSenderGenericComponent')
  formSenderGenericComponent!: FormGenericComponent<FisrtForm>;

  /**  Common validators for required fields */
  usualValidate = [
    { validator: Validators.required, message: this.translate.instant('common.validation.required') },
  ];

  /** Validators for date range fields */
  arrayRangeDate = [
    { validator: Validators.required, message: this.translate.instant('common.validation.required') },
    {
      validator: dateRangeValidator,
      message: this.translate.instant('invoices.sender_form.messages.date_range_error'),
    },
    {
      validator: noOneDateValidator,
      message: this.translate.instant('invoices.sender_form.messages.date_range_required'),
    },
  ];

  /** Configuration for the form fields */
  formConfig: FormField<FisrtForm>[] = [
    // Invoice number is now auto-generated, so we remove the manual input field
    // {
    //   name: 'numberInvoice',
    //   label: this.translate.instant('invoices.sender_form.invoice_number'),
    //   type: 'input',
    //   cols: 4,
    //   initialData: this.getFirstFormStore()?.numberInvoice,
    //   validators: this.usualValidate,
    // },
    {
      name: 'dateOrDateRange',
      label: this.translate.instant('invoices.sender_form.period'),
      type: 'toggle',
      initialData: this.getFirstFormStore()?.dateOrDateRange,
      cols: 4,
    },
    {
      name: 'date',
      label: this.translate.instant('invoices.sender_form.date'),
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
      label: this.translate.instant('invoices.sender_form.date_range'),
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
      label: this.translate.instant('invoices.sender_form.sender_name'),
      type: 'input',
      cols: 4,
      initialData: this.getFirstFormStore()?.name,
      validators: this.usualValidate,
    },
    {
      name: 'national',
      label: this.translate.instant('invoices.sender_form.national'),
      type: 'toggle',
      initialData: this.getFirstFormStore()?.national,
      cols: 4,
    },
    {
      name: 'address',
      label: this.translate.instant('invoices.sender_form.sender_address'),
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
      label: this.translate.instant('invoices.sender_form.sender_passport'),
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

  /**
   * Lifecycle hook that runs after the view is initialized.
   * Sets up the form with initial data and validators.
   */
  ngAfterViewInit() {
    const first = this.store.firstForm();
    if (this.store.getAllMarkFieldForm())
      this.formSenderGenericComponent?.getForm?.markAllAsTouched();
    this.formSenderGenericComponent?.getForm?.patchValue(first);

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
        const fieldDate = this.formSenderGenericComponent?.getForm?.get('date');
        const fieldRangeDate =
          this.formSenderGenericComponent?.getForm?.get('rangeDates');
        const positionDate = this.formConfig.findIndex(
          (v) => v.name === 'date'
        );
        const positionRange = this.formConfig.findIndex(
          (v) => v.name === 'rangeDates'
        );

        if (positionDate !== -1 && positionRange !== -1) {
          const dateField = this.formConfig[positionDate];
          const rangeField = this.formConfig[positionRange];

          if (value && dateField && rangeField) {
            // Show range date field and hide single date field
            dateField.showComponent = false;
            rangeField.showComponent = true;

            // Update validators
            dateField.validators = undefined;
            rangeField.validators = this.arrayRangeDate;

            // Disable single date field and enable range date field
            fieldDate?.disable();
            fieldDate?.setValue('');
            fieldDate?.clearValidators();
            fieldRangeDate?.enable();
            fieldRangeDate?.setValidators(
              this.arrayRangeDate.map((v) => v.validator)
            );
          } else if (dateField && rangeField) {
            // Show single date field and hide range date field
            dateField.showComponent = true;
            rangeField.showComponent = false;

            // Update validators
            dateField.validators = this.usualValidate;
            rangeField.validators = undefined;

            // Disable range date field and enable single date field
            fieldRangeDate?.disable();
            fieldRangeDate?.setValue('');
            fieldRangeDate?.clearValidators();
            fieldDate?.enable();
            const firstValidator = this.usualValidate[0];
            if (firstValidator) {
              fieldDate?.setValidators(firstValidator.validator);
            }
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
          this.formSenderGenericComponent?.getForm?.get('address');
        const fieldPassport =
          this.formSenderGenericComponent?.getForm?.get('passport');
        const positionAddress = this.formConfig.findIndex(
          (v) => v.name === 'address'
        );
        const positionPassport = this.formConfig.findIndex(
          (v) => v.name === 'passport'
        );
        if (positionAddress !== -1 && positionPassport !== -1) {
          const addressField = this.formConfig[positionAddress];
          const passportField = this.formConfig[positionPassport];
          const firstValidator = this.usualValidate[0];

          if (value && addressField && passportField) {
            // Show address field and hide passport field
            addressField.showComponent = true;
            passportField.showComponent = false;

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
            if (firstValidator) {
              fieldAddress?.setValidators(firstValidator.validator);
            }
          } else if (addressField && passportField) {
            // Show passport field and hide address field
            addressField.showComponent = false;
            passportField.showComponent = true;

            // Disable address field and enable passport field
            fieldAddress?.disable();
            fieldAddress?.setValue('');
            fieldAddress?.clearValidators();

            fieldPassport?.enable();
            if (firstValidator) {
              fieldPassport?.setValidators(firstValidator.validator);
            }
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
    this.formSenderGenericComponent.getForm.patchValue(data);
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Updates the store with the current form data.
   */
  ngOnDestroy(): void {
    this.store.updateFirstForm(
      this.formSenderGenericComponent?.getDataFormComplete()
    );
    if (this.formSenderGenericComponent?.getForm.valid) {
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
