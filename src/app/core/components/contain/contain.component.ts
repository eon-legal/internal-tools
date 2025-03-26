import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * ContainComponent is a reusable component that acts as a container for the main content.
 * It receives the state of the menu (open or closed) as an input to adjust its layout accordingly.
 */
@Component({
  selector: 'app-contain',
  standalone: true,
  imports: [RouterModule], // Imports RouterModule for routing functionality
  templateUrl: './contain.component.html', // Template for the container
  styleUrl: './contain.component.scss', // Styles for the container
})
export class ContainComponent {
  /**
   * Input property to receive the state of the menu (open or closed).
   * This is used to adjust the layout of the container based on the menu state.
   * @type {boolean}
   */
  @Input() isMenuOpen = false;
}