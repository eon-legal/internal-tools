/**
 * Authentication Token Interceptor
 *
 * Responsibilities:
 * - Attach Supabase JWT (Authorization: Bearer <token>) to outgoing HTTP requests
 * - Skip token injection for Supabase Auth endpoints (handled by Supabase client)
 * - Skip token injection for public asset requests (i18n JSON files, etc.)
 * - Skip token injection for external webhook URLs (e.g. Rocket.Chat)
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
import { environment } from '../../../environments/environment';

/** URL patterns that should NOT receive the auth token */
const EXCLUDED_URL_PATTERNS = [
  '/auth/v1/',       // Supabase Auth endpoints (handled by Supabase client)
  '/assets/',        // Local assets (i18n JSON files, images, etc.)
];

/**
 * Derive the Rocket.Chat webhook host to exclude at runtime so that both
 * cloud-hosted (hooks.cloud.rocket.chat) and self-hosted instances are covered.
 */
function getRocketChatHost(): string | null {
  try {
    const url = environment.rocketchat?.webhookUrl;
    if (!url) return null;
    return new URL(url).host;
  } catch {
    return null;
  }
}

/**
 * Functional interceptor that attaches the Supabase JWT to outgoing HTTP requests.
 * Skips requests to Supabase Auth endpoints and local assets.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Build dynamic exclusion list (adds Rocket.Chat host when configured)
  const rocketChatHost = getRocketChatHost();
  const allExcluded = rocketChatHost
    ? [...EXCLUDED_URL_PATTERNS, rocketChatHost]
    : EXCLUDED_URL_PATTERNS;

  // Skip excluded URLs
  const shouldSkip = allExcluded.some((pattern) =>
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

