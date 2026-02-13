/**
 * Authentication Service
 *
 * Responsibilities:
 * - Handle user authentication via Supabase Auth (login, registration, logout)
 * - Manage authentication state as reactive signals
 * - Persist and restore session across page reloads
 * - Provide user profile information
 * - Enforce 24h maximum session lifetime (client-side fallback)
 *
 * Dependencies:
 * - SupabaseService for Supabase client access
 * - Environment configuration for registration toggle
 *
 * Side Effects:
 * - Stores session in Supabase's localStorage
 * - Stores session start timestamp in localStorage for 24h cap enforcement
 * - Emits auth state changes via signals
 *
 * Invariants:
 * - Registration is only allowed when environment.auth.registrationEnabled is true
 * - Login is always available regardless of registration flag
 * - Sessions are capped at 24h via client-side enforcement (server-side sessions_timebox
 *   requires Supabase Pro Plan). Access tokens (JWT) expire every 12h and are auto-refreshed
 *   by the Supabase client. The 24h cap is a best-effort client-side check — the real
 *   security boundary is the server-enforced 12h JWT expiry.
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { environment } from '../../../environments/environment';
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResult,
  AuthState,
  UserProfile,
  mapUserToProfile,
} from './auth.interfaces';
import { User, Session, AuthError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly supabase = inject(SupabaseService).getClient();

  /** Maximum session duration: 24 hours in milliseconds */
  private readonly SESSION_MAX_DURATION_MS = 24 * 60 * 60 * 1000;
  /** localStorage key for tracking when the session started */
  private readonly SESSION_START_KEY = 'sessionStartedAt';

  /** Internal auth state signal */
  private readonly authState = signal<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    session: null,
  });

  /** Whether user is currently authenticated */
  readonly isAuthenticated = computed(() => this.authState().isAuthenticated);

  /** Whether auth state is being loaded */
  readonly isLoading = computed(() => this.authState().isLoading);

  /** Current user, if authenticated */
  readonly currentUser = computed(() => this.authState().user);

  /** Current session, if authenticated */
  readonly currentSession = computed(() => this.authState().session);

  /** User profile derived from current user */
  readonly userProfile = computed<UserProfile | null>(() => {
    const user = this.authState().user;
    return user ? mapUserToProfile(user) : null;
  });

  /** Whether registration is enabled */
  readonly isRegistrationEnabled = environment.auth.registrationEnabled;

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize auth state by checking current session and subscribing to auth changes.
   * Enforces the 24h session cap on startup and on every token refresh.
   */
  private async initializeAuth(): Promise<void> {
    // Get current session
    const { data: { session } } = await this.supabase.auth.getSession();

    // Enforce 24h session cap on app startup
    if (session && this.isSessionExpiredByTimeCap()) {
      await this.signOut();
      return;
    }

    this.updateAuthState(session);

    // Subscribe to auth state changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      // On token refresh, re-check the 24h cap
      if (event === 'TOKEN_REFRESHED' && this.isSessionExpiredByTimeCap()) {
        this.signOut();
        return;
      }
      this.updateAuthState(session);
    });
  }

  /**
   * Update the auth state signal
   */
  private updateAuthState(session: Session | null): void {
    this.authState.set({
      isAuthenticated: !!session?.user,
      isLoading: false,
      user: session?.user ?? null,
      session: session,
    });
  }

  /**
   * Parse Supabase auth error to user-friendly message key
   */
  private parseAuthError(error: AuthError): { message: string; code: string } {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'auth.errors.invalid_credentials',
      'Email not confirmed': 'auth.errors.email_not_confirmed',
      'User already registered': 'auth.errors.email_already_registered',
      'Password should be at least 6 characters': 'auth.errors.password_too_short',
      'Unable to validate email address: invalid format': 'auth.errors.invalid_email',
    };

    const messageKey = errorMap[error.message] ?? 'auth.errors.unknown';
    return { message: messageKey, code: error.code ?? 'unknown' };
  }

  /**
   * Sign in with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
        options: credentials.captchaToken
          ? { captchaToken: credentials.captchaToken }
          : undefined,
      });

      if (error) {
        const parsed = this.parseAuthError(error);
        return { success: false, error: parsed.message, errorCode: parsed.code };
      }

      // Record session start time for 24h cap enforcement
      localStorage.setItem(this.SESSION_START_KEY, Date.now().toString());

      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      return { success: false, error: 'auth.errors.unknown', errorCode: 'exception' };
    }
  }

  /**
   * Register a new user with email and password
   * Only available when registrationEnabled is true
   */
  async signUp(credentials: RegisterCredentials): Promise<AuthResult> {
    if (!this.isRegistrationEnabled) {
      return {
        success: false,
        error: 'auth.errors.registration_disabled',
        errorCode: 'registration_disabled',
      };
    }

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: credentials.displayName
          ? { data: { display_name: credentials.displayName } }
          : undefined,
      });

      if (error) {
        const parsed = this.parseAuthError(error);
        return { success: false, error: parsed.message, errorCode: parsed.code };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return {
          success: true,
          user: data.user,
          session: null,
          error: 'auth.messages.check_email_confirmation',
        };
      }

      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      return { success: false, error: 'auth.errors.unknown', errorCode: 'exception' };
    }
  }

  /**
   * Sign out the current user and clear session tracking data
   */
  async signOut(): Promise<AuthResult> {
    try {
      localStorage.removeItem(this.SESSION_START_KEY);
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        const parsed = this.parseAuthError(error);
        return { success: false, error: parsed.message, errorCode: parsed.code };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'auth.errors.unknown', errorCode: 'exception' };
    }
  }

  /**
   * Check if user has a valid session
   */
  async checkSession(): Promise<boolean> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return !!session;
  }

  /**
   * Check whether the current session has exceeded the 24h maximum lifetime.
   * This is a client-side fallback since Supabase sessions_timebox requires Pro Plan.
   * Returns false if no session start timestamp is found (e.g. pre-existing sessions).
   */
  private isSessionExpiredByTimeCap(): boolean {
    const sessionStart = localStorage.getItem(this.SESSION_START_KEY);
    if (!sessionStart) return false;
    const elapsed = Date.now() - parseInt(sessionStart, 10);
    return elapsed > this.SESSION_MAX_DURATION_MS;
  }

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();

      if (error) {
        const parsed = this.parseAuthError(error);
        return { success: false, error: parsed.message, errorCode: parsed.code };
      }

      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      return { success: false, error: 'auth.errors.unknown', errorCode: 'exception' };
    }
  }
}

