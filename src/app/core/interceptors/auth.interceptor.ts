/**
 * Authentication Token Interceptor
 *
 * Responsibilities:
 * - Attach Supabase JWT (Authorization: Bearer <token>) to outgoing HTTP requests
 * - Skip token injection for Supabase Auth endpoints (handled by Supabase client)
 * - Skip token injection for public asset requests (i18n JSON files, etc.)
 *
 * Dependencies:
 * - AuthService for current session access
 *
 * Side Effects:
 * - Clones and modifies outgoing HTTP requests to include Authorization header
 *
 * Invariants:
 * - Only attaches token when a valid session with access_token exists
 * - Never modifies requests to Supabase Auth REST endpoints
 * - Never modifies requests for local assets
 */

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../data-access/auth/auth.service';

/** URL patterns that should NOT receive the auth token */
const EXCLUDED_URL_PATTERNS = [
  '/auth/v1/',       // Supabase Auth endpoints (handled by Supabase client)
  '/assets/',        // Local assets (i18n JSON files, images, etc.)
];

/**
 * Functional interceptor that attaches the Supabase JWT to outgoing HTTP requests.
 * Skips requests to Supabase Auth endpoints and local assets.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip excluded URLs
  const shouldSkip = EXCLUDED_URL_PATTERNS.some((pattern) =>
    req.url.includes(pattern)
  );

  if (shouldSkip) {
    return next(req);
  }

  // Get the current session's access token
  const session = authService.currentSession();
  const accessToken = session?.access_token;

  if (accessToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};

