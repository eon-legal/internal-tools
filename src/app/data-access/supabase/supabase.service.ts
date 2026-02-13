/**
 * Supabase Client Service
 *
 * Responsibilities:
 * - Initialize and provide Supabase client instance
 * - Centralize Supabase configuration from environment files
 * - Validate Supabase configuration on startup
 *
 * Dependencies:
 * - @supabase/supabase-js
 * - environment configuration (environment.ts or environment.prod.ts)
 *
 * Side Effects:
 * - Creates singleton Supabase client instance
 * - Logs connection info in development mode
 *
 * Invariants:
 * - Client is initialized once and reused
 * - Configuration comes from environment files (dev or prod based on build)
 * - Throws error if Supabase configuration is missing or invalid
 *
 * Auth Configuration (server-side, set via Supabase Management API):
 * - jwt_exp: 43200 (12h) — Access tokens expire every 12h; auto-refreshed by the client
 * - sessions_timebox: requires Pro Plan — enforced client-side in AuthService (24h cap)
 * - autoRefreshToken: true — Supabase JS client refreshes the JWT before expiry
 * - persistSession: true — Session is persisted in localStorage across page reloads
 *
 * Environment Configuration:
 * - Development: Uses src/environments/environment.ts
 * - Production: Uses src/environments/environment.prod.ts
 */

import { Injectable, isDevMode } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.validateSupabaseConfig();

    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
      {
        auth: {
          autoRefreshToken: true,   // Refresh JWT before it expires (12h server-side expiry)
          persistSession: true,     // Persist session in localStorage across page reloads
        },
      }
    );

    if (isDevMode()) {
      console.log(
        `[SupabaseService] Connected to Supabase (${environment.production ? 'PRODUCTION' : 'DEVELOPMENT'}):`,
        this.extractProjectId(environment.supabase.url)
      );
    }
  }

  /**
   * Get the Supabase client instance
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Check if Supabase is properly configured
   */
  isConfigured(): boolean {
    return (
      !!environment.supabase.url &&
      !environment.supabase.url.includes('YOUR_') &&
      !!environment.supabase.anonKey &&
      !environment.supabase.anonKey.includes('YOUR_')
    );
  }

  /**
   * Validate Supabase configuration and throw if invalid
   */
  private validateSupabaseConfig(): void {
    const { url, anonKey } = environment.supabase;

    if (!url || url.includes('YOUR_DEV_SUPABASE')) {
      throw new Error(
        'Supabase URL is not configured. ' +
          'Please update src/environments/environment.ts with your development Supabase project URL. ' +
          'See ENVIRONMENT_SETUP.md for instructions.'
      );
    }

    if (!anonKey || anonKey.includes('YOUR_DEV_SUPABASE')) {
      throw new Error(
        'Supabase anon key is not configured. ' +
          'Please update src/environments/environment.ts with your development Supabase anon key. ' +
          'See ENVIRONMENT_SETUP.md for instructions.'
      );
    }

    if (!url.includes('.supabase.co')) {
      console.warn(
        '[SupabaseService] Warning: Supabase URL does not appear to be a valid Supabase project URL:',
        url
      );
    }
  }

  /**
   * Extract project ID from Supabase URL for logging
   */
  private extractProjectId(url: string): string {
    const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
    return match?.[1] ?? 'unknown';
  }
}

