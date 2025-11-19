import { inject, Injectable } from '@angular/core';
import { ConfirmationComponent } from '../../components/confirmation/confirmation.component';
import { CustomModalService } from '../custom-modal/custom-modal.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * ConfirmationService is a service that provides a simple way to open a confirmation dialog.
 * It uses the CustomModalService to display a confirmation dialog with a customizable message.
 */
@Injectable({
  providedIn: 'root', // Makes the service available application-wide
})
export class ConfirmationService {
  /** Injected service for managing custom dialogs */
  private readonly customModalService = inject(CustomModalService);

  /** Injected service for i18n support */
  private readonly translate = inject(TranslateService);

  /**
   * Opens a confirmation dialog with a customizable message.
   * @param message - The message to display in the confirmation dialog.
   * If not provided, uses the default confirmation message from translations.
   * @returns {DynamicDialogRef} - A reference to the opened confirmation dialog.
   */
  openConfirmation(message?: string) {
    const confirmMessage = message || this.translate.instant('common.messages.confirm_action');

    const { modalServiceRef } = this.customModalService.open(
      ConfirmationComponent,
      {
        title: '',
        data: { message: confirmMessage },
        buttons: {
          css: 'flex flex-column md:flex-row md:justify-content-between gap-2',
          buttons: [
            {
              id: 1,
              icon: 'pi pi-times',
              label: this.translate.instant('common.buttons.cancel'),
              severity: 'danger',
              action: () => modalServiceRef.close(false),
            },
            {
              id: 2,
              icon: 'pi pi-check',
              label: this.translate.instant('common.buttons.accept'),
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
