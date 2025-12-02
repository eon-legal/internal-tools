/**
 * Invoices Data Access Service
 * 
 * Responsibilities:
 * - CRUD operations for invoices in Supabase
 * - Invoice number generation and validation
 * - Batch operations (mark as paid, delete)
 * - Filtering and querying invoices
 * 
 * Business Rules:
 * - Invoice numbers are auto-generated and cannot be manually set
 * - Invoice numbers follow format: EON-YY-LXXX
 * - created_at and updated_at are managed by database triggers
 * - last_download_at is updated when PDF is downloaded
 * 
 * Dependencies:
 * - SupabaseService for database access
 * - Invoice number generator for auto-generation
 * 
 * Side Effects:
 * - Performs database operations via Supabase
 * - Updates timestamps on invoice operations
 * 
 * Invariants:
 * - Invoice numbers are unique
 * - All timestamps are stored as UTC
 */

import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import {
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceFilters,
} from '../../features/invoices/interfaces/database-models';
import { generateNextInvoiceNumber } from '../../domain/invoices/invoice-number-generator';
import { from, Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class InvoicesDataService {
  private readonly supabase = inject(SupabaseService).getClient();

  /**
   * Get all invoices with optional filtering
   */
  getInvoices(filters?: InvoiceFilters): Observable<Invoice[]> {
    let query = this.supabase
      .from('invoices')
      .select('*')
      .order('invoice_date', { ascending: false });

    // Apply filters
    if (filters) {
      if (filters.start_date) {
        query = query.gte('invoice_date', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('invoice_date', filters.end_date);
      }
      if (filters.paid !== undefined) {
        query = query.eq('paid', filters.paid);
      }
      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }
      if (filters.search_term) {
        query = query.or(
          `invoice_number.ilike.%${filters.search_term}%,sender_name.ilike.%${filters.search_term}%,destination_name.ilike.%${filters.search_term}%`
        );
      }
    }

    return from(query).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Invoice[];
      }),
      catchError((error) => {
        console.error('Error fetching invoices:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single invoice by ID
   */
  getInvoiceById(id: string): Observable<Invoice> {
    return from(
      this.supabase.from('invoices').select('*').eq('id', id).single()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Invoice;
      }),
      catchError((error) => {
        console.error('Error fetching invoice:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get the last invoice number for the current year
   * Used for generating the next invoice number
   */
  private getLastInvoiceNumber(year?: number): Observable<string | null> {
    const currentYear = year ?? new Date().getFullYear();
    const twoDigitYear = currentYear.toString().slice(-2);
    const yearPrefix = `EON-${twoDigitYear}-`;

    return from(
      this.supabase
        .from('invoices')
        .select('invoice_number')
        .like('invoice_number', `${yearPrefix}%`)
        .order('invoice_number', { ascending: false })
        .limit(1)
        .maybeSingle()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data?.invoice_number ?? null;
      }),
      catchError((error) => {
        console.error('Error fetching last invoice number:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new invoice with auto-generated invoice number
   */
  createInvoice(invoiceData: CreateInvoiceDto): Observable<Invoice> {
    return this.getLastInvoiceNumber().pipe(
      switchMap((lastInvoiceNumber) => {
        const invoiceNumber = generateNextInvoiceNumber(lastInvoiceNumber);

        const newInvoice = {
          ...invoiceData,
          invoice_number: invoiceNumber,
          paid: false,
        };

        return from(
          this.supabase.from('invoices').insert(newInvoice).select().single()
        );
      }),
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Invoice;
      }),
      catchError((error) => {
        console.error('Error creating invoice:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing invoice
   * Note: invoice_number cannot be changed after creation
   */
  updateInvoice(id: string, updates: UpdateInvoiceDto): Observable<Invoice> {
    return from(
      this.supabase.from('invoices').update(updates).eq('id', id).select().single()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Invoice;
      }),
      catchError((error) => {
        console.error('Error updating invoice:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete an invoice by ID
   */
  deleteInvoice(id: string): Observable<void> {
    return from(this.supabase.from('invoices').delete().eq('id', id)).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return undefined;
      }),
      catchError((error) => {
        console.error('Error deleting invoice:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mark multiple invoices as paid
   */
  markInvoicesAsPaid(invoiceIds: string[]): Observable<Invoice[]> {
    return from(
      this.supabase
        .from('invoices')
        .update({ paid: true })
        .in('id', invoiceIds)
        .select()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Invoice[];
      }),
      catchError((error) => {
        console.error('Error marking invoices as paid:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update last_download_at timestamp for an invoice
   */
  updateDownloadTimestamp(id: string): Observable<Invoice> {
    const now = new Date().toISOString();
    return from(
      this.supabase
        .from('invoices')
        .update({ last_download_at: now })
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return response.data as Invoice;
      }),
      catchError((error) => {
        console.error('Error updating download timestamp:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete multiple invoices
   */
  deleteInvoices(invoiceIds: string[]): Observable<void> {
    return from(
      this.supabase.from('invoices').delete().in('id', invoiceIds)
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return undefined;
      }),
      catchError((error) => {
        console.error('Error deleting invoices:', error);
        return throwError(() => error);
      })
    );
  }
}
