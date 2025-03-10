import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

import { InputNumberInputEvent, InputNumberModule } from 'primeng/inputnumber';

import { FormField } from '../../interfaces/form-field';

import { DropdownModule } from 'primeng/dropdown';

import { InputSwitchModule } from 'primeng/inputswitch';
import { MessagesModule } from 'primeng/messages';

import { DatePickerModule } from 'primeng/datepicker';
import {
  getErrorMessagesFn,
  getValidateInputNumberDecimal,
  getValidateInputPercentaje,
} from '../../utils/get-validate-input-decimal-percentaje-messages';

@Component({
  selector: 'app-form-generic',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePickerModule,
    InputTextModule,
    InputSwitchModule,
    DropdownModule,
    CheckboxModule,
    MessagesModule,
    InputNumberModule,
  ],
  templateUrl: './form-generic.component.html',
  styleUrl: './form-generic.component.scss',
  host: { 'some-binding': 'some-value' },
})
export class FormGenericComponent<T> implements OnInit {
  @Input() formConfig: FormField<T>[] = [];
  form!: FormGroup;
  groupInitialData: Partial<T> = {};

  cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit() {
    this.createForm();
    this.subscribeToAsyncValidators();
  }

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  private createForm() {
    const group: { [key in keyof T]?: any } = {};

    this.formConfig.forEach((field) => {
      const validators =
        field.validators?.filter((v) => !v.async)?.map((v) => v.validator) ||
        [];

      const asyncValidators =
        field.validators?.filter((v) => v.async)?.map((v) => v.validator) || [];

      group[field.name] = [
        {
          value: field?.initialData,
          disabled: field?.disabled !== undefined ? field?.disabled : false,
        },
        validators,
        asyncValidators,
      ];
      this.groupInitialData[field.name] =
        field?.initialData !== undefined ? field?.initialData : '';
    });
    this.form = this.fb.group(group);
  }

  getFormControl(name: string) {
    return this.form.get(name);
  }

  getDataFormComplete() {
    return this.form.getRawValue();
  }

  formValid(): boolean {
    return this.form.valid;
  }

  changesValuesForm() {
    return this.form.valueChanges;
  }

  changesStatusForm() {
    return this.form.statusChanges;
  }

  doMarkField() {
    this.form.markAllAsTouched();
  }

  cleanCompleteForm() {
    this.form.reset();
  }

  establishDataInitial() {
    this.form.patchValue(this.groupInitialData);
  }

  establishDataParams(data: object) {
    this.form.patchValue(data);
  }

  resetStatusTouched() {
    this.form.markAsUntouched();
    this.form.markAsPristine();
  }

  private subscribeToAsyncValidators() {
    this.formConfig.forEach((field) => {
      const control = this.form.get(field.name);
      if (control) {
        control.statusChanges.subscribe((status) => {
          if (status === 'VALID' || status === 'INVALID') {
            this.cdr.detectChanges(); // Forzar la detección de cambios
          }
        });
      }
    });
  }

  getErrorMessages(fieldName: string): string[] {
    const control = this.form.get(fieldName);
    return getErrorMessagesFn(fieldName, control, this.formConfig);
  }

  validateInputNumberDecimal(event: InputNumberInputEvent, campo: string) {
    const save = getValidateInputNumberDecimal(event);
    if (save.change) {
      this.form.get(campo)?.setValue(save?.value);
    }
  }

  validateInputPercentaje(event: InputNumberInputEvent, campo: string) {
    const save = getValidateInputPercentaje(event);
    if (save.change) {
      this.form.get(campo)?.setValue(save?.value);
    }
  }
}
