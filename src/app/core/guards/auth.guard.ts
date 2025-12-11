/**
 * Authentication Guard
 *
 * Responsibilities:
 * - Protect routes that require authentication
 * - Redirect unauthenticated users to login page
 * - Preserve intended destination for post-login redirect
 *
 * Dependencies:
 * - AuthService for authentication state
 * - Router for navigation
 *
 * Usage:
 * Add to route configuration:
 * { path: 'protected', component: ProtectedComponent, canActivate: [authGuard] }
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../data-access/auth/auth.service';

/**
 * Functional guard that protects routes requiring authentication.
 * Redirects to /login if user is not authenticated.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If still loading auth state, wait for it
  if (authService.isLoading()) {
    // Return a promise that resolves once auth is loaded
    return new Promise((resolve) => {
      const checkAuth = setInterval(() => {
        if (!authService.isLoading()) {
          clearInterval(checkAuth);
          if (authService.isAuthenticated()) {
            resolve(true);
          } else {
            router.navigate(['/login'], {
              queryParams: { returnUrl: state.url },
            });
            resolve(false);
          }
        }
      }, 50);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkAuth);
        router.navigate(['/login']);
        resolve(false);
      }, 5000);
    });
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });

  return false;
};

/**
 * Guard that prevents authenticated users from accessing auth pages (login/register).
 * Redirects authenticated users to the home page.
 */
export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If still loading auth state, wait for it
  if (authService.isLoading()) {
    return new Promise((resolve) => {
      const checkAuth = setInterval(() => {
        if (!authService.isLoading()) {
          clearInterval(checkAuth);
          if (authService.isAuthenticated()) {
            router.navigate(['/']);
            resolve(false);
          } else {
            resolve(true);
          }
        }
      }, 50);

      // Timeout after 5 seconds - allow access
      setTimeout(() => {
        clearInterval(checkAuth);
        resolve(true);
      }, 5000);
    });
  }

  if (authService.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};

/**
 * Guard that checks if registration is enabled.
 * Redirects to login if registration is disabled.
 */
export const registrationGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isRegistrationEnabled) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

