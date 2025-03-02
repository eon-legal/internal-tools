import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { FormGenericComponent } from '../../../shared/components/form-generic/form-generic.component';
import { FormField } from '../../../shared/interfaces/form-field';
import { InvoicesStore } from '../../../store/app.component.store';
import { SecondForm } from '../interfaces/second-form';

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
  readonly store = inject(InvoicesStore);
  @ViewChild('formDestinationGenericComponent')
  formDestinationGenericComponent!: FormGenericComponent<SecondForm>;
  formConfig: FormField<SecondForm>[] = [
    {
      name: 'nameDestination',
      label: 'Nombre Destino *',
      type: 'input',
      cols: 4,
      initialData: this.getSecondFormStore().nameDestination,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' },
      ],
    },
    {
      name: 'accountDestination',
      label: 'Cuenta Destino *',
      type: 'input',
      cols: 4,
      initialData: this.getSecondFormStore().accountDestination,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' },
      ],
    },
    {
      name: 'addressDestination',
      label: 'Dirección Destino *',
      type: 'input',
      cols: 4,
      initialData: this.getSecondFormStore().addressDestination,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' },
      ],
    },
    {
      name: 'nameBank',
      label: 'Nombre Banco *',
      type: 'input',
      initialData: this.getSecondFormStore().nameBank,
      cols: 4,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' },
      ],
    },
    {
      name: 'addressBank',
      label: 'Dirección Banco *',
      type: 'input',
      initialData: this.getSecondFormStore().addressBank,
      cols: 4,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' },
      ],
    },
    {
      name: 'nif',
      label: 'NIF *',
      type: 'input',
      initialData: this.getSecondFormStore().nif,
      cols: 4,
      validators: [
        { validator: Validators.required, message: 'Campo requerido.' },
      ],
    },
  ];
  ngAfterViewInit(): void {
    if (this.store.getAllMarkFieldForm())
      this.formDestinationGenericComponent?.doMarkField();
  }
  ngOnDestroy(): void {
    this.store.updateSecondForm(
      this.formDestinationGenericComponent.getDataFormComplete()
    );
    if (this.formDestinationGenericComponent.formValid()) {
      this.store.updateValidSecondForm(true);
    } else {
      this.store.updateValidSecondForm(false);
    }
  }

  getSecondFormStore() {
    return this.store.getSeconfForm();
  }
}
