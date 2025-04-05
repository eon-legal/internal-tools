import { Injectable } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Injectable({ providedIn: 'root' })
export class CustomDialogService {
  private dialogRef: DynamicDialogRef | null = null;
  private currentDialogData: any = {}; // Almacena los datos temporalmente

  constructor(private dialogService: DialogService) {}

  // Almacena los datos antes de abrir el diálogo
  setDialogData(data: any) {
    this.currentDialogData = data;
  }

  // Obtiene los datos actuales (para el componente del diálogo)
  getDialogData() {
    return this.currentDialogData;
  }

  openDialog(component: any, header: string, data?: any) {
    if (data) {
      this.setDialogData(data);
    }

    this.dialogRef = this.dialogService.open(component, {
      header,
      baseZIndex: 10000,
      data: data || {}, // No necesitamos pasar datos aquí ahora
      focusOnShow: false,
      modal: true,
      closable: true,
    });

    return this.dialogRef;
  }

  closeDialog(data: any = undefined) {
    if (this.dialogRef) {
      this.dialogRef.close(data);
      this.dialogRef = null;
      this.currentDialogData = {}; // Limpia los datos al cerrar
    }
  }
}
