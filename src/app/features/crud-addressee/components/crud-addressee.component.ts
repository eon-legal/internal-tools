import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TableGenericComponent } from '../../../shared/components/table-generic/table-generic.component';
import { ButtonGenericComponent } from '../../../shared/components/button-generic/button-generic.component';
import { ButtonGenericInterface } from '../../../shared/components/button-generic/interfaces/buttons';
import { HeaderTable } from '../../../shared/components/table-generic/interfaces/header-table';
import {
  DestinationBDReal,
  SecondForm,
} from '../../invoices/interfaces/second-form';
import { InvoicesDestinationFormComponent } from '../../../shared/components/invoices-destination-form/invoices-destination-form.component';
import { catchError, of, Subscription, tap, map } from 'rxjs';
import { AddresseesDataService } from '../../../data-access/addressees/addressees-data.service';
import { Addressee } from '../interfaces/addressee';
import { ToastrService } from 'ngx-toastr';
import { MESSAGE_ERROR } from '../../../shared/constants/message-error';
import { CustomModalService } from '../../../shared/services/custom-modal/custom-modal.service';
import { LoadingService } from '../../../shared/services/loading/loading.service';
import { LanguageService } from '../../../shared/services/language/language.service';

@Component({
  selector: 'app-crud-addressee',
  standalone: true,
  imports: [TableGenericComponent, ButtonGenericComponent],
  templateUrl: './crud-addressee.component.html',
  styleUrl: './crud-addressee.component.scss',
})
export class CrudAddresseeComponent implements OnInit, OnDestroy {
  /** Injected LanguageService for i18n support */
  private readonly languageService = inject(LanguageService);

  /** Toastr service for notifications */
  private readonly toastr = inject(ToastrService);

  /** Injected service for managing custom dialogs */
  private readonly customModalService = inject(CustomModalService);

  /** Injected service for managing addressees in Supabase */
  private readonly addresseesDataService = inject(AddresseesDataService);

  /** Injected loading service */
  private readonly loadingService = inject(LoadingService);

  /**subcription for clean component observables consume */
  subscription: Subscription[] = [];

  /** Initial number of items to display per page in the table */
  itemInitialPagination = 10;

  /** List of pagination options for the table */
  listPagination = [5, 10, 20, 50, 100];

  /** Configuration for buttons in the component */
  buttons: ButtonGenericInterface = {
    css: 'flex flex-column md:flex-row md:justify-content-end gap-2',
    buttons: [],
  };

  /** Header configuration for the table */
  headerData: HeaderTable<SecondForm>[] = [];

  /** Configuration for table operations (e.g., delete, edit) */
  operation: ButtonGenericInterface = { buttons: [] };
  dataTable: SecondForm[] = [];

  ngOnInit(): void {
    // Initialize translations
    this.updateTranslations();

    // Subscribe to language changes
    this.subscription.push(
      this.languageService.onLanguageChange().subscribe(() => {
        this.updateTranslations();
      })
    );

    this.loadAddressee();
  }

  /**
   * Update all translations when language changes
   */
  private updateTranslations(): void {
    // Update button labels
    this.buttons = {
      css: 'flex flex-column md:flex-row md:justify-content-end gap-2',
      buttons: [
        {
          id: 1,
          icon: 'pi pi-check',
          label: this.languageService.getText('addressee.buttons.add_addressee'),
          severity: 'primary',
          action: () => this.opneAddEditAddressee(),
        },
      ],
    };

    // Update table headers
    this.headerData = [
      {
        field: 'nameDestination',
        header: this.languageService.getText('addressee.table.destination_name'),
      },
      {
        field: 'accountDestination',
        header: this.languageService.getText('addressee.table.destination_account'),
        customContent: (row: SecondForm) => this.maskAccountNumber(row.accountDestination),
      },
      {
        field: 'addressDestination',
        header: this.languageService.getText('addressee.table.destination_address'),
      },
      {
        field: 'nameBank',
        header: this.languageService.getText('addressee.table.bank_name'),
      },
      {
        field: 'addressBank',
        header: this.languageService.getText('addressee.table.bank_address'),
      },
      {
        field: 'nif',
        header: this.languageService.getText('addressee.table.nif'),
      },
    ];

    // Update table operations with Invoice History style (rounded, text, tooltips)
    this.operation = {
      css: 'flex gap-1 justify-content-center',
      buttons: [
        {
          id: 1,
          icon: 'pi pi-pencil',
          severity: 'success',
          rounded: true,
          text: true,
          tooltip: this.languageService.getText('addressee.actions.edit'),
          action: (row: SecondForm) => this.opneAddEditAddressee(row),
        },
        {
          id: 2,
          icon: 'pi pi-trash',
          severity: 'danger',
          rounded: true,
          text: true,
          tooltip: this.languageService.getText('addressee.actions.delete'),
          action: (row: DestinationBDReal) => this.deleteAddressee(row.id),
        },
      ],
    };
  }

  loadAddressee() {
    this.loadingService.show();
    this.subscription.push(
      this.addresseesDataService
        .getAddressees()
        .pipe(
          map((addressees) => {
            // Transform Supabase addressees to SecondForm format for table display
            this.dataTable = addressees.map(this.addresseeToSecondForm);
            this.loadingService.hide();
            return addressees;
          }),
          catchError((error) => {
            this.dataTable = [];
            this.loadingService.hide();
            this.toastr.error(
              this.languageService.getText('common.messages.service_error'),
              this.languageService.getText('common.labels.error')
            );
            return of([]);
          })
        )
        .subscribe()
    );
  }

  /**
   * Helper method to transform Supabase Addressee to SecondForm format
   */
  private addresseeToSecondForm(addressee: Addressee): SecondForm {
    return {
      id: addressee.id,
      nameDestination: addressee.name_destination,
      accountDestination: addressee.account_destination || '',
      addressDestination: addressee.address_destination || '',
      nameBank: addressee.name_bank || '',
      addressBank: addressee.address_bank || '',
      nif: addressee.nif || '',
    };
  }

  /**
   * Helper method to transform SecondForm to Supabase Addressee format
   */
  private secondFormToAddressee(form: SecondForm) {
    return {
      name_destination: form.nameDestination,
      account_destination: form.accountDestination,
      address_destination: form.addressDestination,
      name_bank: form.nameBank,
      address_bank: form.addressBank,
      nif: form.nif,
    };
  }
  opneAddEditAddressee(row: SecondForm | undefined = undefined) {
    const { modalServiceRef } = this.customModalService.open(
      InvoicesDestinationFormComponent,
      {
        title: this.languageService.getText('addressee.buttons.add_addressee'),
        width: '800px',
        data: { isModal: true, initialField: row },
        buttons: {
          css: 'flex flex-column md:flex-row md:justify-content-between gap-2',

          buttons: [
            {
              id: 1,
              label: this.languageService.getText('common.buttons.save'),
              icon: 'pi pi-save',
              severity: 'success',
              action: () => {
                const formInstance = modalServiceRef.getInstance();
                if (
                  formInstance &&
                  formInstance.isValidForm &&
                  formInstance.isValidForm()
                ) {
                  modalServiceRef.close(formInstance.getValueForm());
                } else {
                  formInstance?.formDestinationGenericComponent?.getForm.markAllAsTouched();
                }
              },
            },
            {
              id: 2,
              label: this.languageService.getText('common.buttons.cancel'),
              icon: 'pi pi-times',
              severity: 'danger',
              action: () => modalServiceRef.close(),
            },
          ],
        },
      }
    );

    modalServiceRef.onClose((result: SecondForm | undefined) => {
      if (result) {
        if (!row) {
          this.addAddressee(result);
        } else {
          this.updateAddressee({
            id: row.id,
            ...result,
          });
        }
      }
    });
  }

  addAddressee(newAddressee: Omit<SecondForm, 'id'>) {
    this.loadingService.show();
    const addresseeDto = this.secondFormToAddressee(newAddressee as SecondForm);

    this.subscription.push(
      this.addresseesDataService
        .createAddressee(addresseeDto)
        .pipe(
          tap(() => {
            this.loadingService.hide();
            this.toastr.success(
              this.languageService.getText('common.messages.save_success'),
              this.languageService.getText('common.labels.success')
            );
            this.loadAddressee(); // Reload the list
          }),
          catchError((error) => {
            this.loadingService.hide();
            this.toastr.error(
              this.languageService.getText('common.messages.service_error'),
              this.languageService.getText('common.labels.error')
            );
            return of(null);
          })
        )
        .subscribe()
    );
  }

  updateAddressee(addressee: SecondForm) {
    if (!addressee.id) return;
    this.loadingService.show();
    const addresseeDto = this.secondFormToAddressee(addressee);

    this.subscription.push(
      this.addresseesDataService
        .updateAddressee(addressee.id, addresseeDto)
        .pipe(
          tap(() => {
            this.loadingService.hide();
            this.toastr.success(
              this.languageService.getText('common.messages.update_success'),
              this.languageService.getText('common.labels.success')
            );
            this.loadAddressee(); // Reload the list
          }),
          catchError((error) => {
            this.loadingService.hide();
            this.toastr.error(
              this.languageService.getText('common.messages.service_error'),
              this.languageService.getText('common.labels.error')
            );
            return of(null);
          })
        )
        .subscribe()
    );
  }

  deleteAddressee(id: string) {
    this.loadingService.show();
    this.subscription.push(
      this.addresseesDataService
        .deleteAddressee(id)
        .pipe(
          tap(() => {
            this.loadingService.hide();
            this.toastr.success(
              this.languageService.getText('common.messages.delete_success'),
              this.languageService.getText('common.labels.success')
            );
            this.loadAddressee(); // Reload the list
          }),
          catchError((error) => {
            this.loadingService.hide();
            this.toastr.error(
              this.languageService.getText('common.messages.service_error'),
              this.languageService.getText('common.labels.error')
            );
            return of(null);
          })
        )
        .subscribe()
    );
  }

  /**
   * Masks an account number showing only first 4 and last 4 digits.
   * Example: "ES1234567890123456" -> "ES12************3456"
   */
  private maskAccountNumber(account: string | undefined): string {
    if (!account) return '';
    const cleanAccount = account.replace(/\s/g, '');
    if (cleanAccount.length <= 8) return cleanAccount;
    const firstFour = cleanAccount.slice(0, 4);
    const lastFour = cleanAccount.slice(-4);
    const maskedLength = cleanAccount.length - 8;
    return `${firstFour}${'*'.repeat(maskedLength)}${lastFour}`;
  }

  ngOnDestroy(): void {
    this.subscription.forEach((element) => {
      element.unsubscribe();
    });
  }
}
