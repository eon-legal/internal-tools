/**
 * Authentication Service
 *
 * Responsibilities:
 * - Handle user authentication via Supabase Auth (login, registration, logout)
 * - Manage authentication state as reactive signals
 * - Persist and restore session across page reloads
 * - Provide user profile information
 *
 * Dependencies:
 * - SupabaseService for Supabase client access
 * - Environment configuration for registration toggle
 *
 * Side Effects:
 * - Stores session in Supabase's localStorage
 * - Emits auth state changes via signals
 *
 * Invariants:
 * - Registration is only allowed when environment.auth.registrationEnabled is true
 * - Login is always available regardless of registration flag
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
   * Initialize auth state by checking current session and subscribing to auth changes
   */
  private async initializeAuth(): Promise<void> {
    // Get current session
    const { data: { session } } = await this.supabase.auth.getSession();
    this.updateAuthState(session);

    // Subscribe to auth state changes
    this.supabase.auth.onAuthStateChange((_event, session) => {
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
      });

      if (error) {
        const parsed = this.parseAuthError(error);
        return { success: false, error: parsed.message, errorCode: parsed.code };
      }

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
   * Sign out the current user
   */
  async signOut(): Promise<AuthResult> {
    try {
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

