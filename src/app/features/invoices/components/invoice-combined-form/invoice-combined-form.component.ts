import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoicesSenderFormComponent } from '../invoices-sender-form/invoices-sender-form.component';
import { ContainInvoicesComponent } from '../table-invoices/contain-invoices/contain-invoices.component';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Combined component that merges the sender form and invoice table into a single step.
 * This component displays both the sender information form and the invoice items table.
 */
@Component({
  selector: 'app-invoice-combined-form',
  standalone: true,
  imports: [CommonModule, InvoicesSenderFormComponent, ContainInvoicesComponent, TranslateModule],
  templateUrl: './invoice-combined-form.component.html',
  styleUrl: './invoice-combined-form.component.scss',
})
export class InvoiceCombinedFormComponent implements OnInit, OnDestroy {
  /** Reference to the sender form component */
  @ViewChild(InvoicesSenderFormComponent)
  senderFormComponent!: InvoicesSenderFormComponent;

  /** Reference to the invoice table component */
  @ViewChild(ContainInvoicesComponent)
  invoiceTableComponent!: ContainInvoicesComponent;

  ngOnInit(): void {
    // Initialization logic if needed
  }

  ngOnDestroy(): void {
    // Cleanup logic if needed
  }

  /**
   * Validates both the sender form and invoice table.
   * @returns True if both are valid, false otherwise.
   */
  isValid(): boolean {
    const senderFormValid = this.senderFormComponent?.formSenderGenericComponent?.getForm?.valid ?? false;
    const tableHasItems = this.invoiceTableComponent?.rowTable?.length > 2; // More than just IVA and TOTAL rows
    return senderFormValid && tableHasItems;
  }

  /**
   * Marks all fields as touched to show validation errors.
   */
  markAllAsTouched(): void {
    this.senderFormComponent?.formSenderGenericComponent?.getForm?.markAllAsTouched();
  }
}

