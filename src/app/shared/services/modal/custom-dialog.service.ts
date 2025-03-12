import { Injectable } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Injectable({
  providedIn: 'root',
})
export class CustomDialogService {
  private dialogRef: DynamicDialogRef | null = null;

  constructor(private dialogService: DialogService) {}

  openDialog(component: any, header: string, data?: any) {
    this.dialogRef = this.dialogService.open(component, {
      header,
      /*width: '70%', 
      contentStyle: { overflow: 'auto' },*/
      baseZIndex: 10000,
      data: data || {},
      focusOnShow: false,
      modal: true, // Activa el modo modal
      closable: true, // Muestra el botón de cierre en la esquina superior derecha
    });

    return this.dialogRef;
  }

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }
}
