import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { FormGenericComponent } from '../../../../shared/components/form-generic/form-generic.component';
import { FisrtForm, IdentificationType } from '../../interfaces/first-form';
import { InvoicesStore } from '../../../../store/app.store';
import { FormField } from '../../../../shared/components/form-generic/interfaces/form-field';
import { TranslateService } from '@ngx-translate/core';
import {
  spanishIdValidator,
  getIdValidationErrorKey,
} from '../../../../shared/validators/spanish-id.validator';
import { Subscription } from 'rxjs';

/**
 * Component for managing the sender form in the invoice generation process.
 * This form collects details about the sender, such as name, address, and invoice dates.
 * Includes dynamic validation for identification fields based on the selected type.
 */
@Component({
  selector: 'app-invoices-sender-form',
  standalone: true,
  imports: [FormGenericComponent],
  templateUrl: './invoices-sender-form.component.html',
  styleUrl: './invoices-sender-form.component.scss',
})
export class InvoicesSenderFormComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  /** Injected services */
  private readonly translate = inject(TranslateService);
  readonly store = inject(InvoicesStore);

  /** Subscription for identification type changes */
  private idTypeSubscription?: Subscription;

  /** Current identification type */
  private currentIdType: IdentificationType = 'DNI';

  /** Reference to the FormGenericComponent for managing the form */
  @ViewChild('formSenderGenericComponent')
  formSenderGenericComponent!: FormGenericComponent<FisrtForm>;

  /** Common validators for required fields */
  usualValidate = [
    {
      validator: Validators.required,
      message: this.translate.instant('common.validation.required'),
    },
  ];

  /** Configuration for the form fields */
  formConfig: FormField<FisrtForm>[] = [];

  /**
   * Initializes the form configuration with the current identification type.
   */
  ngOnInit(): void {
    this.currentIdType = this.getFirstFormStore()?.identificationType || 'DNI';
    this.buildFormConfig();
  }

  /**
   * Builds the form configuration with proper validators for the current identification type.
   */
  private buildFormConfig(): void {
    this.formConfig = [
      {
        name: 'date',
        label: this.translate.instant('invoices.sender_form.date'),
        type: 'calendar',
        cols: 6,
        initialData: this.getFirstFormStore()?.date || new Date(),
        validators: this.usualValidate,
      },
      {
        name: 'name',
        label: this.translate.instant('invoices.sender_form.sender_name'),
        type: 'input',
        cols: 6,
        initialData: this.getFirstFormStore()?.name,
        validators: this.usualValidate,
      },
      {
        name: 'identificationType',
        label: this.translate.instant(
          'invoices.sender_form.identification_type'
        ),
        type: 'radio',
        cols: 12,
        initialData: this.currentIdType,
        primeNgConfig: {
          radioOptions: {
            options: [
              { label: 'DNI', value: 'DNI' },
              { label: 'NIE', value: 'NIE' },
              {
                label: this.translate.instant('invoices.sender_form.passport'),
                value: 'Passport',
              },
              { label: 'CIF', value: 'CIF' },
            ],
            layout: 'horizontal',
          },
        },
      },
      {
        name: 'identification',
        label: this.translate.instant(
          'invoices.sender_form.sender_identification'
        ),
        type: 'input',
        cols: 6,
        initialData: this.getFirstFormStore()?.identification,
        validators: this.getIdentificationValidators(this.currentIdType),
      },
    ];
  }

  /**
   * Gets validators for the identification field based on the type.
   */
  private getIdentificationValidators(type: IdentificationType) {
    return [
      {
        validator: Validators.required,
        message: this.translate.instant('common.validation.required'),
      },
      {
        validator: spanishIdValidator(type),
        message: this.translate.instant(getIdValidationErrorKey(type)),
      },
    ];
  }

  /**
   * Lifecycle hook that runs after the view is initialized.
   * Sets up the form with initial data and validators.
   */
  ngAfterViewInit() {
    const first = this.store.firstForm();
    if (this.store.getAllMarkFieldForm())
      this.formSenderGenericComponent?.getForm?.markAllAsTouched();
    this.formSenderGenericComponent?.getForm?.patchValue(first);

    // Subscribe to identification type changes
    this.setupIdTypeChangeListener();
  }

  /**
   * Sets up a listener for identification type changes to update validators dynamically.
   */
  private setupIdTypeChangeListener(): void {
    const form = this.formSenderGenericComponent?.getForm;
    if (!form) return;

    const idTypeControl = form.get('identificationType');
    const idControl = form.get('identification');

    if (idTypeControl && idControl) {
      this.idTypeSubscription = idTypeControl.valueChanges.subscribe(
        (newType: IdentificationType) => {
          if (newType && newType !== this.currentIdType) {
            this.currentIdType = newType;
            this.updateIdentificationValidators(newType);
          }
        }
      );
    }
  }

  /**
   * Updates the validators for the identification field based on the new type.
   */
  private updateIdentificationValidators(type: IdentificationType): void {
    const form = this.formSenderGenericComponent?.getForm;
    if (!form) return;

    const idControl = form.get('identification');
    if (idControl) {
      // Clear existing validators and set new ones
      idControl.clearValidators();
      idControl.setValidators([
        Validators.required,
        spanishIdValidator(type),
      ]);
      idControl.updateValueAndValidity();

      // Update the form config validators array for error message display
      const idFieldConfig = this.formConfig.find(
        (f) => f.name === 'identification'
      );
      if (idFieldConfig) {
        idFieldConfig.validators = this.getIdentificationValidators(type);
      }
    }
  }

  /**
   * Updates the form data with the provided object.
   * @param data - The data to update the form with.
   */
  changeData(data: object) {
    this.formSenderGenericComponent.getForm.patchValue(data);
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Updates the store with the current form data.
   */
  ngOnDestroy(): void {
    this.idTypeSubscription?.unsubscribe();

    this.store.updateFirstForm(
      this.formSenderGenericComponent?.getDataFormComplete()
    );
    if (this.formSenderGenericComponent?.getForm.valid) {
      this.store.updateValidFirstForm(true);
    } else {
      this.store.updateValidFirstForm(false);
    }
  }

  /**
   * Retrieves the first form data from the store.
   * @returns The first form data.
   */
  getFirstFormStore() {
    return this.store.getFirstForm();
  }
}
