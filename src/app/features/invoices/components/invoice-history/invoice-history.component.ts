/**
 * Invoice History Component
 * 
 * Responsibilities:
 * - Display list of all invoices in a table
 * - Provide filtering by date range, search, and paid status
 * - Enable batch selection and operations (download, mark as paid, delete)
 * - Handle individual invoice actions (view, edit, download, delete)
 * 
 * Dependencies:
 * - InvoicesListStore for state management
 * - LanguageService for i18n
 * - PrimeNG components for UI
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

// Services and Store
import { InvoicesListStore } from '../../state/invoices-list.store';
import { LanguageService } from '../../../../shared/services/language/language.service';
import { Invoice } from '../../interfaces/database-models';

@Component({
  selector: 'app-invoice-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    CheckboxModule,
    ConfirmDialogModule,
    ToastModule,
    ProgressSpinnerModule,
    TooltipModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './invoice-history.component.html',
  styleUrls: ['./invoice-history.component.scss'],
})
export class InvoiceHistoryComponent implements OnInit {
  // Inject dependencies
  private readonly router = inject(Router);
  readonly store = inject(InvoicesListStore);
  readonly languageService = inject(LanguageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // Filter state
  searchTerm = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedPaidStatus: 'all' | 'paid' | 'unpaid' = 'all';

  // Paid status options for dropdown
  paidStatusOptions = [
    { label: this.getText('invoices.history.filters.all'), value: 'all' },
    { label: this.getText('invoices.history.filters.paid'), value: 'paid' },
    { label: this.getText('invoices.history.filters.unpaid'), value: 'unpaid' },
  ];

  ngOnInit(): void {
    // Load initial data
    this.loadInvoices();
    this.store.loadCompanies();
  }

  /**
   * Get translated text
   */
  getText(key: string): string {
    return this.languageService.getText(key);
  }

  /**
   * Load invoices with current filters
   */
  loadInvoices(): void {
    const filters: any = {};

    if (this.startDate) {
      filters.startDate = this.startDate.toISOString();
    }

    if (this.endDate) {
      filters.endDate = this.endDate.toISOString();
    }

    if (this.selectedPaidStatus !== 'all') {
      filters.paid = this.selectedPaidStatus === 'paid';
    }

    this.store.loadInvoices(filters);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.startDate = null;
    this.endDate = null;
    this.selectedPaidStatus = 'all';
    this.loadInvoices();
  }

  /**
   * Toggle invoice selection
   */
  onInvoiceSelect(invoice: Invoice): void {
    this.store.toggleInvoiceSelection(invoice.id);
  }

  /**
   * Select all invoices
   */
  selectAll(): void {
    this.store.selectAllInvoices();
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.store.clearSelection();
  }

  /**
   * Check if invoice is selected
   */
  isSelected(invoiceId: string): boolean {
    return this.store.selectedInvoiceIds().includes(invoiceId);
  }

  /**
   * Navigate to create new invoice
   */
  createNewInvoice(): void {
    this.router.navigate(['/invoices/create']);
  }

  /**
   * Download selected invoices
   */
  downloadSelected(): void {
    const selectedInvoices = this.store.selectedInvoices();

    if (selectedInvoices.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: this.getText('common.labels.warning'),
        detail: this.getText('invoices.history.messages.no_selection'),
      });
      return;
    }

    // TODO: Implement batch PDF download
    // For now, just show success message
    this.messageService.add({
      severity: 'success',
      summary: this.getText('common.labels.total'),
      detail: this.getText('invoices.history.messages.download_success'),
    });
  }

  /**
   * Mark selected invoices as paid
   */
  markSelectedAsPaid(): void {
    const selectedCount = this.store.selectedCount();

    if (selectedCount === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: this.getText('common.labels.warning'),
        detail: this.getText('invoices.history.messages.no_selection'),
      });
      return;
    }

    this.confirmationService.confirm({
      message: this.getText('common.messages.confirm_action'),
      header: this.getText('invoices.history.actions.mark_paid'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.markSelectedAsPaid();

        this.messageService.add({
          severity: 'success',
          summary: this.getText('common.labels.total'),
          detail: this.getText('invoices.history.messages.mark_paid_success').replace(
            '{count}',
            selectedCount.toString()
          ),
        });
      },
    });
  }

  /**
   * Delete selected invoices
   */
  deleteSelected(): void {
    const selectedCount = this.store.selectedCount();

    if (selectedCount === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: this.getText('common.labels.warning'),
        detail: this.getText('invoices.history.messages.no_selection'),
      });
      return;
    }

    this.confirmationService.confirm({
      message: this.getText('invoices.history.messages.delete_multiple_confirm').replace(
        '{count}',
        selectedCount.toString()
      ),
      header: this.getText('invoices.history.actions.delete'),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.deleteSelectedInvoices();

        this.messageService.add({
          severity: 'success',
          summary: this.getText('common.labels.total'),
          detail: this.getText('invoices.history.messages.delete_multiple_success').replace(
            '{count}',
            selectedCount.toString()
          ),
        });
      },
    });
  }

  /**
   * Download single invoice PDF
   */
  downloadInvoice(invoice: Invoice): void {
    // Update download timestamp
    this.store.updateDownloadTimestamp(invoice.id);

    // TODO: Implement PDF download
    this.messageService.add({
      severity: 'success',
      summary: this.getText('common.labels.total'),
      detail: this.getText('invoices.history.messages.download_success'),
    });
  }

  /**
   * Delete single invoice
   */
  deleteInvoice(invoice: Invoice): void {
    this.confirmationService.confirm({
      message: this.getText('invoices.history.messages.delete_confirm'),
      header: this.getText('invoices.history.actions.delete'),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.deleteInvoice(invoice.id);

        this.messageService.add({
          severity: 'success',
          summary: this.getText('common.labels.total'),
          detail: this.getText('invoices.history.messages.delete_success'),
        });
      },
    });
  }

  /**
   * Edit invoice
   */
  editInvoice(invoice: Invoice): void {
    // TODO: Navigate to edit page
    this.router.navigate(['/invoices/edit', invoice.id]);
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  /**
   * Format date
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES');
  }

  /**
   * Get filtered invoices (client-side search)
   */
  get filteredInvoices(): Invoice[] {
    const invoices = this.store.allInvoices();

    if (!this.searchTerm) {
      return invoices;
    }

    const search = this.searchTerm.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoice_number.toLowerCase().includes(search) ||
        inv.sender_name?.toLowerCase().includes(search) ||
        inv.destination_name?.toLowerCase().includes(search)
    );
  }
}


