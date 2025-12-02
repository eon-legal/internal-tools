/**
 * Invoice Edit Component
 * 
 * Responsibilities:
 * - Load and display existing invoice data
 * - Allow editing of invoice fields (except invoice_number)
 * - Save changes to Supabase
 * - Navigate back to invoice history on save/cancel
 * 
 * Business Rules:
 * - Invoice number is read-only (cannot be changed)
 * - updated_at timestamp is automatically updated by database trigger
 * 
 * Dependencies:
 * - InvoicesDataService for loading and updating invoice
 * - ActivatedRoute for getting invoice ID from URL
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RadioButton } from 'primeng/radiobutton';

// Services
import { InvoicesDataService } from '../../../../data-access/invoices/invoices-data.service';
import { LanguageService } from '../../../../shared/services/language/language.service';
import { Invoice, UpdateInvoiceDto } from '../../interfaces/database-models';

@Component({
  selector: 'app-invoice-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputTextarea,
    CalendarModule,
    CheckboxModule,
    ProgressSpinnerModule,
    ToastModule,
    RadioButton,
  ],
  providers: [MessageService],
  templateUrl: './invoice-edit.component.html',
  styleUrls: ['./invoice-edit.component.scss'],
})
export class InvoiceEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invoicesService = inject(InvoicesDataService);
  private readonly languageService = inject(LanguageService);
  private readonly messageService = inject(MessageService);

  invoiceForm!: FormGroup;
  invoice: Invoice | null = null;
  isLoading = false;
  isSaving = false;
  invoiceId: string | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadInvoice();
  }

  /**
   * Initialize the form
   */
  private initForm(): void {
    this.invoiceForm = this.fb.group({
      invoice_number: [{ value: '', disabled: true }], // Read-only
      invoice_date: ['', Validators.required],
      sender_name: ['', Validators.required],
      sender_identification_type: ['DNI', Validators.required],
      sender_identification: ['', Validators.required],
      destination_name: ['', Validators.required],
      destination_account: ['', Validators.required],
      destination_address: ['', Validators.required],
      destination_bank_name: ['', Validators.required],
      destination_bank_address: ['', Validators.required],
      destination_nif: ['', Validators.required],
      paid: [false],
    });
  }

  /**
   * Load invoice data from the database
   */
  private loadInvoice(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('id');
    
    if (!this.invoiceId) {
      this.showError('Invoice ID not found');
      this.goBack();
      return;
    }

    this.isLoading = true;
    this.invoicesService.getInvoiceById(this.invoiceId).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.populateForm(invoice);
        this.isLoading = false;
      },
      error: (error) => {
        this.showError('Failed to load invoice: ' + error.message);
        this.isLoading = false;
        this.goBack();
      },
    });
  }

  /**
   * Populate form with invoice data
   */
  private populateForm(invoice: Invoice): void {
    this.invoiceForm.patchValue({
      invoice_number: invoice.invoice_number,
      invoice_date: new Date(invoice.invoice_date),
      sender_name: invoice.sender_name,
      sender_identification_type: invoice.sender_identification_type || 'DNI',
      sender_identification: invoice.sender_identification || invoice.sender_passport || '',
      destination_name: invoice.destination_name,
      destination_account: invoice.destination_account,
      destination_address: invoice.destination_address,
      destination_bank_name: invoice.destination_bank_name,
      destination_bank_address: invoice.destination_bank_address,
      destination_nif: invoice.destination_nif,
      paid: invoice.paid,
    });
  }

  /**
   * Save invoice changes
   */
  onSave(): void {
    if (this.invoiceForm.invalid || !this.invoiceId) {
      this.showError('Please fill in all required fields');
      return;
    }

    this.isSaving = true;
    const formValue = this.invoiceForm.getRawValue();

    const updateData: UpdateInvoiceDto = {
      invoice_date: formValue.invoice_date.toISOString(),
      sender_name: formValue.sender_name,
      sender_identification_type: formValue.sender_identification_type,
      sender_identification: formValue.sender_identification,
      destination_name: formValue.destination_name,
      destination_account: formValue.destination_account,
      destination_address: formValue.destination_address,
      destination_bank_name: formValue.destination_bank_name,
      destination_bank_address: formValue.destination_bank_address,
      destination_nif: formValue.destination_nif,
      paid: formValue.paid,
    };

    this.invoicesService.updateInvoice(this.invoiceId, updateData).subscribe({
      next: () => {
        this.showSuccess('Invoice updated successfully');
        this.isSaving = false;
        this.goBack();
      },
      error: (error) => {
        this.showError('Failed to update invoice: ' + error.message);
        this.isSaving = false;
      },
    });
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    this.goBack();
  }

  /**
   * Navigate back to invoice history
   */
  private goBack(): void {
    this.router.navigate(['/invoices']);
  }

  /**
   * Get translated text
   */
  getText(key: string): string {
    return this.languageService.getText(key);
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: this.getText('common.labels.total'),
      detail: message,
    });
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: this.getText('common.labels.error'),
      detail: message,
    });
  }
}


