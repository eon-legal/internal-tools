import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { NgClass } from '@angular/common';
import { FormField } from '../../../core/interfaces/form-field';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-form-generic',
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
    DatePicker,
    InputTextModule,
    ToggleSwitchModule,
    SelectModule,
    CheckboxModule,
    InputNumberModule,
  ],
  templateUrl: './form-generic.component.html',
  styleUrl: './form-generic.component.scss',
})
export class FormGenericComponent implements OnInit {
  @Input() formConfig: FormField[] = [];
  form!: FormGroup;
  groupInitialData: any = {};

  private destroy$ = new Subject<void>();
  private externalListeners: ((value: any) => void)[] = [];

  // Nuevo método para registrar listeners externos
  registerListener(callback: (value: any) => void) {
    this.externalListeners.push(callback);
  }

  ngOnInit() {
    this.createForm();
    this.setupInternalObservables();
  }

  private setupInternalObservables() {
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.externalListeners.forEach((callback) => callback(value));
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  private createForm() {
    const group: any = {};

    this.formConfig.forEach((field) => {
      group[field.name] = [
        {
          value: field?.initialData !== undefined ? field?.initialData : '',
          disabled: field?.disabled !== undefined ? field?.disabled : false,
        },
        field.validators || [],
      ];
      this.groupInitialData[field.name] =
        field?.initialData !== undefined ? field?.initialData : '';
    });
    this.form = this.fb.group(group);
  }

  getFormControl(name: string) {
    return this.form.get(name);
  }

  getDataFormComlete() {
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
}
