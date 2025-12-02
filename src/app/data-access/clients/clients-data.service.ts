/**
 * Clients Data Access Service
 *
 * Responsibilities:
 * - CRUD operations for clients (customers) in Supabase
 * - Manage default client selection
 * - Support both individual and company client types
 *
 * Business Rules:
 * - Only one client can be marked as default
 * - Default client is used when creating new invoices
 * - Clients are customers being invoiced (not the invoice issuer)
 *
 * Dependencies:
 * - SupabaseService for database access
 *
 * Side Effects:
 * - Performs database operations via Supabase
 * - Updates timestamps on client operations
 *
 * Invariants:
 * - Only one client has is_default = true
 * - Company clients must have company_name
 * - Individual clients must have first_name and last_name
 */

import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { Client, CreateClientDto, UpdateClientDto } from '../../features/invoices/interfaces/database-models';
import { from, Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ClientsDataService {
  private readonly supabase = inject(SupabaseService).getClient();

  /**
   * Get all clients
   */
  getClients(): Observable<Client[]> {
    return from(
      this.supabase.from('clients').select('*').order('created_at', { ascending: false })
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Client[];
      }),
      catchError((error) => {
        console.error('Error fetching clients:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get the default client
   */
  getDefaultClient(): Observable<Client | null> {
    return from(
      this.supabase
        .from('clients')
        .select('*')
        .eq('is_default', true)
        .maybeSingle()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Client | null;
      }),
      catchError((error) => {
        console.error('Error fetching default client:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single client by ID
   */
  getClientById(id: string): Observable<Client> {
    return from(
      this.supabase.from('clients').select('*').eq('id', id).single()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Client;
      }),
      catchError((error) => {
        console.error('Error fetching client:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new client
   */
  createClient(client: CreateClientDto): Observable<Client> {
    return from(
      this.supabase.from('clients').insert(client).select().single()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Client;
      }),
      catchError((error) => {
        console.error('Error creating client:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing client
   */
  updateClient(id: string, updates: UpdateClientDto): Observable<Client> {
    return from(
      this.supabase.from('clients').update(updates).eq('id', id).select().single()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Client;
      }),
      catchError((error) => {
        console.error('Error updating client:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a client by ID
   */
  deleteClient(id: string): Observable<void> {
    return from(this.supabase.from('clients').delete().eq('id', id)).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return undefined;
      }),
      catchError((error) => {
        console.error('Error deleting client:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Set a client as the default
   * This will unset any other default client
   */
  setDefaultClient(id: string): Observable<Client> {
    // First, unset all defaults
    return from(
      this.supabase.from('clients').update({ is_default: false }).neq('id', id)
    ).pipe(
      switchMap(() =>
        // Then set the new default
        from(
          this.supabase
            .from('clients')
            .update({ is_default: true })
            .eq('id', id)
            .select()
            .single()
        )
      ),
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Client;
      }),
      catchError((error) => {
        console.error('Error setting default client:', error);
        return throwError(() => error);
      })
    );
  }
}

