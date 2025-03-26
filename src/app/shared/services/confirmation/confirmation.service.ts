import { inject, Injectable } from '@angular/core';
import { CustomDialogService } from '../modal/custom-dialog.service';
import { ConfirmationComponent } from '../../components/confirmation/confirmation.component';

/**
 * ConfirmationService is a service that provides a simple way to open a confirmation dialog.
 * It uses the CustomDialogService to display a confirmation dialog with a customizable message.
 */
@Injectable({
  providedIn: 'root', // Makes the service available application-wide
})
export class ConfirmationService {
  /**
   * Injects the CustomDialogService to handle the opening and closing of dialogs.
   * @type {CustomDialogService}
   */
  private customDialogService: CustomDialogService = inject(CustomDialogService);

  /**
   * Opens a confirmation dialog with a customizable message.
   * @param message - The message to display in the confirmation dialog.
   * @default '¿Estás seguro de que deseas realizar esta acción?' (Are you sure you want to perform this action?)
   * @returns {DynamicDialogRef} - A reference to the opened confirmation dialog.
   */
  openConfirmation(
    message: string = '¿Estás seguro de que deseas realizar esta acción?'
  ) {
    return this.customDialogService.openDialog(ConfirmationComponent, '', {
      message, // Passes the message to the confirmation dialog
    });
  }
}
