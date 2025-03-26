import { Component, Input } from '@angular/core';
import { MessageModule } from 'primeng/message';

/**
 * MessagesComponent is a reusable component designed to display error messages.
 * It uses PrimeNG's MessageModule to render messages in a consistent and visually appealing way.
 */
@Component({
  selector: 'app-messages', // Selector for the component
  standalone: true, // Indicates that this is a standalone component
  imports: [MessageModule], // Imports PrimeNG's MessageModule for message display
  templateUrl: './messages.component.html', // Template for the component
  styleUrl: './messages.component.scss', // Styles for the component
})
export class MessagesComponent {
  /**
   * Input property to receive the error message to be displayed.
   * @type {string}
   * @default '' (empty string)
   */
  @Input() errorMessage: string = '';
}
