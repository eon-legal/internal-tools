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
import { GenericFirestoreService } from '../../services/generic-firestore/generic-firestore.service';
import { ADDRESSEE_TABLE } from '../../../features/crud-addressee/constants/collection-table';
import { catchError, of, Subscription, tap } from 'rxjs';
import { SELECT_DATA_INITIAL } from '../form-generic/constants/select-data-initial';
import { ToastrService } from 'ngx-toastr';
import { MESSAGE_ERROR } from '../../constants/message-error';
import { LoadingService } from '../../services/loading/loading.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * Component for managing the destination form in the invoice generation process.
 * This form collects details about the destination, such as name, address, and bank information.
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
  private readonly genericFirestoreService = inject(GenericFirestoreService<SecondForm>);
  private readonly toastr = inject(ToastrService);
  private readonly loadingService = inject(LoadingService);

  /** subscription for clean component observable */
  subscription: Subscription[] = [];
  /** save data when consume service table adressee */
  saveDataService: SecondForm[] = [];
  /** isModal know component mananage like modal */
  @Input() isModal: boolean = false;
  @Input() initialField!: SecondForm;

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
      this.genericFirestoreService
        .getAll(ADDRESSEE_TABLE)
        .pipe(
          tap((v) => {
            const result = v as DestinationBDReal[];
            const arrayTrasnsformDropDown = result.map((e) => ({
              label: e.nameDestination,
              value: e.id,
            }));
            if (
              this.formConfig.length &&
              Array.isArray(arrayTrasnsformDropDown)
            ) {
              if (this.formConfig[0]) {
                this.formConfig[0]!.primeNgConfig!.options = [
                  SELECT_DATA_INITIAL,
                  ...arrayTrasnsformDropDown,
                ];
              }
            }

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
            this.subscription.push(
              this.genericFirestoreService
                .getById(ADDRESSEE_TABLE, value.value)
                .pipe(
                  tap((v) => {
                    this.formDestinationGenericComponent?.getForm?.patchValue(
                      v
                    );
                    this.loadingService.hide();
                  }),
                  catchError((error) => {
                    this.loadingService.hide();
                    this.toastr.error(MESSAGE_ERROR, 'Error');
                    // Opción 2: Devolver un array vacío para que la aplicación continúe
                    return of([]); // of() de 'rxjs'
                  })
                )
                .subscribe()
            );
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
   * @returns True if the form is valid, otherwise false.
   */
  isValidForm(): boolean {
    return this.formDestinationGenericComponent?.getForm?.valid;
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
}
