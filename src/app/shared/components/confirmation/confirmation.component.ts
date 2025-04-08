import { Component, Input } from '@angular/core';
/**
 * ConfirmationComponent is a reusable component designed to display a confirmation dialog.
 * It provides options to accept or cancel an action, using PrimeNG's DynamicDialog for modal functionality.
 */
@Component({
  selector: 'app-confirmation', // Selector for the component
  standalone: true, // Indicates that this is a standalone component
  imports: [], // Imports the ButtonGenericComponent for button functionality
  templateUrl: './confirmation.component.html', // Template for the component
  styleUrl: './confirmation.component.scss', // Styles for the component
})
export class ConfirmationComponent {
  /**
   * The message to display in the confirmation dialog.
   * @type {string}
   */
  @Input() message!: string;

}
