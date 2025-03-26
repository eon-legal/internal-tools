import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { FormGenericComponent } from '../../../../shared/components/form-generic/form-generic.component';
import { InvoicesStore } from '../../../../store/app.component.store';
import { SecondForm } from '../../interfaces/second-form';
import { FormField } from '../../../../shared/components/form-generic/interfaces/form-field';

/**
 * Component for managing the destination form in the invoice generation process.
 * This form collects details about the destination, such as name, address, and bank information.
 */
@Component({
  selector: 'app-invoices-destination-form',
  standalone: true,
  imports: [FormGenericComponent],
  templateUrl: './invoices-destination-form.component.html',
  styleUrl: './invoices-destination-form.component.scss',
})
export class InvoicesDestinationFormComponent
  implements OnDestroy, AfterViewInit
{
  /** Injected store for managing invoice data */
  readonly store = inject(InvoicesStore);

  /** Reference to the FormGenericComponent for managing the form */
  @ViewChild(FormGenericComponent)
  formDestinationGenericComponent!: FormGenericComponent<SecondForm>;

  /** Configuration for the form fields */
  formConfig: FormField<SecondForm>[] = [
    {
      name: 'nameDestination',
      label: 'Nombre Destino *',
      type: 'input',
      cols: 4,
      initialData: this.getSecondFormStore().nameDestination,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' }, // Required field validator
      ],
    },
    {
      name: 'accountDestination',
      label: 'Cuenta Destino *',
      type: 'input',
      cols: 4,
      initialData: this.getSecondFormStore().accountDestination,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' }, // Required field validator
      ],
    },
    {
      name: 'addressDestination',
      label: 'Dirección Destino *',
      type: 'input',
      cols: 4,
      initialData: this.getSecondFormStore().addressDestination,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' }, // Required field validator
      ],
    },
    {
      name: 'nameBank',
      label: 'Nombre Banco *',
      type: 'input',
      initialData: this.getSecondFormStore().nameBank,
      cols: 4,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' }, // Required field validator
      ],
    },
    {
      name: 'addressBank',
      label: 'Dirección Banco *',
      type: 'input',
      initialData: this.getSecondFormStore().addressBank,
      cols: 4,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' }, // Required field validator
      ],
    },
    {
      name: 'nif',
      label: 'NIF *',
      type: 'input',
      initialData: this.getSecondFormStore().nif,
      cols: 4,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' }, // Required field validator
      ],
    },
  ];

  /**
   * Lifecycle hook that runs after the view is initialized.
   * Marks all form fields as touched if required.
   */
  ngAfterViewInit(): void {
    if (this.store.getAllMarkFieldForm())
      this.formDestinationGenericComponent?.getGroupForm?.markAllAsTouched();
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Updates the store with the current form data.
   */
  ngOnDestroy(): void {
    this.store.updateSecondForm(
      this.formDestinationGenericComponent?.getDataFormComplete()
    );
    if (this.isValidForm()) {
      this.store.updateValidSecondForm(true); // Update store if the form is valid
    } else {
      this.store.updateValidSecondForm(false); // Update store if the form is invalid
    }
  }

  /**
   * Checks if the form is valid.
   * @returns True if the form is valid, otherwise false.
   */
  isValidForm(): boolean {
    return this.formDestinationGenericComponent?.getGroupForm.valid;
  }

  /**
   * Retrieves the current form data.
   * @returns The form data.
   */
  getValueForm() {
    return this.formDestinationGenericComponent?.getDataFormComplete();
  }

  /**
   * Retrieves the second form data from the store.
   * @returns The second form data.
   */
  getSecondFormStore() {
    return this.store.getSeconfForm();
  }
}
