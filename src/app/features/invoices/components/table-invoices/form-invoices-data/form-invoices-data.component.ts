import { Component, ViewChild, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { map, Observable } from 'rxjs';
import { FormGenericComponent } from '../../../../../shared/components/form-generic/form-generic.component';
import { DataInvoicesTable } from '../../../interfaces/data-invoices-table';
import { FormField, AutocompleteSuggestion } from '../../../../../shared/components/form-generic/interfaces/form-field';
import { TranslateService } from '@ngx-translate/core';
import { InvoicePresetsDataService } from '../../../../../data-access/invoice-presets/invoice-presets-data.service';
import { InvoiceDataPreset } from '../../../interfaces/database-models';

/**
 * Component for managing invoice data in a form.
 * This component is used within a dialog to add or edit invoice data.
 * Supports description autocomplete from pre-saved presets.
 */
@Component({
  selector: 'app-form-invoices-data',
  standalone: true,
  imports: [FormGenericComponent],
  templateUrl: './form-invoices-data.component.html',
  styleUrl: './form-invoices-data.component.scss',
})
export class FormInvoicesDataComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly invoicePresetsService = inject(InvoicePresetsDataService);

  /** Autocomplete suggestions for description field */
  descriptionSuggestions: AutocompleteSuggestion[] = [];

  /** All presets loaded from database */
  private allPresets: InvoiceDataPreset[] = [];

  /** Reference to the FormGenericComponent for managing the form */
  @ViewChild('formTable') formTable!: FormGenericComponent<{
    description: string;
    perCentIva: number | string | { label: string; value: number };
    price?: number;
    qtt?: number;
    total: number;
  }>;

  /** Configuration for the form fields */
  formConfig: FormField<DataInvoicesTable>[] = [
    {
      name: 'description',
      label: this.translate.instant('invoices.table.form.description'),
      type: 'autocomplete',
      cols: 12,
      validators: [
        { validator: Validators.required, message: this.translate.instant('common.validation.required') },
      ],
      primeNgConfig: {
        placeholder: this.translate.instant('invoices.table.form.description_placeholder') || '',
        autocompleteOptions: {
          suggestions: [],
          field: 'label',
          minLength: 1,
          dropdown: true,
          forceSelection: false,
          completeMethod: (event) => this.searchDescriptions(event),
          onSelect: (event) => this.onDescriptionSelect(event),
        },
      },
    },
    {
      name: 'perCentIva',
      label: this.translate.instant('invoices.table.form.iva_percent'),
      type: 'select',
      primeNgConfig: {
        options: [
          { label: this.translate.instant('invoices.table.form.iva_options.21'), value: 21 },
          { label: this.translate.instant('invoices.table.form.iva_options.0'), value: 0 },
        ],
      },
      cols: 6,
      initialData: { label: this.translate.instant('invoices.table.form.iva_options.21'), value: 21 },
      validators: [
        { validator: Validators.required, message: this.translate.instant('common.validation.required') },
      ],
    },
    {
      name: 'total',
      label: this.translate.instant('invoices.table.form.total'),
      type: 'number_currency',
      cols: 6,
      validators: [
        { validator: Validators.required, message: this.translate.instant('common.validation.required') },
        {
          validator: Validators.pattern(/^(?!0+$)(?!0*\.0+$)\d*\.?\d+$/),
          message: this.translate.instant('invoices.table.form.messages.greater_than_zero'),
        },
      ],
    },
    {
      name: 'qtt',
      label: this.translate.instant('invoices.table.form.qtt'),
      type: 'decimal',
      cols: 6,
      validators: [
        {
          validator: Validators.pattern(/^(?!-)(?:\d+(?:\.\d*)?|\.\d+)?$/),
          message: this.translate.instant('invoices.table.form.messages.positive_values'),
        },
      ],
    },
    {
      name: 'price',
      label: this.translate.instant('invoices.table.form.price'),
      type: 'decimal',
      cols: 6,
      validators: [
        {
          validator: Validators.pattern(/^(?!0+$)(?!0*\.0+$)\d*\.?\d+$/),
          message: this.translate.instant('invoices.table.form.messages.positive_values'),
        },
      ],
    },
  ];

  /**
   * Initializes the component and loads presets from database
   */
  ngOnInit(): void {
    this.loadPresets();
  }

  /**
   * Loads all presets from the database
   */
  private loadPresets(): void {
    this.invoicePresetsService.getPresets().subscribe({
      next: (presets) => {
        this.allPresets = presets;
      },
      error: (err) => {
        console.error('Error loading invoice presets:', err);
      },
    });
  }

  /**
   * Searches descriptions based on user input
   * @param event - Autocomplete complete event with query
   */
  private searchDescriptions(event: { query: string }): void {
    const query = event.query.toLowerCase();
    const filtered = this.allPresets
      .filter((preset) => preset.description.toLowerCase().includes(query))
      .map((preset) => ({
        label: preset.description,
        value: preset.description,
        preset: preset,
      }));

    // Update suggestions in the form config
    const descriptionField = this.formConfig.find((f) => f.name === 'description');
    if (descriptionField?.primeNgConfig?.autocompleteOptions) {
      descriptionField.primeNgConfig.autocompleteOptions.suggestions = filtered;
    }
  }

  /**
   * Handles selection of a description from autocomplete
   * @param event - Selection event with selected value
   */
  private onDescriptionSelect(event: { value: AutocompleteSuggestion }): void {
    const selectedPreset = (event.value as any).preset as InvoiceDataPreset | undefined;
    if (selectedPreset) {
      // Increment usage count for the selected preset
      this.invoicePresetsService.incrementUsageCount(selectedPreset.id).subscribe();
    }
  }

  /**
   * Creates a custom synchronous validator.
   * @param errorMio - The error key to return if validation fails.
   * @param validationFn - The validation function to execute.
   * @returns A ValidatorFn that returns a validation error if the condition fails.
   */
  createCustomValidatorD(
    errorMio: string,
    validationFn: (value: any) => boolean
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isValid = validationFn(control.value);
      return isValid ? null : { [errorMio]: true };
    };
  }

  /**
   * Creates a custom asynchronous validator.
   * @param errorMio - The error key to return if validation fails.
   * @param validationFn - The asynchronous validation function to execute.
   * @returns An AsyncValidatorFn that returns a validation error if the condition fails.
   */
  createAsyncValidator(
    errorMio: string,
    validationFn: (value: any) => Observable<boolean>
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return validationFn(control.value).pipe(
        map((isValid) => (isValid ? null : { [errorMio]: true }))
      );
    };
  }
}
