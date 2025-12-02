import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGenericComponent } from '../../../../shared/components/form-generic/form-generic.component';
import { InvoicesStore } from '../../../../store/app.store';
import { SecondForm } from '../../interfaces/second-form';
import { FormField } from '../../../../shared/components/form-generic/interfaces/form-field';
import { AddresseesDataService } from '../../../../data-access/addressees/addressees-data.service';
import { ClientsDataService } from '../../../../data-access/clients/clients-data.service';
import { forkJoin, map, Subscription } from 'rxjs';
import { LoadingService } from '../../../../shared/services/loading/loading.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { getClientDisplayName } from '../../interfaces/database-models';
import { Validators } from '@angular/forms';

/**
 * Simplified destination selector component that only displays a dropdown
 * to select an addressee (client or saved addressee).
 */
@Component({
  selector: 'app-invoice-destination-selector',
  standalone: true,
  imports: [CommonModule, FormGenericComponent, TranslateModule],
  templateUrl: './invoice-destination-selector.component.html',
  styleUrl: './invoice-destination-selector.component.scss',
})
export class InvoiceDestinationSelectorComponent implements OnInit, OnDestroy {
  /** Injected services */
  private readonly translate = inject(TranslateService);
  readonly store = inject(InvoicesStore);
  private readonly addresseesDataService = inject(AddresseesDataService);
  private readonly clientsDataService = inject(ClientsDataService);
  private readonly toastr = inject(ToastrService);
  private readonly loadingService = inject(LoadingService);

  /** Subscription for cleanup */
  subscription: Subscription[] = [];

  /** Store selected client ID for invoice creation */
  selectedClientId?: string;

  /** Reference to the FormGenericComponent */
  @ViewChild(FormGenericComponent)
  formComponent!: FormGenericComponent<SecondForm>;

  /** Configuration for the form fields */
  formConfig: FormField<SecondForm>[] = [];

  ngOnInit(): void {
    this.loadDestinations();
  }

  /**
   * Loads addressees and clients from Supabase and populates the dropdown.
   */
  loadDestinations(): void {
    this.loadingService.show();
    this.subscription.push(
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

            console.log('clientOptions:', clientOptions);

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
            this.createForm(options);
            this.loadingService.hide();
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
   * Creates the form configuration with the dropdown.
   * If there is only one option, it will be pre-selected.
   */
  createForm(options: { label: string; value: string }[]): void {
    const storedValue = this.store.getSecondForm()?.chooseDestination;

    // Pre-select the only option if there's exactly one
    const initialData = storedValue || (options.length === 1 ? options[0] : undefined);

    this.formConfig = [
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
   * Validates the form.
   */
  isValid(): boolean {
    return this.formComponent?.getForm?.valid ?? false;
  }

  /**
   * Marks all fields as touched.
   */
  markAllAsTouched(): void {
    this.formComponent?.getForm?.markAllAsTouched();
  }

  /**
   * Gets the selected destination value.
   */
  getSelectedDestination(): { label: string; value: string } | undefined {
    return this.formComponent?.getForm?.get('chooseDestination')?.value;
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
    
    // Save the selected destination to the store
    const selectedValue = this.getSelectedDestination();
    if (selectedValue) {
      this.store.updateSecondForm({ chooseDestination: selectedValue } as SecondForm);
    }
  }
}

