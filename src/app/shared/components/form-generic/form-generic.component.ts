import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberInputEvent, InputNumberModule } from 'primeng/inputnumber';
import { FormField } from './interfaces/form-field';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessagesModule } from 'primeng/messages';
import { DatePickerModule } from 'primeng/datepicker';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { getErrorMessagesFn } from './utils/get-error-messages-fn/get-error-messages-fn';
import { getValidateInputNumberDecimal } from './utils/get-validate-input-number-decimal/get-validate-input-number-decimal';
import { getValidateInputPercentage } from './utils/get-validate-input-percentage/get-validate-input-percentage';
import { VALUES_FORM_LIMIT } from './constants/values-form-limit';
import { getValidateInputInteger } from './utils/get-validate-input-number-integer/get-validate-input-number-integer';
import { SelectModule } from 'primeng/select';

/**
 * Generic dynamic form component that renders fields based on configuration
 * Supports multiple field types: inputs, selects, datepickers, file uploads, etc.
 *
 * @typeparam T - Type of the form data structure
 */
@Component({
  selector: 'app-form-generic',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePickerModule,
    InputTextModule,
    InputSwitchModule,
    SelectModule,
    CheckboxModule,
    MessagesModule,
    InputNumberModule,
    FileUploadComponent
  ],
  templateUrl: './form-generic.component.html',
  styleUrl: './form-generic.component.scss',
})
export class FormGenericComponent<T> implements OnInit {
  /** Constants for form validation limits */
  readonly limitInput = VALUES_FORM_LIMIT;
  readonly negativeInfinity = Number.NEGATIVE_INFINITY;

  /** Form configuration input */
  @Input() formConfig: FormField<T>[] = [];

  /** Reactive form instance */
  private form!: FormGroup;

  /** Stores initial form values */
  groupInitialData: Partial<T> = {};

  /** Change detector reference */
  private readonly cdr = inject(ChangeDetectorRef);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  /**
   * Initializes the component and creates the form
   */
  ngOnInit() {
    this.createForm();
  }

  /**
   * Handles file selection with validation
   * @param files - Selected files array
   * @param fieldName - Target form field name
   */
  onFileSelect(files: File[], fieldName: string): void {
    const fieldConfig = this.formConfig.find((f) => f.name === fieldName);

    // Use custom handler if provided
    if (fieldConfig?.primeNgConfig?.fileOptions?.onSelectHandler) {
      fieldConfig.primeNgConfig.fileOptions.onSelectHandler(files, fieldName);
      return;
    }

    const currentFiles = (this.form.get(fieldName)?.value || []) as File[];
    const allowedExtensions =
      fieldConfig?.primeNgConfig?.fileOptions?.accept || [];

    // Filter valid files
    const newFiles = files.filter(
      (file) =>
        !currentFiles.some(
          (f) =>
            f.name === file.name &&
            f.size === file.size &&
            f.lastModified === file.lastModified
        ) &&
        (allowedExtensions.length === 0 ||
          allowedExtensions.includes(
            file.name.split('.').pop()?.toLowerCase() ?? ''
          ))
    );

    // Update form value if valid files found
    if (newFiles.length > 0) {
      this.form.get(fieldName)?.setValue([...currentFiles, ...newFiles]);
    }
  }

  /**
   * Handles file upload if custom handler exists
   * @param fieldName - Target form field name
   */
  onUpload(fieldName: string): void {
    const files = this.form.get(fieldName)?.value;
    const handler = this.formConfig.find((f) => f.name === fieldName)
      ?.primeNgConfig?.fileOptions?.uploadHandler;

    if (handler && files) {
      handler(files, fieldName);
    }
  }

  /**
   * Clears files from file input field
   * @param fieldName - Target form field name
   */
  onClear(fieldName: string): void {
    this.form.get(fieldName)?.setValue([]);
  }

  /**
   * Creates the reactive form based on configuration
   */
  private createForm(): void {
    const group: { [key in keyof T]?: any } = {};

    this.formConfig.forEach((field) => {
      // Setup validators
      const validators =
        field.validators?.filter((v) => !v.async).map((v) => v.validator) || [];
      const asyncValidators =
        field.validators?.filter((v) => v.async).map((v) => v.validator) || [];

      // Configure form control
      group[field.name] = [
        {
          value:
            field.type === 'file' && !field?.initialData
              ? []
              : field?.initialData,
          disabled:
            field.showComponent === false ? true : field?.disabled ?? false,
        },
        validators,
        asyncValidators,
      ];

      // Store initial data
      this.groupInitialData[field.name] =
        field?.initialData ?? (field.type === 'file' ? [] : '');
    });

    this.form = this.fb.group(group);
  }

  /**
   * Gets form control by name
   * @param name - Field name
   * @returns AbstractControl or null
   */
  getFormControl(name: string): AbstractControl | null {
    return this.form.get(name);
  }

  /**
   * Gets complete raw form values
   * @returns Form data object
   */
  getDataFormComplete(): T {
    return this.form.getRawValue();
  }

  /**
   * Provides access to the form group
   */
  get getGroupForm(): FormGroup {
    return this.form;
  }

  /**
   * Gets validation error messages for a field
   * @param fieldName - Target field name
   * @returns Array of error messages
   */
  getErrorMessages(fieldName: string): string[] {
    const control = this.form.get(fieldName);
    return control
      ? getErrorMessagesFn(fieldName, control, this.formConfig)
      : [];
  }

  /**
   * Validates and formats decimal number input
   * @param event - InputNumber event
   * @param field - Target field name
   */
  validateInputNumberDecimal(
    event: InputNumberInputEvent,
    field: string
  ): void {
    this.handleNumberInput(event, field, getValidateInputNumberDecimal);
  }

  /**
   * Validates and formats percentage input
   * @param event - InputNumber event
   * @param field - Target field name
   */
  validateInputPercentaje(event: InputNumberInputEvent, field: string): void {
    this.handleNumberInput(event, field, getValidateInputPercentage);
  }

  /**
   * Validates and formats integer input
   * @param event - InputNumber event
   * @param field - Target field name
   */
  validateInputInteger(event: InputNumberInputEvent, field: string): void {
    this.handleNumberInput(event, field, getValidateInputInteger);
  }

  /**
   * Common handler for number input validation
   * @param event - Input event
   * @param field - Field name
   * @param validatorFn - Validation function to use
   */
  private handleNumberInput(
    event: InputNumberInputEvent,
    field: string,
    validatorFn: (event: InputNumberInputEvent) => {
      change: boolean;
      value?: number | null;
    }
  ): void {
    const { change, value } = validatorFn(event);

    if (change && value !== undefined) {
      setTimeout(() => {
        this.form.get(field)?.setValue(value, { emitEvent: false });
      });
    }
  }
}
