/**
 * Supabase Client Service
 * 
 * Responsibilities:
 * - Initialize and provide Supabase client instance
 * - Centralize Supabase configuration
 * 
 * Dependencies:
 * - @supabase/supabase-js
 * - environment configuration
 * 
 * Side Effects:
 * - Creates singleton Supabase client instance
 * 
 * Invariants:
 * - Client is initialized once and reused
 * - Configuration comes from environment files
 */

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  /**
   * Get the Supabase client instance
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}

