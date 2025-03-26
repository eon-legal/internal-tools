import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';

/**
 * HeaderComponent is a reusable component that represents the header of the application.
 * It provides functionality to toggle the menu state by emitting an event.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonModule, SplitButtonModule], // Imports PrimeNG button modules for UI components
  templateUrl: './header.component.html', // Template for the header
  styleUrl: './header.component.scss', // Styles for the header
})
export class HeaderComponent {
  /**
   * Output property to emit an event when the menu is toggled.
   * This event can be used by parent components to handle the menu state.
   * @type {EventEmitter<void>}
   */
  @Output() toggleMenu = new EventEmitter<void>();
}
