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
      // Check if this is a parent item with children
      if (item.items) {
        let isChildActive = false;

        // Update child items' styleClass
        item.items.forEach((child) => {
          const childIsActive =
            child.routerLink && this.isRouteActive(currentUrl, child.routerLink[0]);
          child.styleClass = childIsActive ? 'p-menuitem-active' : '';
          if (childIsActive) {
            isChildActive = true;
          }
        });

        // Expand parent if child is active and apply parent-active style
        item.expanded = isChildActive;
        item.styleClass = isChildActive ? 'p-menuitem-parent-active' : '';
      } else {
        // Direct menu item without children
        const isActive =
          item.routerLink && this.isRouteActive(currentUrl, item.routerLink[0]);
        item.styleClass = isActive ? 'p-menuitem-active' : '';
      }
    });
  }

  /**
   * Checks if the current URL matches the given route.
   * Uses exact matching for better accuracy.
   */
  private isRouteActive(currentUrl: string, route: string): boolean {
    // Remove query params and fragments from current URL
    const cleanUrl = currentUrl.split('?')[0]?.split('#')[0] ?? currentUrl;
    // Check exact match or if it's a child route
    return cleanUrl === route || cleanUrl.startsWith(route + '/');
  }
}