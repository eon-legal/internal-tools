import {
  AfterViewInit,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { FormGenericComponent } from '../form-generic/form-generic.component';
import { InvoicesStore } from '../../../store/app.store';
import {
  DestinationBDReal,
  SecondForm,
} from '../../../features/invoices/interfaces/second-form';
import { FormField } from '../form-generic/interfaces/form-field';
import { AddresseesDataService } from '../../../data-access/addressees/addressees-data.service';
import { ClientsDataService } from '../../../data-access/clients/clients-data.service';
import { catchError, of, Subscription, tap, map, forkJoin } from 'rxjs';
import { SELECT_DATA_INITIAL } from '../form-generic/constants/select-data-initial';
import { ToastrService } from 'ngx-toastr';
import { MESSAGE_ERROR } from '../../constants/message-error';
import { LoadingService } from '../../services/loading/loading.service';
import { TranslateService } from '@ngx-translate/core';
import { getClientDisplayName } from '../../../features/invoices/interfaces/database-models';

/**
 * Component for managing the destination form in the invoice generation process.
 * This form collects details about the destination, such as name, address, and bank information.
 *
 * Dependencies: AddresseesDataService, ClientsDataService (Supabase), InvoicesStore, LoadingService, ToastrService
 * Side Effects: Loads addressees and clients from Supabase, updates form state
 */
@Component({
  selector: 'app-invoices-destination-form',
  standalone: true,
  imports: [FormGenericComponent],
  templateUrl: './invoices-destination-form.component.html',
  styleUrl: './invoices-destination-form.component.scss',
})
export class InvoicesDestinationFormComponent
  implements OnDestroy, AfterViewInit, OnInit
{
  /** Injected services */
  private readonly translate = inject(TranslateService);
  readonly store = inject(InvoicesStore);
  private readonly addresseesDataService = inject(AddresseesDataService);
  private readonly clientsDataService = inject(ClientsDataService);
  private readonly toastr = inject(ToastrService);
  private readonly loadingService = inject(LoadingService);

  /** subscription for clean component observable */
  subscription: Subscription[] = [];
  /** save data when consume service table adressee */
  saveDataService: SecondForm[] = [];
  /** isModal know component mananage like modal */
  @Input() isModal: boolean = false;
  @Input() initialField!: SecondForm;
  /** Store selected client ID for invoice creation */
  selectedClientId?: string;

  /** Reference to the FormGenericComponent for managing the form */
  @ViewChild(FormGenericComponent)
  formDestinationGenericComponent!: FormGenericComponent<SecondForm>;

  /** Configuration for the form fields */
  formConfig!: FormField<SecondForm>[];

  ngOnInit(): void {
    if (this.isModal) this.createForm();
    else this.isNotModalCallService();
  }

  isNotModalCallService() {
    this.loadingService.show();
    this.createForm();
    this.subscription.push(
      forkJoin({
        addressees: this.addresseesDataService.getAddressees(),
        clients: this.clientsDataService.getClients(),
      })
        .pipe(
          map(({ addressees, clients }) => {
            // Transform Supabase addressees to dropdown options
            const addresseeOptions = addressees.map((addressee) => ({
              label: `📧 ${addressee.name_destination}`,
              value: `addressee_${addressee.id}`,
            }));

            // Transform clients to dropdown options
            const clientOptions = clients.map((client) => ({
              label: `👤 ${getClientDisplayName(client)}`,
              value: `client_${client.id}`,
            }));

            // Combine both lists
            const allOptions = [...clientOptions, ...addresseeOptions];

            if (
              this.formConfig.length &&
              Array.isArray(allOptions)
            ) {
              if (this.formConfig[0]) {
                this.formConfig[0]!.primeNgConfig!.options = [
                  SELECT_DATA_INITIAL,
                  ...allOptions,
                ];
              }
            }

            this.loadingService.hide();
            return { addressees, clients };
          }),
          catchError((error) => {
            this.loadingService.hide();
            this.toastr.error(
              this.translate.instant('common.messages.service_error'),
              this.translate.instant('common.labels.error')
            );
            return of({ addressees: [], clients: [] });
          })
        )
        .subscribe()
    );
  }

  createForm() {
    const firstItem: FormField<SecondForm> = {
      name: 'chooseDestination',
      label: this.translate.instant('invoices.destination_form.select_destination'),
      type: 'select',
      cols: 12,
      initialData: this.getSecondFormStore()?.chooseDestination,
      primeNgConfig: {
        options: [SELECT_DATA_INITIAL],
      },
    };
    const restArray: FormField<SecondForm>[] = [
      {
        name: 'nameDestination',
        label: this.translate.instant('invoices.destination_form.destination_name'),
        type: 'input',
        cols: this.isModal ? 6 : 4,
        initialData: this.isModal
          ? this.initialField?.nameDestination
          : this.getSecondFormStore()?.nameDestination,
        validators: [
          { validator: Validators.required, message: this.translate.instant('common.validation.required') },
        ],
        disabled:
          !this.isModal && !!this.getSecondFormStore()?.chooseDestination?.value,
      },
      {
        name: 'accountDestination',
        label: this.translate.instant('invoices.destination_form.destination_account'),
        type: 'input',
        cols: this.isModal ? 6 : 4,
        initialData: this.isModal
          ? this.initialField?.accountDestination
          : this.getSecondFormStore()?.accountDestination,
        validators: [
          { validator: Validators.required, message: this.translate.instant('common.validation.required') },
        ],
        disabled:
          !this.isModal && !!this.getSecondFormStore()?.chooseDestination?.value,
      },
      {
        name: 'addressDestination',
        label: this.translate.instant('invoices.destination_form.destination_address'),
        type: 'input',
        cols: this.isModal ? 6 : 4,
        initialData: this.isModal
          ? this.initialField?.addressDestination
          : this.getSecondFormStore()?.addressDestination,
        validators: [
          { validator: Validators.required, message: this.translate.instant('common.validation.required') },
        ],
        disabled:
          !this.isModal && !!this.getSecondFormStore()?.chooseDestination?.value,
      },
      {
        name: 'nameBank',
        label: this.translate.instant('invoices.destination_form.bank_name'),
        type: 'input',
        initialData: this.isModal
          ? this.initialField?.nameBank
          : this.getSecondFormStore()?.nameBank,
        cols: this.isModal ? 6 : 4,
        validators: [
          { validator: Validators.required, message: this.translate.instant('common.validation.required') },
        ],
        disabled:
          !this.isModal && !!this.getSecondFormStore()?.chooseDestination?.value,
      },
      {
        name: 'addressBank',
        label: this.translate.instant('invoices.destination_form.bank_address'),
        type: 'input',
        initialData: this.isModal
          ? this.initialField?.addressBank
          : this.getSecondFormStore()?.addressBank,
        cols: this.isModal ? 6 : 4,
        validators: [
          { validator: Validators.required, message: this.translate.instant('common.validation.required') },
        ],
        disabled:
          !this.isModal && !!this.getSecondFormStore()?.chooseDestination?.value,
      },
      {
        name: 'nif',
        label: this.translate.instant('invoices.destination_form.nif'),
        type: 'input',
        initialData: this.isModal
          ? this.initialField?.nif
          : this.getSecondFormStore()?.nif,
        cols: this.isModal ? 6 : 4,
        validators: [
          { validator: Validators.required, message: this.translate.instant('common.validation.required') },
        ],
        disabled:
          !this.isModal && !!this.getSecondFormStore()?.chooseDestination?.value,
      },
    ];
    if (!this.isModal) {
      this.formConfig = [firstItem, ...restArray];
    } else {
      this.formConfig = [...restArray];
    }
    
  }

  /**
   * Lifecycle hook that runs after the view is initialized.
   * Marks all form fields as touched if required.
   */
  ngAfterViewInit(): void {
    if (!this.isModal) {
      this.setupConditionaChooseDestinationValidation();
      if (this.store.getAllMarkFieldForm())
        this.formDestinationGenericComponent?.getForm?.markAllAsTouched();
    }
  }

  private setupConditionaChooseDestinationValidation() {
    this.formDestinationGenericComponent
      ?.getFormControl('chooseDestination')
      ?.valueChanges.subscribe(
        (value: { label: string; value: string } | undefined) => {
          if (!value) {
            this.formDestinationGenericComponent?.getForm?.patchValue(
              { chooseDestination: SELECT_DATA_INITIAL },
              { emitEvent: false }
            );
          }
          if (value && value?.value) {
            this.loadingService.show();
            Object.keys(
              this.formDestinationGenericComponent?.getForm?.controls
            ).forEach((controlName) => {
              if (
                controlName !== 'chooseDestination' &&
                this.formDestinationGenericComponent?.getForm?.get(controlName)
              ) {
                this.formDestinationGenericComponent?.getForm
                  ?.get(controlName)
                  ?.disable();
              }
            });

            // Determine if it's a client or addressee based on prefix
            const isClient = value.value.startsWith('client_');
            const id = value.value.replace(/^(client_|addressee_)/, '');

            if (isClient) {
              // Store client ID for invoice creation
              this.selectedClientId = id;

              this.subscription.push(
                this.clientsDataService
                  .getClientById(id)
                  .pipe(
                    map((client) => {
                      // Transform client to form format
                      const formData: Partial<SecondForm> = {
                        nameDestination: getClientDisplayName(client),
                        accountDestination: '', // Clients don't have bank account info
                        addressDestination: client.address || '',
                        nameBank: '',
                        addressBank: '',
                        nif: client.nif || '',
                      };

                      this.formDestinationGenericComponent?.getForm?.patchValue(formData);
                      this.loadingService.hide();
                      return client;
                    }),
                    catchError((error) => {
                      this.loadingService.hide();
                      this.toastr.error(MESSAGE_ERROR, 'Error');
                      return of(null);
                    })
                  )
                  .subscribe()
              );
            } else {
              // Clear client ID when addressee is selected
              this.selectedClientId = undefined;

              this.subscription.push(
                this.addresseesDataService
                  .getAddresseeById(id)
                  .pipe(
                    map((addressee) => {
                      // Transform Supabase addressee to form format
                      const formData: Partial<SecondForm> = {
                        nameDestination: addressee.name_destination,
                        accountDestination: addressee.account_destination || '',
                        addressDestination: addressee.address_destination || '',
                        nameBank: addressee.name_bank || '',
                        addressBank: addressee.address_bank || '',
                        nif: addressee.nif || '',
                      };

                      this.formDestinationGenericComponent?.getForm?.patchValue(formData);
                      this.loadingService.hide();
                      return addressee;
                    }),
                    catchError((error) => {
                      this.loadingService.hide();
                      this.toastr.error(MESSAGE_ERROR, 'Error');
                      return of(null);
                    })
                  )
                  .subscribe()
              );
            }
          } else {
            Object.keys(
              this.formDestinationGenericComponent?.getForm?.controls
            ).forEach((controlName) => {
              if (
                controlName !== 'chooseDestination' &&
                this.formDestinationGenericComponent?.getForm?.get(controlName)
              ) {
                this.formDestinationGenericComponent?.getForm
                  ?.get(controlName)
                  ?.enable();
              }
            });
          }
        }
      );
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Updates the store with the current form data.
   */
  ngOnDestroy(): void {
    if (!this.isModal) {
      this.store.updateSecondForm(
        this.formDestinationGenericComponent?.getDataFormComplete()
      );
      if (this.isValidForm()) {
        this.store.updateValidSecondForm(true); // Update store if the form is valid
      } else {
        this.store.updateValidSecondForm(false); // Update store if the form is invalid
      }
    }
    this.subscription.forEach((subs) => subs.unsubscribe());
  }

  /**
   * Checks if the form is valid.
   * Also validates that a client or addressee is selected when not in modal mode.
   * @returns True if the form is valid, otherwise false.
   */
  isValidForm(): boolean {
    const formValid = this.formDestinationGenericComponent?.getForm?.valid;

    // In non-modal mode, ensure a client or addressee is selected
    if (!this.isModal) {
      const chooseDestination = this.formDestinationGenericComponent?.getForm?.get('chooseDestination')?.value;
      const hasSelection = chooseDestination && chooseDestination.value && chooseDestination.value !== '';

      if (!hasSelection) {
        // Show error message
        this.toastr.warning(
          this.translate.instant('invoices.destination_form.validation.client_required'),
          this.translate.instant('common.labels.warning')
        );
        return false;
      }
    }

    return formValid;
  }

  /**
   * Retrieves the current form data.
   * @returns The form data.
   */
  getValueForm() {
    return this.formDestinationGenericComponent?.getDataFormComplete();
  }

  /**
   * Retrieves the second form data from the store.
   * @returns The second form data.
   */
  getSecondFormStore() {
    return this.store.getSecondForm();
  }

  /**
   * Get the selected client ID (if a client was selected)
   * @returns The client ID or undefined
   */
  getSelectedClientId(): string | undefined {
    return this.selectedClientId;
  }
}
