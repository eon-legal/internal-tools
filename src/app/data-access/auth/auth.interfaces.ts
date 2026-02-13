/**
 * Authentication Interfaces
 *
 * Defines TypeScript interfaces for authentication-related data structures.
 * These interfaces wrap Supabase Auth types for better type safety and
 * abstraction from the underlying auth provider.
 */

import { User, Session } from '@supabase/supabase-js';

/**
 * Credentials for user login
 */
export interface LoginCredentials {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** Optional CAPTCHA token from Cloudflare Turnstile (production only) */
  captchaToken?: string;
}

/**
 * Credentials for user registration
 */
export interface RegisterCredentials {
  /** User's email address */
  email: string;
  /** User's password (minimum 6 characters required by Supabase) */
  password: string;
  /** Optional: Password confirmation for UI validation */
  confirmPassword?: string;
  /** Optional: User's display name (stored in Supabase user_metadata) */
  displayName?: string;
  /** Optional CAPTCHA token from Cloudflare Turnstile (production only) */
  captchaToken?: string;
}

/**
 * Result of an authentication operation
 */
export interface AuthResult {
  /** Whether the operation was successful */
  success: boolean;
  /** The authenticated user, if successful */
  user?: User | null;
  /** The session, if successful */
  session?: Session | null;
  /** Error message, if unsuccessful */
  error?: string;
  /** Error code for programmatic handling */
  errorCode?: string;
}

/**
 * Current authentication state
 */
export interface AuthState {
  /** Whether user is currently authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is being loaded/checked */
  isLoading: boolean;
  /** The current user, if authenticated */
  user: User | null;
  /** The current session, if authenticated */
  session: Session | null;
}

/**
 * User profile information extracted from Supabase User
 */
export interface UserProfile {
  /** User's unique ID */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name (from user_metadata) */
  displayName?: string;
  /** User's avatar URL (from user_metadata) */
  avatarUrl?: string;
  /** When the user account was created */
  createdAt: string;
  /** When the user last signed in */
  lastSignInAt?: string;
}

/**
 * Maps a Supabase User to a UserProfile
 */
export function mapUserToProfile(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email ?? '',
    displayName: user.user_metadata?.['display_name'] ?? user.user_metadata?.['full_name'],
    avatarUrl: user.user_metadata?.['avatar_url'],
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? undefined,
  };
}

