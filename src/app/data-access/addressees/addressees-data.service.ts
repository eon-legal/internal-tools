import { Injectable, inject } from '@angular/core';
import { Observable, from, map, catchError, throwError } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { 
  Addressee, 
  CreateAddresseeDto, 
  UpdateAddresseeDto 
} from '../../features/crud-addressee/interfaces/addressee';

/**
 * Data Access Service for Addressees (Recipients)
 * 
 * Provides CRUD operations for managing frequently used invoice recipients.
 * All methods return RxJS Observables for consistency with Angular patterns.
 * 
 * Responsibilities:
 * - Fetch all addressees or filter by search term
 * - Get a single addressee by ID
 * - Create new addressees
 * - Update existing addressees
 * - Delete addressees
 * 
 * Dependencies: SupabaseService
 * Side Effects: All operations modify the 'addressees' table in Supabase
 */
@Injectable({
  providedIn: 'root'
})
export class AddresseesDataService {
  private readonly supabase = inject(SupabaseService);

  /**
   * Fetches all addressees from Supabase
   * @param searchTerm Optional search term to filter by name_destination
   * @returns Observable of addressee array
   */
  getAddressees(searchTerm?: string): Observable<Addressee[]> {
    const client = this.supabase.getClient();
    let query = client
      .from('addressees')
      .select('*')
      .order('name_destination', { ascending: true });

    // Apply search filter if provided
    if (searchTerm) {
      query = query.ilike('name_destination', `%${searchTerm}%`);
    }

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(`Failed to fetch addressees: ${error.message}`);
        }
        return data || [];
      }),
      catchError((error) => {
        console.error('Error fetching addressees:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Fetches a single addressee by ID
   * @param id Addressee UUID
   * @returns Observable of addressee
   */
  getAddresseeById(id: string): Observable<Addressee> {
    const client = this.supabase.getClient();
    
    return from(
      client
        .from('addressees')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(`Failed to fetch addressee: ${error.message}`);
        }
        return data;
      }),
      catchError((error) => {
        console.error('Error fetching addressee by ID:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Creates a new addressee
   * @param addressee Addressee data to create
   * @returns Observable of created addressee
   */
  createAddressee(addressee: CreateAddresseeDto): Observable<Addressee> {
    const client = this.supabase.getClient();
    
    return from(
      client
        .from('addressees')
        .insert(addressee)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(`Failed to create addressee: ${error.message}`);
        }
        return data;
      }),
      catchError((error) => {
        console.error('Error creating addressee:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Updates an existing addressee
   * @param id Addressee UUID
   * @param updates Partial addressee data to update
   * @returns Observable of updated addressee
   */
  updateAddressee(id: string, updates: UpdateAddresseeDto): Observable<Addressee> {
    const client = this.supabase.getClient();
    
    return from(
      client
        .from('addressees')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(`Failed to update addressee: ${error.message}`);
        }
        return data;
      }),
      catchError((error) => {
        console.error('Error updating addressee:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Deletes an addressee
   * @param id Addressee UUID
   * @returns Observable that completes when deletion is successful
   */
  deleteAddressee(id: string): Observable<void> {
    const client = this.supabase.getClient();
    
    return from(
      client
        .from('addressees')
        .delete()
        .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw new Error(`Failed to delete addressee: ${error.message}`);
        }
      }),
      catchError((error) => {
        console.error('Error deleting addressee:', error);
        return throwError(() => error);
      })
    );
  }
}

