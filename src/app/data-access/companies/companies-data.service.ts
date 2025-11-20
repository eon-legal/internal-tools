/**
 * Companies Data Access Service
 * 
 * Responsibilities:
 * - CRUD operations for companies in Supabase
 * - Manage default company selection
 * 
 * Business Rules:
 * - Only one company can be marked as default
 * - Default company is used when creating new invoices
 * 
 * Dependencies:
 * - SupabaseService for database access
 * 
 * Side Effects:
 * - Performs database operations via Supabase
 * - Updates timestamps on company operations
 * 
 * Invariants:
 * - Only one company has is_default = true
 */

import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { Company } from '../../features/invoices/interfaces/database-models';
import { from, Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CompaniesDataService {
  private readonly supabase = inject(SupabaseService).getClient();

  /**
   * Get all companies
   */
  getCompanies(): Observable<Company[]> {
    return from(
      this.supabase.from('companies').select('*').order('name', { ascending: true })
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Company[];
      }),
      catchError((error) => {
        console.error('Error fetching companies:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get the default company
   */
  getDefaultCompany(): Observable<Company | null> {
    return from(
      this.supabase
        .from('companies')
        .select('*')
        .eq('is_default', true)
        .maybeSingle()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Company | null;
      }),
      catchError((error) => {
        console.error('Error fetching default company:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single company by ID
   */
  getCompanyById(id: string): Observable<Company> {
    return from(
      this.supabase.from('companies').select('*').eq('id', id).single()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Company;
      }),
      catchError((error) => {
        console.error('Error fetching company:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new company
   */
  createCompany(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Observable<Company> {
    return from(
      this.supabase.from('companies').insert(company).select().single()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Company;
      }),
      catchError((error) => {
        console.error('Error creating company:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing company
   */
  updateCompany(id: string, updates: Partial<Company>): Observable<Company> {
    return from(
      this.supabase.from('companies').update(updates).eq('id', id).select().single()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Company;
      }),
      catchError((error) => {
        console.error('Error updating company:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a company by ID
   */
  deleteCompany(id: string): Observable<void> {
    return from(this.supabase.from('companies').delete().eq('id', id)).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return undefined;
      }),
      catchError((error) => {
        console.error('Error deleting company:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Set a company as the default
   * This will unset any other default company
   */
  setDefaultCompany(id: string): Observable<Company> {
    // First, unset all defaults
    return from(
      this.supabase.from('companies').update({ is_default: false }).neq('id', id)
    ).pipe(
      switchMap(() =>
        // Then set the new default
        from(
          this.supabase
            .from('companies')
            .update({ is_default: true })
            .eq('id', id)
            .select()
            .single()
        )
      ),
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Company;
      }),
      catchError((error) => {
        console.error('Error setting default company:', error);
        return throwError(() => error);
      })
    );
  }
}

