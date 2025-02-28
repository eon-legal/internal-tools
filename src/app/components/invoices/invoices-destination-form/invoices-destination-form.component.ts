import { Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormGenericComponent } from '../../../shared/components/form-generic/form-generic.component';
import { FormField } from '../../../core/interfaces/form-field';
import { InvoicesStore } from '../../../app.component.store';


@Component({
  selector: 'app-invoices-destination-form',
  standalone: true,
  imports: [FormGenericComponent],
  templateUrl: './invoices-destination-form.component.html',
  styleUrl: './invoices-destination-form.component.scss',
})
export class InvoicesDestinationFormComponent implements OnDestroy {
  readonly store = inject(InvoicesStore);
  @ViewChild('formDestinationGenericComponent')
  formDestinationGenericComponent!: FormGenericComponent;
  formConfig: FormField[] = [
    {
      name: 'nameDestination',
      label: 'Nombre Destino',
      type: 'input',
      cols: 4,
      initialData: this.getSecondFormStore().nameDestination,
      validators: [Validators.required],
    },
    {
      name: 'accountDestination',
      label: 'Cuenta Destino',
      type: 'input',
      cols: 4,
      initialData: this.getSecondFormStore().accountDestination,
      validators: [Validators.required],
    },
    {
      name: 'addressDestination',
      label: 'Dirección Destino',
      type: 'input',
      cols: 4,
      initialData: this.getSecondFormStore().addressDestination,
      validators: [Validators.required],
    },
    {
      name: 'nameBank',
      label: 'Nombre Banco',
      type: 'input',
      initialData: this.getSecondFormStore().nameBank,
      cols: 4,
      validators: [Validators.required],
    },
    {
      name: 'addressBank',
      label: 'Dirección Banco',
      type: 'input',
      initialData: this.getSecondFormStore().addressBank,
      cols: 4,
      validators: [Validators.required],
    },
    {
      name: 'nif',
      label: 'NIF',
      type: 'input',
      initialData: this.getSecondFormStore().nif,
      cols: 4,
      validators: [Validators.required],
    },
  ];
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
