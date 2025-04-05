import { Injectable, Type } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  ModalConfig,
  ModalRef,
} from '../components/button-generic/interfaces/buttons';
import { ModalContainerComponent } from './app-modal-container/app-modal-container.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor(private dialogService: DialogService) {}

  open<T = any>(
    component: Type<T>,
    config: ModalConfig = {}
  ): { modalRef: DynamicDialogRef; modalServiceRef: ModalRef<T> } {
    if (!component) {
      throw new Error('Debe proporcionar un componente válido para el modal');
    }

    let componentInstance: T | undefined;
    const dialogRef = this.dialogService.open(ModalContainerComponent, {
      header: config.title,
      focusOnShow: false, // Disables auto-focus on the dialog when it opens
      modal: true, // Enables modal behavior (blocks interaction with the rest of the app)
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
