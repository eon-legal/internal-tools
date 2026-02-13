import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * ContainComponent is a reusable component that acts as a container for the main content.
 * It receives the state of the menu (open or closed) as an input to adjust its layout accordingly.
 * It also detects the current route to apply transparent styling on the dashboard page.
 */
@Component({
  selector: 'app-contain',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './contain.component.html',
  styleUrl: './contain.component.scss',
})
export class ContainComponent implements OnInit, OnDestroy {
  /**
   * Input property to receive the state of the menu (open or closed).
   * This is used to adjust the layout of the container based on the menu state.
   */
  @Input() isMenuOpen = false;

  /** Whether the current route is the dashboard (transparent wrapper). */
  isDashboard = false;

  private readonly router = inject(Router);
  private routerSubscription?: Subscription;

  ngOnInit(): void {
    // Check initial route
    this.isDashboard = this.router.url === '/dashboard';

    // Listen for route changes
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.isDashboard = (event as NavigationEnd).urlAfterRedirects === '/dashboard';
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }
}