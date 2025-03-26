import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';

/**
 * SidebarComponent is a reusable component that displays a sidebar menu.
 * It receives the menu state and items as inputs and emits an event when the sidebar is closed.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [PanelMenuModule], // Imports necessary modules for the sidebar
  templateUrl: './sidebar.component.html', // Template for the sidebar
  styleUrl: './sidebar.component.scss', // Styles for the sidebar
})
export class SidebarComponent {
  /**
   * Input property to receive the state of the sidebar (open or closed).
   * @type {boolean}
   */
  @Input() isOpen = false;

  /**
   * Input property to receive the menu items to be displayed in the sidebar.
   * @type {MenuItem[]}
   */
  @Input() menuItems: MenuItem[] = [];

  /**
   * Output property to emit an event when the sidebar is closed.
   * @type {EventEmitter<void>}
   */
  @Output() close = new EventEmitter<void>();
}