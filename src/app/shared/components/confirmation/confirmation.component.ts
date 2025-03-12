import { Component } from '@angular/core';
import { ButtonGenericComponent } from '../button-generic/button-generic.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonGenericInterface } from '../../interfaces/buttons';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [ButtonGenericComponent],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',
})
export class ConfirmationComponent {
  buttons: ButtonGenericInterface = {
    css: 'flex flex-column md:flex-row md:justify-content-between gap-2',
    buttons: [
      {
        id: 1,
        icon: 'pi pi-times',
        label: 'Cancelar',
        severity: 'danger',
        action: () => this.ref.close(false),
      },
      {
        id: 2,
        icon: 'pi pi-check',
        label: 'Aceptar',
        severity: 'primary',
        action: () => this.ref.close(true),
      },
    ],
  };
  messages: string;
  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.messages = this.config.data.message;
  }
}
