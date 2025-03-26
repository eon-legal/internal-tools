import { Injectable } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

/**
 * CustomDialogService is a service that provides a wrapper around PrimeNG's DynamicDialog.
 * It simplifies the process of opening and closing modal dialogs in the application.
 */
@Injectable({
  providedIn: 'root', // Makes the service available application-wide
})
export class CustomDialogService {
  /**
   * Reference to the currently open dialog.
   * @type {DynamicDialogRef | null}
   */
  private dialogRef: DynamicDialogRef | null = null;

  /**
   * Constructor for the CustomDialogService.
   * @param dialogService - PrimeNG's DialogService for managing dynamic dialogs.
   */
  constructor(private dialogService: DialogService) {}

  /**
   * Opens a modal dialog with the specified component, header, and optional data.
   * @param component - The component to display inside the dialog.
   * @param header - The header text for the dialog.
   * @param data - Optional data to pass to the dialog component.
   * @returns {DynamicDialogRef} - A reference to the opened dialog.
   */
  openDialog(component: any, header: string, data?: any) {
    this.dialogRef = this.dialogService.open(component, {
      header, // Sets the header text for the dialog
      /*width: '70%', // Uncomment to set a custom width
      contentStyle: { overflow: 'auto' }, // Uncomment to enable scrolling */
      baseZIndex: 10000, // Sets the base z-index for the dialog
      data: data || {}, // Passes data to the dialog component
      focusOnShow: false, // Disables auto-focus on the dialog when it opens
      modal: true, // Enables modal behavior (blocks interaction with the rest of the app)
      closable: true, // Shows the close button in the top-right corner
    });

    return this.dialogRef; // Returns the reference to the opened dialog
  }

  /**
   * Closes the currently open dialog.
   */
  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close(); // Closes the dialog
      this.dialogRef = null; // Resets the dialog reference
    }
  }
}