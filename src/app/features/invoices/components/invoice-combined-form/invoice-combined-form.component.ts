import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { InvoicesSenderFormComponent } from '../invoices-sender-form/invoices-sender-form.component';
import { ContainInvoicesComponent } from '../table-invoices/contain-invoices/contain-invoices.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormGenericComponent } from '../../../../shared/components/form-generic/form-generic.component';
import { FormField } from '../../../../shared/components/form-generic/interfaces/form-field';
import { InvoicesStore } from '../../../../store/app.store';
import { AddresseesDataService } from '../../../../data-access/addressees/addressees-data.service';
import { ClientsDataService } from '../../../../data-access/clients/clients-data.service';
import { LoadingService } from '../../../../shared/services/loading/loading.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, map, Subscription } from 'rxjs';
import { getClientDisplayName } from '../../interfaces/database-models';
import { SecondForm } from '../../interfaces/second-form';
import { FisrtForm } from '../../interfaces/first-form';
import { DataInvoicesTable } from '../../interfaces/data-invoices-table';

/**
 * Combined component that merges the sender form, invoice table, and destination selector
 * into a single unified screen. This component displays all invoice creation fields together
 * for a streamlined user experience.
 */
@Component({
  selector: 'app-invoice-combined-form',
  standalone: true,
  imports: [CommonModule, InvoicesSenderFormComponent, ContainInvoicesComponent, TranslateModule, FormGenericComponent],
  templateUrl: './invoice-combined-form.component.html',
  styleUrl: './invoice-combined-form.component.scss',
})
export class InvoiceCombinedFormComponent implements OnInit, OnDestroy {
  /** Injected services */
  private readonly translate = inject(TranslateService);
  readonly store = inject(InvoicesStore);
  private readonly addresseesDataService = inject(AddresseesDataService);
  private readonly clientsDataService = inject(ClientsDataService);
  private readonly toastr = inject(ToastrService);
  private readonly loadingService = inject(LoadingService);
  private readonly cdr = inject(ChangeDetectorRef);

  /** Subscription for cleanup */
  private subscriptions: Subscription[] = [];

  /** Reference to the sender form component */
  @ViewChild(InvoicesSenderFormComponent)
  senderFormComponent!: InvoicesSenderFormComponent;

  /** Reference to the invoice table component */
  @ViewChild(ContainInvoicesComponent)
  invoiceTableComponent!: ContainInvoicesComponent;

  /** Reference to the destination form component */
  @ViewChild('destinationForm')
  destinationFormComponent!: FormGenericComponent<SecondForm>;

  /** Configuration for the destination form fields */
  destinationFormConfig: FormField<SecondForm>[] = [];

  /** Flag to track if destinations are loaded */
  destinationsLoaded = false;

  ngOnInit(): void {
    this.loadDestinations();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());

    // Save the selected destination to the store
    const selectedValue = this.getSelectedDestination();
    if (selectedValue) {
      this.store.updateSecondForm({ chooseDestination: selectedValue } as SecondForm);
    }
  }

  /**
   * Loads addressees and clients from Supabase and populates the dropdown.
   */
  loadDestinations(): void {
    this.loadingService.show();
    this.subscriptions.push(
      forkJoin({
        addressees: this.addresseesDataService.getAddressees(),
        clients: this.clientsDataService.getClients(),
      })
        .pipe(
          map(({ addressees, clients }) => {
            // Transform clients to dropdown options
            const clientOptions = clients.map((client) => ({
              label: `👤 ${getClientDisplayName(client)}`,
              value: `client_${client.id}`,
            }));

            // Transform addressees to dropdown options
            const addresseeOptions = addressees.map((addressee) => ({
              label: `📧 ${addressee.name_destination}`,
              value: `addressee_${addressee.id}`,
            }));

            // Combine both lists
            return [...clientOptions, ...addresseeOptions];
          })
        )
        .subscribe({
          next: (options) => {
            this.createDestinationForm(options);
            this.destinationsLoaded = true;
            this.loadingService.hide();
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error loading destinations:', error);
            this.toastr.error(
              this.translate.instant('invoices.destination_form.error_loading'),
              this.translate.instant('common.labels.error')
            );
            this.loadingService.hide();
          },
        })
    );
  }

  /**
   * Creates the destination form configuration with the dropdown.
   * Pre-selects the first option from the loaded data by default.
   */
  createDestinationForm(options: { label: string; value: string }[]): void {
    const storedValue = this.store.getSecondForm()?.chooseDestination;

    // Pre-select the stored value (if valid) or the first option from the loaded data
    // Check if storedValue has a non-empty value property to determine if it's a valid selection
    const hasValidStoredValue = storedValue && storedValue.value && storedValue.value.trim() !== '';
    let initialData = hasValidStoredValue ? storedValue : (options.length > 0 ? options[0] : undefined);

    this.destinationFormConfig = [
      {
        name: 'chooseDestination',
        label: this.translate.instant('invoices.destination_form.choose_destination'),
        type: 'select',
        cols: 12,
        initialData: initialData,
        primeNgConfig: {
          options: options,
          placeholder: this.translate.instant('invoices.destination_form.select_destination'),
        },
        validators: [
          {
            validator: Validators.required,
            message: this.translate.instant('common.validation.required'),
          },
        ],
      },
    ];
  }

  /**
   * Validates the sender form, invoice table, and destination selector.
   * @returns True if all are valid, false otherwise.
   */
  isValid(): boolean {
    const senderFormValid = this.senderFormComponent?.formSenderGenericComponent?.getForm?.valid ?? false;
    const tableHasItems = this.invoiceTableComponent?.rowTable?.length > 2; // More than just IVA and TOTAL rows
    const destinationValid = this.destinationFormComponent?.getForm?.valid ?? false;
    return senderFormValid && tableHasItems && destinationValid;
  }

  /**
   * Validates only the sender form and invoice table (for backward compatibility).
   * @returns True if sender form and table are valid, false otherwise.
   */
  isValidSenderAndTable(): boolean {
    const senderFormValid = this.senderFormComponent?.formSenderGenericComponent?.getForm?.valid ?? false;
    const tableHasItems = this.invoiceTableComponent?.rowTable?.length > 2;
    return senderFormValid && tableHasItems;
  }

  /**
   * Validates only the destination selector.
   * @returns True if destination is valid, false otherwise.
   */
  isValidDestination(): boolean {
    return this.destinationFormComponent?.getForm?.valid ?? false;
  }

  /**
   * Marks all fields as touched to show validation errors.
   */
  markAllAsTouched(): void {
    this.senderFormComponent?.formSenderGenericComponent?.getForm?.markAllAsTouched();
    this.destinationFormComponent?.getForm?.markAllAsTouched();
  }

  /**
   * Gets the selected destination value.
   */
  getSelectedDestination(): { label: string; value: string } | undefined {
    return this.destinationFormComponent?.getForm?.get('chooseDestination')?.value;
  }

  /**
   * Gets the sender form data directly from the form (not from store).
   * This ensures we get the current form values, not stale store data.
   * @returns The sender form data, or undefined if the form is not available.
   */
  getSenderFormData(): FisrtForm | undefined {
    return this.senderFormComponent?.formSenderGenericComponent?.getDataFormComplete();
  }

  /**
   * Gets the invoice table data directly from the component.
   * @returns The invoice table data array, or empty array if not available.
   */
  getTableData(): DataInvoicesTable[] {
    return this.invoiceTableComponent?.rowTable ?? [];
  }
}

