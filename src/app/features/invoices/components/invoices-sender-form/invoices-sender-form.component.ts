import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { FormGenericComponent } from '../../../../shared/components/form-generic/form-generic.component';
import { FisrtForm } from '../../interfaces/first-form';
import { InvoicesStore } from '../../../../store/app.store';
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

  /** Reference to the FormGenericComponent for managing the form */
  @ViewChild('formSenderGenericComponent')
  formSenderGenericComponent!: FormGenericComponent<FisrtForm>;

  /**  Common validators for required fields */
  usualValidate = [
    { validator: Validators.required, message: this.translate.instant('common.validation.required') },
  ];

  /** Configuration for the form fields */
  formConfig: FormField<FisrtForm>[] = [
    {
      name: 'date',
      label: this.translate.instant('invoices.sender_form.date'),
      type: 'calendar',
      cols: 6,
      initialData: this.getFirstFormStore()?.date || new Date(),
      validators: this.usualValidate,
    },
    {
      name: 'name',
      label: this.translate.instant('invoices.sender_form.sender_name'),
      type: 'input',
      cols: 6,
      initialData: this.getFirstFormStore()?.name,
      validators: this.usualValidate,
    },
    {
      name: 'passport',
      label: this.translate.instant('invoices.sender_form.sender_passport'),
      type: 'input',
      cols: 6,
      initialData: this.getFirstFormStore()?.passport,
      validators: this.usualValidate,
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
