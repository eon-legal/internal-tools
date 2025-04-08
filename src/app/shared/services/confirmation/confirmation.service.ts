import { inject, Injectable } from '@angular/core';
import { ConfirmationComponent } from '../../components/confirmation/confirmation.component';
import { CustomModalService } from '../custom-modal/custom-modal.service';

/**
 * ConfirmationService is a service that provides a simple way to open a confirmation dialog.
 * It uses the CustomModalService to display a confirmation dialog with a customizable message.
 */
@Injectable({
  providedIn: 'root', // Makes the service available application-wide
})
export class ConfirmationService {
  /** Injected service for managing custom dialogs */
  customModalService: CustomModalService = inject(CustomModalService);

  /**
   * Opens a confirmation dialog with a customizable message.
   * @param message - The message to display in the confirmation dialog.
   * @default '¿Estás seguro de que deseas realizar esta acción?' (Are you sure you want to perform this action?)
   * @returns {DynamicDialogRef} - A reference to the opened confirmation dialog.
   */
  openConfirmation(
    message: string = '¿Estás seguro de que deseas realizar esta acción?'
  ) {
    const { modalServiceRef } = this.customModalService.open(
      ConfirmationComponent,
      {
        title: '',
        data: { message },
        buttons: {
          css: 'flex flex-column md:flex-row md:justify-content-between gap-2',
          buttons: [
            {
              id: 1,
              icon: 'pi pi-times',
              label: 'Cancelar',
              severity: 'danger',
              action: () => modalServiceRef.close(false),
            },
            {
              id: 2,
              icon: 'pi pi-check',
              label: 'Aceptar',
              severity: 'primary',
              action: () => modalServiceRef.close(true),
            },
          ],
        },
      }
    );
    return modalServiceRef;
  }
}
