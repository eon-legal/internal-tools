import { inject, Injectable, Type } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  ModalConfig,
  ModalRef,
} from '../../components/button-generic/interfaces/buttons';
import { AppModalContainerComponent } from '../../components/app-modal-container/app-modal-container.component';
import { TEXT_ERROR_SERVICE } from './constant/text-error-service';

@Injectable({
  providedIn: 'root',
})
export class CustomModalService {
  private dialogService = inject(DialogService);

  open<T = any>(
    component: Type<T>,
    config: ModalConfig = {}
  ): { modalRef: DynamicDialogRef; modalServiceRef: ModalRef<T> } {
    if (!component) {
      throw new Error(TEXT_ERROR_SERVICE);
    }
    let componentInstance: T | undefined;
    const dialogRef = this.dialogService.open(AppModalContainerComponent, {
      header: config.title,
      focusOnShow: false,
      modal: true,
      closable: true,
      width: config.width || '50vw',
      contentStyle: {
        'max-height': '90vh',
        overflow: 'auto',
      },
      data: {
        component,
        config: {
          ...config,
          closable: config.closable !== false,
          registerInstance: (instance: T) => {
            componentInstance = instance;
          },
        },
      },
    });

    const modalServiceRef: ModalRef<T> = {
      close: (result?: any) => dialogRef.close(result),
      onClose: (callback: (result?: any) => void) => {
        dialogRef.onClose.subscribe(callback);
      },
      getInstance: () => {
        // Forzar la asignación de propiedades
        if (componentInstance && config.data) {
          Object.assign(componentInstance, config.data);
        }
        return componentInstance;
      },
    };

    return { modalRef: dialogRef, modalServiceRef };
  }
}
