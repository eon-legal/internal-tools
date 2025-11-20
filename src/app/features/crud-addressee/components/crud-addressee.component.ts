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
import { catchError, of, Subscription, tap } from 'rxjs';
import { GenericFirestoreService } from '../../../shared/services/generic-firestore/generic-firestore.service';
import { ADDRESSEE_TABLE } from '../constants/collection-table';
import { ToastrService } from 'ngx-toastr';
import { MESSAGE_ERROR } from '../../../shared/constants/message-error';
import { CustomModalService } from '../../../shared/services/custom-modal/custom-modal.service';
import { LoadingService } from '../../../shared/services/loading/loading.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-crud-addressee',
  standalone: true,
  imports: [TableGenericComponent, ButtonGenericComponent],
  templateUrl: './crud-addressee.component.html',
  styleUrl: './crud-addressee.component.scss',
})
export class CrudAddresseeComponent implements OnInit, OnDestroy {
  /** Injected TranslateService for i18n support */
  private readonly translate = inject(TranslateService);

  /** Toastr service for notifications */
  private readonly toastr = inject(ToastrService);

  /** Injected service for managing custom dialogs */
  private readonly customModalService = inject(CustomModalService);

  /** Injected service for managing CRUD Firestore */
  private readonly genericFirestoreService = inject(GenericFirestoreService<SecondForm>);

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
    buttons: [
      {
        id: 1,
        icon: 'pi pi-check',
        label: this.translate.instant('addressee.buttons.add_addressee'),
        severity: 'primary',
        action: () => this.opneAddEditAddressee(), // Action to reset the table to its initial state
      },
    ],
  };

  /** Header configuration for the table */
  headerData: HeaderTable<SecondForm>[] = [
    {
      field: 'nameDestination',
      header: this.translate.instant('addressee.table.destination_name'),
    },
    {
      field: 'accountDestination',
      header: this.translate.instant('addressee.table.destination_account'),
    },
    {
      field: 'addressDestination',
      header: this.translate.instant('addressee.table.destination_address'),
    },
    {
      field: 'nameBank',
      header: this.translate.instant('addressee.table.bank_name'),
    },
    {
      field: 'addressBank',
      header: this.translate.instant('addressee.table.bank_address'),
    },
    {
      field: 'nif',
      header: this.translate.instant('addressee.table.nif'),
    },
  ];

  /** Configuration for table operations (e.g., delete) */
  operation: ButtonGenericInterface = {
    buttons: [
      {
        id: 1,
        icon: 'pi pi-trash',
        severity: 'danger',
        action: (row: DestinationBDReal) => {
          this.deleteAddressee(row.id);
        },
      },
      {
        id: 2,
        icon: 'pi pi-pencil',
        severity: 'primary',
        action: (row: SecondForm) => {
          this.opneAddEditAddressee(row);
        },
      },
    ],
  };
  dataTable: SecondForm[] = [];

  ngOnInit(): void {
    this.loadAddressee();
  }

  loadAddressee() {
    this.loadingService.show();
    this.subscription.push(
      this.genericFirestoreService
        .getAll(ADDRESSEE_TABLE)
        .pipe(
          tap((v) => {
            this.dataTable = v;
            this.loadingService.hide();
          }),
          catchError((error) => {
            this.dataTable = [];
            this.loadingService.hide();
            this.toastr.error(
              this.translate.instant('common.messages.service_error'),
              this.translate.instant('common.labels.error')
            );

            // Opción 2: Devolver un array vacío para que la aplicación continúe
            return of([]); // of() de 'rxjs'
          })
        )
        .subscribe()
    );
  }
  opneAddEditAddressee(row: SecondForm | undefined = undefined) {
    const { modalServiceRef } = this.customModalService.open(
      InvoicesDestinationFormComponent,
      {
        title: this.translate.instant('addressee.buttons.add_addressee'),
        width: '60vw',
        data: { isModal: true, initialField: row },
        buttons: {
          css: 'flex flex-column md:flex-row md:justify-content-between gap-2',

          buttons: [
            {
              id: 1,
              label: this.translate.instant('common.buttons.save'),
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
              label: this.translate.instant('common.buttons.cancel'),
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
    this.subscription.push(
      this.genericFirestoreService
        .add(ADDRESSEE_TABLE, newAddressee)
        .pipe(
          tap(() => {
            //this.dataTable = v;
            this.loadingService.hide();
          }),
          catchError((error) => {
            this.loadingService.hide();
            this.toastr.error(
              this.translate.instant('common.messages.service_error'),
              this.translate.instant('common.labels.error')
            );

            // Opción 2: Devolver un array vacío para que la aplicación continúe
            return of([]); // of() de 'rxjs'
          })
        )
        .subscribe()
    );
  }

  updateAddressee(addressee: SecondForm) {
    if (!addressee.id) return;
    this.loadingService.show();
    this.subscription.push(
      this.genericFirestoreService
        .update(ADDRESSEE_TABLE, addressee)
        .pipe(
          tap(() => {
            //this.dataTable = v;
            this.loadingService.hide();
          }),
          catchError((error) => {
            //this.dataTable = [];
            this.loadingService.hide();
            this.toastr.error(
              this.translate.instant('common.messages.service_error'),
              this.translate.instant('common.labels.error')
            );

            // Opción 2: Devolver un array vacío para que la aplicación continúe
            return of([]); // of() de 'rxjs'
          })
        )
        .subscribe()
    );
  }

  deleteAddressee(id: string) {
    this.loadingService.show();
    this.subscription.push(
      this.genericFirestoreService
        .delete(ADDRESSEE_TABLE, id)
        .pipe(
          tap(() => {
            //this.dataTable = v;
            this.loadingService.hide();
          }),
          catchError((error) => {
            //this.dataTable = [];
            this.loadingService.hide();
            this.toastr.error(
              this.translate.instant('common.messages.service_error'),
              this.translate.instant('common.labels.error')
            );

            // Opción 2: Devolver un array vacío para que la aplicación continúe
            return of([]); // of() de 'rxjs'
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.forEach((element) => {
      element.unsubscribe();
    });
  }
}
