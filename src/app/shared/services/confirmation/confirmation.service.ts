import { inject, Injectable } from '@angular/core';
import { CustomDialogService } from '../modal/custom-dialog.service';
import { ConfirmationComponent } from '../../components/confirmation/confirmation.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private customDialogService: CustomDialogService = inject(CustomDialogService);
  openConfirmation(
    message: string = '¿Estás seguro de que deseas realizar esta acción?'
  ) {
    return this.customDialogService.openDialog(ConfirmationComponent, '', {
      message,
    });
  }
}
