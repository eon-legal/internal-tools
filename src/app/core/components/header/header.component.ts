import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

/**
 * HeaderComponent is a reusable component that represents the header of the application.
 * It provides functionality to toggle the menu state and switch languages.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonModule, SplitButtonModule, LanguageSwitcherComponent], // Imports PrimeNG button modules and language switcher
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
