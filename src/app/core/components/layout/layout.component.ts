import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ButtonModule } from 'primeng/button';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ContainComponent } from '../contain/contain.component';
import { MenuItem } from 'primeng/api';
import { NavigationEnd, Router } from '@angular/router';
import { MENU_ITEMS } from '../../constants/routes';

/**
 * LayoutComponent is the main layout structure of the application.
 * It integrates a header, sidebar, and content area using child components.
 * It also manages the state of menu items based on the current URL.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    SplitButtonModule,
    ButtonModule,
    HeaderComponent,
    SidebarComponent,
    ContainComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit{
   /** Controls the visibility of the mobile menu */
  isMenuOpen = false;

   /** Array of menu items imported from the MENU_ITEMS constant */
  menuItems: MenuItem[] = MENU_ITEMS;

   /** Injects the Angular Router service to monitor URL changes */
   router = inject(Router);

  /**
   * Angular lifecycle hook that runs when the component is initialized.
   * Updates the menu state with the current URL and listens for URL changes.
   */
  ngOnInit(): void {
    // Updates the menu state with the current URL on initialization
    this.updateMenuState(this.router.url);

    // Listens for URL changes and updates the menu state dynamically
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateMenuState(event.url);
      }
    });
  }

  /**
   * Updates the state of menu items based on the current URL.
   * @param currentUrl - The current URL of the application.
   */
  private updateMenuState(currentUrl: string): void {
    this.menuItems.forEach((item) => {
      // Checks if the menu item matches the current URL
      const isActive = item.routerLink && currentUrl.startsWith(item.routerLink[0]);

      // Adds or removes the 'p-menuitem-active' class to highlight the active menu item
      if (isActive) {
        item.styleClass = 'p-menuitem-active';
      } else {
        item.styleClass = '';
      }

      // Checks if any child menu item matches the current URL
      if (item.items) {
        const isChildActive = item.items.some(
          (child) =>
            child.routerLink && currentUrl.startsWith(child.routerLink[0])
        );
        item.expanded = isChildActive; // Expands or collapses the parent menu item

        // Adds or removes the 'p-menuitem-parent-active' class for active parent items
        if (isChildActive) {
          item.styleClass = 'p-menuitem-parent-active';
        } else {
          item.styleClass = '';
        }
      }
    });
  }
}