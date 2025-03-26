import { Component } from '@angular/core';
import { ButtonGenericComponent } from '../button-generic/button-generic.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonGenericInterface } from '../button-generic/interfaces/buttons';

/**
 * ConfirmationComponent is a reusable component designed to display a confirmation dialog.
 * It provides options to accept or cancel an action, using PrimeNG's DynamicDialog for modal functionality.
 */
@Component({
  selector: 'app-confirmation', // Selector for the component
  standalone: true, // Indicates that this is a standalone component
  imports: [ButtonGenericComponent], // Imports the ButtonGenericComponent for button functionality
  templateUrl: './confirmation.component.html', // Template for the component
  styleUrl: './confirmation.component.scss', // Styles for the component
})
export class ConfirmationComponent {
  /**
   * Configuration for the buttons displayed in the confirmation dialog.
   * Includes options to cancel or accept the action.
   * @type {ButtonGenericInterface}
   */
  buttons: ButtonGenericInterface = {
    css: 'flex flex-column md:flex-row md:justify-content-between gap-2', // CSS classes for button layout
    buttons: [
      {
        id: 1,
        icon: 'pi pi-times', // Icon for the cancel button
        label: 'Cancelar', // Label for the cancel button
        severity: 'danger', // Severity (danger style) for the cancel button
        action: () => this.ref.close(false), // Action to close the dialog with a false value
      },
      {
        id: 2,
        icon: 'pi pi-check', // Icon for the accept button
        label: 'Aceptar', // Label for the accept button
        severity: 'primary', // Severity (primary style) for the accept button
        action: () => this.ref.close(true), // Action to close the dialog with a true value
      },
    ],
  };

  /**
   * The message to display in the confirmation dialog.
   * @type {string}
   */
  messages: string;

  /**
   * Constructor for the ConfirmationComponent.
   * Initializes the dialog reference and configuration, and sets the confirmation message.
   * @param ref - Reference to the DynamicDialog for closing the dialog.
   * @param config - Configuration object passed to the dialog, containing the message.
   */
  constructor(
    public ref: DynamicDialogRef, // Reference to the DynamicDialog
    public config: DynamicDialogConfig // Configuration for the DynamicDialog
  ) {
    // Sets the confirmation message from the dialog configuration
    this.messages = this.config.data.message;
  }
}
