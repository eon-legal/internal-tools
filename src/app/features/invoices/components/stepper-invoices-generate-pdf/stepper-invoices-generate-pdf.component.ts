import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { InvoiceCombinedFormComponent } from '../invoice-combined-form/invoice-combined-form.component';
import { ToastrService } from 'ngx-toastr';
import { CreateInvoicePdfService } from '../../services/create-invoice-pdf.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { InvoicesStore } from '../../../../store/app.store';
import { DataInvoicesConstant } from '../../constants/data-invoices';
import { DataInvoicesTable } from '../../interfaces/data-invoices-table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InvoicesDataService } from '../../../../data-access/invoices/invoices-data.service';
import { ClientsDataService } from '../../../../data-access/clients/clients-data.service';
import { AddresseesDataService } from '../../../../data-access/addressees/addressees-data.service';
import { generateNextInvoiceNumberFromArray } from '../../../../domain/invoices/invoice-number-generator';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { getClientDisplayName } from '../../interfaces/database-models';

/**
 * Single-page invoice creation component that combines all invoice data entry
 * into a unified form with action buttons for clearing and generating invoices.
 */
@Component({
  selector: 'app-stepper-invoices-generate-pdf',
  standalone: true,
  imports: [CommonModule, InvoiceCombinedFormComponent, ButtonModule, TranslateModule],
  templateUrl: './stepper-invoices-generate-pdf.component.html',
  styleUrl: './stepper-invoices-generate-pdf.component.scss',
})
export class StepperInvoicesGeneratePdfComponent implements AfterViewInit, OnDestroy {
  /** Reference to the combined form component */
  @ViewChild(InvoiceCombinedFormComponent)
  combinedFormComponent!: InvoiceCombinedFormComponent;

  /** Injected services */
  private readonly translate = inject(TranslateService);
  readonly store = inject(InvoicesStore);
  toastr: ToastrService = inject(ToastrService);
  createInvoicePdfService: CreateInvoicePdfService = inject(CreateInvoicePdfService);
  private readonly invoicesDataService = inject(InvoicesDataService);
  private readonly clientsDataService = inject(ClientsDataService);
  private readonly addresseesDataService = inject(AddresseesDataService);
  private readonly router = inject(Router);

  /**
   * Lifecycle hook that runs after the view is initialized.
   */
  ngAfterViewInit() {
    // Component is ready
  }

  /**
   * Sets the saving state on the child component
   */
  private setSaving(saving: boolean): void {
    this.combinedFormComponent?.setSaving(saving);
  }

  /**
   * Navigates to the invoice history page.
   */
  navigateToHistory(): void {
    this.router.navigate(['/invoices']);
  }

  /**
   * Clears all data in the form.
   */
  cleanDataStep() {
    this.store.resetInvoices(); // Reset invoice data
    this.store.resetTableInvoices(); // Reset table data
    this.combinedFormComponent?.senderFormComponent?.changeData(this.store.getFirstForm());
    this.combinedFormComponent?.senderFormComponent?.formSenderGenericComponent?.getForm?.markAsUntouched();
    // Reload destinations to reset the form
    this.combinedFormComponent?.loadDestinations();
  }

  /**
   * Validates the form, saves to Supabase, and generates the PDF if valid.
   */
  async generateInvoice() {
    this.askHaveDataTableCreate(); // Ensure the table has data

    // Check if the combined form component is defined
    if (!this.combinedFormComponent) {
      return;
    }

    // Validate sender form and table directly from the component (not store)
    // The store value is only updated on component destroy, so we need real-time validation
    const isValidFirstForm = this.combinedFormComponent.isValidSenderAndTable();
    const isValidDestination = this.combinedFormComponent.isValidDestination();
    const messages = this.translate.instant('invoices.validation.step1_invalid');

    // Mark all fields as touched to show validation errors
    this.combinedFormComponent.markAllAsTouched();

    // Show error if forms are invalid
    if (!isValidFirstForm || !isValidDestination) {
      this.store.updateAllMarkFieldForm(true);
      this.toastr.error(
        !isValidFirstForm
          ? messages
          : this.translate.instant('invoices.validation.step2_invalid'),
        this.translate.instant('common.labels.error')
      );
      return;
    }

    // Get data from the forms and table directly from components (not store)
    // The store values are only updated on component destroy, so we need real-time data
    const first = this.combinedFormComponent.getSenderFormData();
    const table = this.combinedFormComponent.getTableData();

    // Validate sender form data is available
    if (!first) {
      this.toastr.error(
        this.translate.instant('invoices.validation.step1_invalid'),
        this.translate.instant('common.labels.error')
      );
      return;
    }

    // Get selected destination from the combined form
    const selectedDestination = this.combinedFormComponent.getSelectedDestination();
    if (!selectedDestination) {
      this.toastr.error(
        this.translate.instant('invoices.validation.destination_required'),
        this.translate.instant('common.labels.error')
      );
      return;
    }

    // Extract client ID from the selected destination value
    const clientId = selectedDestination.value.startsWith('client_')
      ? selectedDestination.value.replace('client_', '')
      : undefined;

    try {
      this.setSaving(true);

      // Fetch destination data based on selection
      let destinationData;
      if (selectedDestination.value.startsWith('client_')) {
        const client = await firstValueFrom(
          this.clientsDataService.getClientById(clientId!)
        );
        destinationData = {
          nameDestination: getClientDisplayName(client),
          accountDestination: '', // Clients don't have bank account info
          addressDestination: client.address || '',
          nameBank: '', // Clients don't have bank info
          addressBank: '', // Clients don't have bank info
          nif: client.nif || '',
        };
      } else {
        const addresseeId = selectedDestination.value.replace('addressee_', '');
        const addressee = await firstValueFrom(
          this.addresseesDataService.getAddresseeById(addresseeId)
        );
        destinationData = {
          nameDestination: addressee.name_destination || '',
          accountDestination: addressee.account_destination || '',
          addressDestination: addressee.address_destination || '',
          nameBank: addressee.name_bank || '',
          addressBank: addressee.address_bank || '',
          nif: addressee.nif || '',
        };
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      // Calculate totals from table
      const { subtotal, ivaAmount, totalAmount } = this.calculateTotals(table);

      // Prepare invoice items (exclude IVA and TOTAL rows)
      const invoiceItems = table
        .filter(item =>
          item.perCentIva !== DataInvoicesConstant.IVA &&
          item.perCentIva !== DataInvoicesConstant.TOTAL
        )
        .map(item => ({
          id: item.id,
          description: item.description,
          qtt: typeof item.qtt === 'number' ? item.qtt : (typeof item.qtt === 'string' ? parseFloat(item.qtt) : undefined),
          price: typeof item.price === 'number' ? item.price : (typeof item.price === 'string' ? parseFloat(item.price) : undefined),
          total: typeof item.total === 'number' ? item.total : parseFloat(String(item.total)),
          sTotal: typeof item.sTotal === 'number' ? item.sTotal : parseFloat(String(item.sTotal)),
          perCentIva: typeof item.perCentIva === 'number' ? item.perCentIva :
                      (typeof item.perCentIva === 'object' && 'value' in item.perCentIva ? item.perCentIva.value :
                       parseFloat(String(item.perCentIva)))
        }));

      // Create invoice object
      const invoiceData = {
        invoice_number: invoiceNumber,
        invoice_date: this.getInvoiceDate(first),
        client_id: clientId, // Save client reference if selected
        sender_name: first.name,
        sender_identification_type: first.identificationType,
        sender_identification: first.identification,
        destination_name: destinationData.nameDestination,
        destination_account: destinationData.accountDestination,
        destination_address: destinationData.addressDestination,
        destination_bank_name: destinationData.nameBank,
        destination_bank_address: destinationData.addressBank,
        destination_nif: destinationData.nif,
        invoice_items: invoiceItems,
        subtotal,
        iva_amount: ivaAmount,
        total_amount: totalAmount,
        paid: false
      };

      // Save to Supabase
      await firstValueFrom(
        this.invoicesDataService.createInvoice(invoiceData)
      );

      this.toastr.success(
        this.translate.instant('invoices.messages.invoice_created', { number: invoiceNumber }),
        this.translate.instant('common.labels.success')
      );

      // Generate the PDF
      this.createInvoicePdfService.newGeneratePDFInvoices(
        [first.name, first.identification],
        destinationData,
        first,
        table
      );

      // Reset form and navigate to invoice list
      this.store.resetInvoices();
      this.store.resetTableInvoices();

      // Navigate to invoice history after a short delay
      setTimeout(() => {
        this.router.navigate(['/invoices']);
      }, 1000);

    } catch (error) {
      console.error('Error saving invoice:', error);
      this.toastr.error(
        this.translate.instant('invoices.messages.save_error'),
        this.translate.instant('common.labels.error')
      );
    } finally {
      this.setSaving(false);
    }
  }

  /**
   * Generates the next invoice number based on existing invoices
   */
  private async generateInvoiceNumber(): Promise<string> {
    try {
      const allInvoices = await firstValueFrom(
        this.invoicesDataService.getInvoices()
      );
      return generateNextInvoiceNumberFromArray(allInvoices);
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to default if error
      return generateNextInvoiceNumberFromArray([]);
    }
  }

  /**
   * Gets the invoice date from the first form
   */
  private getInvoiceDate(first: any): string {
    if (first.date) {
      return new Date(first.date).toISOString();
    }
    // Default to current date
    return new Date().toISOString();
  }

  /**
   * Calculates subtotal, IVA, and total from table data
   */
  private calculateTotals(table: DataInvoicesTable[]): {
    subtotal: number;
    ivaAmount: number;
    totalAmount: number;
  } {
    const ivaRow = table.find(item => item.perCentIva === DataInvoicesConstant.IVA);
    const totalRow = table.find(item => item.perCentIva === DataInvoicesConstant.TOTAL);

    // Calculate subtotal from regular items
    const subtotal = table
      .filter(item =>
        item.perCentIva !== DataInvoicesConstant.IVA &&
        item.perCentIva !== DataInvoicesConstant.TOTAL
      )
      .reduce((sum, item) => sum + (Number(item.total) || 0), 0);

    const ivaAmount = ivaRow ? Number(ivaRow.total) || 0 : 0;
    const totalAmount = totalRow ? Number(totalRow.total) || 0 : subtotal + ivaAmount;

    return { subtotal, ivaAmount, totalAmount };
  }

  /**
   * Ensures the table has data by adding summary rows if empty.
   */
  askHaveDataTableCreate() {
    let rowTable: DataInvoicesTable[] = this.store.getTableContain() || [];
    if (!rowTable?.length) {
      // Add summary rows if the table is empty
      rowTable.push({
        id: '',
        description: '',
        sTotal: '',
        perCentIva: DataInvoicesConstant.IVA,
        total: 0,
      });
      rowTable.push({
        id: '',
        description: '',
        sTotal: '',
        perCentIva: DataInvoicesConstant.TOTAL,
        total: 0,
      });
      this.store.updateTable(rowTable); // Update the store with the new table data
    }
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Resets the store data.
   */
  ngOnDestroy() {
    this.store.resetTableInvoices(); // Reset table data
    this.store.resetInvoices(); // Reset invoice data
  }
}
