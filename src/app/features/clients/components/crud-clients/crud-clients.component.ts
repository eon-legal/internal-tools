/**
 * CRUD Clients Component
 * 
 * Responsibilities:
 * - Display list of clients in a table
 * - Handle CRUD operations (Create, Read, Update, Delete)
 * - Support both individual and company client types
 * - Manage default client selection
 * 
 * Dependencies:
 * - ClientsDataService for Supabase operations
 * - CustomModalService for modal dialogs
 * - TranslateService for i18n
 * - ToastrService for notifications
 * 
 * Side Effects:
 * - Loads clients from Supabase on init
 * - Updates clients table in Supabase
 * - Shows toast notifications for user feedback
 */

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription, catchError, of, tap, map } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TableGenericComponent } from '../../../../shared/components/table-generic/table-generic.component';
import { ButtonGenericComponent } from '../../../../shared/components/button-generic/button-generic.component';
import { ButtonGenericInterface } from '../../../../shared/components/button-generic/interfaces/buttons';
import { HeaderTable } from '../../../../shared/components/table-generic/interfaces/header-table';
import { CustomModalService } from '../../../../shared/services/custom-modal/custom-modal.service';
import { LoadingService } from '../../../../shared/services/loading/loading.service';
import { ClientsDataService } from '../../../../data-access/clients/clients-data.service';
import { Client, getClientDisplayName, isIndividualClient } from '../../../invoices/interfaces/database-models';
import { ClientFormComponent } from '../client-form/client-form.component';
import { LanguageService } from '../../../../shared/services/language/language.service';

interface ClientTableRow {
  id: string;
  client_type: string;
  name: string;
  address: string;
  nif: string;
  national: string;
  is_default: string;
}

@Component({
  selector: 'app-crud-clients',
  standalone: true,
  imports: [TableGenericComponent, ButtonGenericComponent],
  templateUrl: './crud-clients.component.html',
  styleUrl: './crud-clients.component.scss',
})
export class CrudClientsComponent implements OnInit, OnDestroy {
  private readonly languageService = inject(LanguageService);
  private readonly toastr = inject(ToastrService);
  private readonly clientsDataService = inject(ClientsDataService);
  private readonly customModalService = inject(CustomModalService);
  private readonly loadingService = inject(LoadingService);

  private subscription: Subscription[] = [];

  itemInitialPagination = 10;
  listPagination = [5, 10, 20, 50, 100];

  buttons: ButtonGenericInterface = {
    css: 'flex flex-column md:flex-row md:justify-content-end gap-2',
    buttons: [],
  };

  headerData: HeaderTable<ClientTableRow>[] = [];

  operation: ButtonGenericInterface = {
    buttons: [
      {
        id: 1,
        icon: 'pi pi-trash',
        severity: 'danger',
        action: (row: ClientTableRow) => {
          this.deleteClient(row.id);
        },
      },
      {
        id: 2,
        icon: 'pi pi-pencil',
        severity: 'primary',
        action: (row: ClientTableRow) => {
          this.loadAndEditClient(row.id);
        },
      },
      {
        id: 3,
        icon: 'pi pi-star',
        severity: 'info',
        action: (row: ClientTableRow) => {
          this.setDefaultClient(row.id);
        },
      },
    ],
  };

  dataTable: ClientTableRow[] = [];

  ngOnInit(): void {
    // Initialize translations
    this.updateTranslations();

    // Subscribe to language changes
    this.subscription.push(
      this.languageService.onLanguageChange().subscribe(() => {
        this.updateTranslations();
        // Reload table data to update translated client types
        this.loadClients();
      })
    );

    this.loadClients();
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
          icon: 'pi pi-user',
          label: this.languageService.getText('clients.buttons.add_individual'),
          severity: 'primary',
          action: () => this.openAddEditClient('individual'),
        },
        {
          id: 2,
          icon: 'pi pi-building',
          label: this.languageService.getText('clients.buttons.add_company'),
          severity: 'primary',
          action: () => this.openAddEditClient('company'),
        },
      ],
    };

    // Update table headers
    this.headerData = [
      {
        field: 'client_type',
        header: this.languageService.getText('clients.table.client_type'),
      },
      {
        field: 'name',
        header: this.languageService.getText('clients.table.name'),
      },
      {
        field: 'address',
        header: this.languageService.getText('clients.table.address'),
      },
      {
        field: 'nif',
        header: this.languageService.getText('clients.table.nif'),
      },
      {
        field: 'national',
        header: this.languageService.getText('clients.table.national'),
      },
      {
        field: 'is_default',
        header: this.languageService.getText('clients.table.is_default'),
      },
    ];
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }

  loadClients(): void {
    this.loadingService.show();
    this.subscription.push(
      this.clientsDataService
        .getClients()
        .pipe(
          map((clients) => {
            this.dataTable = clients.map(this.clientToTableRow.bind(this));
            this.loadingService.hide();
            return clients;
          }),
          catchError((error) => {
            this.dataTable = [];
            this.loadingService.hide();
            this.toastr.error(
              this.languageService.getText('clients.messages.load_error'),
              this.languageService.getText('common.labels.error')
            );
            return of([]);
          })
        )
        .subscribe()
    );
  }

  private clientToTableRow(client: Client): ClientTableRow {
    return {
      id: client.id,
      client_type: this.languageService.getText(`clients.types.${client.client_type}`),
      name: getClientDisplayName(client),
      address: client.address || '-',
      nif: client.nif || '-',
      national: client.national ? this.languageService.getText('common.labels.yes') || 'Yes' : this.languageService.getText('common.labels.no') || 'No',
      is_default: client.is_default ? '⭐' : '',
    };
  }

  openAddEditClient(clientType: 'individual' | 'company', existingClient?: Client): void {
    const isEdit = !!existingClient;
    const titleKey = isEdit
      ? `clients.form.title_edit_${clientType}`
      : `clients.form.title_add_${clientType}`;

    const { modalServiceRef } = this.customModalService.open(
      ClientFormComponent,
      {
        title: this.languageService.getText(titleKey),
        width: '60vw',
        data: { isModal: true, initialData: existingClient },
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
                if (formInstance && formInstance.isValidForm && formInstance.isValidForm()) {
                  modalServiceRef.close(formInstance.getValueForm());
                } else {
                  formInstance?.formClientGenericComponent?.getForm.markAllAsTouched();
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

    modalServiceRef.onClose((result: any) => {
      if (result) {
        if (isEdit && existingClient) {
          this.updateClient(existingClient.id, result);
        } else {
          this.createClient(result);
        }
      }
    });
  }

  loadAndEditClient(id: string): void {
    this.loadingService.show();
    this.subscription.push(
      this.clientsDataService
        .getClientById(id)
        .pipe(
          tap((client) => {
            this.loadingService.hide();
            this.openAddEditClient(client.client_type, client);
          }),
          catchError((error) => {
            this.loadingService.hide();
            this.toastr.error(
              this.languageService.getText('clients.messages.load_error'),
              this.languageService.getText('common.labels.error')
            );
            return of(null);
          })
        )
        .subscribe()
    );
  }

  createClient(clientData: any): void {
    this.loadingService.show();
    this.subscription.push(
      this.clientsDataService
        .createClient(clientData)
        .pipe(
          tap(() => {
            this.loadingService.hide();
            this.toastr.success(
              this.languageService.getText('clients.messages.create_success'),
              this.languageService.getText('common.labels.success') || 'Success'
            );
            this.loadClients();
          }),
          catchError((error) => {
            this.loadingService.hide();
            this.toastr.error(
              this.languageService.getText('clients.messages.save_error'),
              this.languageService.getText('common.labels.error')
            );
            return of(null);
          })
        )
        .subscribe()
    );
  }

  updateClient(id: string, updates: any): void {
    this.loadingService.show();
    this.subscription.push(
      this.clientsDataService
        .updateClient(id, updates)
        .pipe(
          tap(() => {
            this.loadingService.hide();
            this.toastr.success(
              this.languageService.getText('clients.messages.update_success'),
              this.languageService.getText('common.labels.success') || 'Success'
            );
            this.loadClients();
          }),
          catchError((error) => {
            this.loadingService.hide();
            this.toastr.error(
              this.languageService.getText('clients.messages.save_error'),
              this.languageService.getText('common.labels.error')
            );
            return of(null);
          })
        )
        .subscribe()
    );
  }

  deleteClient(id: string): void {
    if (!confirm(this.languageService.getText('clients.messages.delete_confirm'))) {
      return;
    }

    this.loadingService.show();
    this.subscription.push(
      this.clientsDataService
        .deleteClient(id)
        .pipe(
          tap(() => {
            this.loadingService.hide();
            this.toastr.success(
              this.languageService.getText('clients.messages.delete_success'),
              this.languageService.getText('common.labels.success') || 'Success'
            );
            this.loadClients();
          }),
          catchError((error) => {
            this.loadingService.hide();
            this.toastr.error(
              this.languageService.getText('clients.messages.delete_error'),
              this.languageService.getText('common.labels.error')
            );
            return of(null);
          })
        )
        .subscribe()
    );
  }

  setDefaultClient(id: string): void {
    this.loadingService.show();
    this.subscription.push(
      this.clientsDataService
        .setDefaultClient(id)
        .pipe(
          tap(() => {
            this.loadingService.hide();
            this.toastr.success(
              this.languageService.getText('clients.messages.update_success'),
              this.languageService.getText('common.labels.success') || 'Success'
            );
            this.loadClients();
          }),
          catchError((error) => {
            this.loadingService.hide();
            this.toastr.error(
              this.languageService.getText('clients.messages.save_error'),
              this.languageService.getText('common.labels.error')
            );
            return of(null);
          })
        )
        .subscribe()
    );
  }
}

