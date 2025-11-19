import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ButtonModule } from 'primeng/button';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ContainComponent } from '../contain/contain.component';
import { MenuItem } from 'primeng/api';
import { NavigationEnd, Router } from '@angular/router';
import { getMenuItems } from '../../constants/routes';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

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
export class LayoutComponent implements OnInit, OnDestroy {
  /** Controls the visibility of the mobile menu */
  isMenuOpen = false;

  /** Array of menu items with translated labels */
  menuItems: MenuItem[] = [];

  /** Injects the Angular Router service to monitor URL changes */
  private readonly router = inject(Router);

  /** Injects the TranslateService for i18n support */
  private readonly translate = inject(TranslateService);

  /** Subscription to language change events */
  private langChangeSubscription?: Subscription;

  /**
   * Angular lifecycle hook that runs when the component is initialized.
   * Initializes menu items with translations and subscribes to language and router events.
   */
  ngOnInit(): void {
    // Initialize menu items with current language
    this.menuItems = getMenuItems(this.translate);

    // Updates the menu state with the current URL on initialization
    this.updateMenuState(this.router.url);

    // Listens for URL changes and updates the menu state dynamically
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateMenuState(event.url);
      }
    });

    // Subscribe to language changes to update menu labels
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      const currentUrl = this.router.url;
      this.menuItems = getMenuItems(this.translate);
      this.updateMenuState(currentUrl);
    });
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Cleans up subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.langChangeSubscription?.unsubscribe();
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