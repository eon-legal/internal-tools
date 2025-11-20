/**
 * Invoice Data Presets Data Access Service
 * 
 * Responsibilities:
 * - CRUD operations for invoice data presets in Supabase
 * - Search and autocomplete functionality
 * - Track usage count for presets
 * 
 * Business Rules:
 * - Presets are sorted by usage count (most used first)
 * - Usage count increments when a preset is used
 * 
 * Dependencies:
 * - SupabaseService for database access
 * 
 * Side Effects:
 * - Performs database operations via Supabase
 * - Updates usage_count when presets are used
 */

import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { InvoiceDataPreset } from '../../features/invoices/interfaces/database-models';
import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class InvoicePresetsDataService {
  private readonly supabase = inject(SupabaseService).getClient();

  /**
   * Get all invoice data presets, sorted by usage count
   */
  getPresets(): Observable<InvoiceDataPreset[]> {
    return from(
      this.supabase
        .from('invoice_data_presets')
        .select('*')
        .order('usage_count', { ascending: false })
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as InvoiceDataPreset[];
      }),
      catchError((error) => {
        console.error('Error fetching invoice presets:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Search presets by description
   */
  searchPresets(searchTerm: string): Observable<InvoiceDataPreset[]> {
    return from(
      this.supabase
        .from('invoice_data_presets')
        .select('*')
        .ilike('description', `%${searchTerm}%`)
        .order('usage_count', { ascending: false })
        .limit(10)
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as InvoiceDataPreset[];
      }),
      catchError((error) => {
        console.error('Error searching invoice presets:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single preset by ID
   */
  getPresetById(id: string): Observable<InvoiceDataPreset> {
    return from(
      this.supabase.from('invoice_data_presets').select('*').eq('id', id).single()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as InvoiceDataPreset;
      }),
      catchError((error) => {
        console.error('Error fetching invoice preset:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new preset
   */
  createPreset(
    preset: Omit<InvoiceDataPreset, 'id' | 'created_at' | 'updated_at' | 'usage_count'>
  ): Observable<InvoiceDataPreset> {
    const newPreset = {
      ...preset,
      usage_count: 0,
    };

    return from(
      this.supabase.from('invoice_data_presets').insert(newPreset).select().single()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as InvoiceDataPreset;
      }),
      catchError((error) => {
        console.error('Error creating invoice preset:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing preset
   */
  updatePreset(id: string, updates: Partial<InvoiceDataPreset>): Observable<InvoiceDataPreset> {
    return from(
      this.supabase
        .from('invoice_data_presets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as InvoiceDataPreset;
      }),
      catchError((error) => {
        console.error('Error updating invoice preset:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a preset by ID
   */
  deletePreset(id: string): Observable<void> {
    return from(
      this.supabase.from('invoice_data_presets').delete().eq('id', id)
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return undefined;
      }),
      catchError((error) => {
        console.error('Error deleting invoice preset:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Increment usage count for a preset
   */
  incrementUsageCount(id: string): Observable<InvoiceDataPreset> {
    return from(
      this.supabase.rpc('increment_preset_usage', { preset_id: id })
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as InvoiceDataPreset;
      }),
      catchError((error) => {
        console.error('Error incrementing preset usage count:', error);
        return throwError(() => error);
      })
    );
  }
}

