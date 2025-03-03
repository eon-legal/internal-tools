import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import {
  AsyncValidatorFn,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

import { InputNumberModule } from 'primeng/inputnumber';

import { FormField } from '../../interfaces/form-field';
import { Observable, Subject, takeUntil } from 'rxjs';

import { DropdownModule } from 'primeng/dropdown';
//import { CalendarModule } from 'primeng/calendar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessagesModule } from 'primeng/messages';


import { DatePickerModule } from 'primeng/datepicker';

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
    InputNumberModule
  ],
  templateUrl: './form-generic.component.html',
  styleUrl: './form-generic.component.scss',
})
export class FormGenericComponent<T> implements OnInit {
  @Input() formConfig: FormField<T>[] = [];
  form!: FormGroup;
  groupInitialData: any = {};

  private destroy$ = new Subject<void>();
  private externalListeners: ((value: any) => void)[] = [];
  cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  // Nuevo método para registrar listeners externos
  registerListener(callback: (value: any) => void) {
    this.externalListeners.push(callback);
  }

  ngOnInit() {
    this.createForm();
    this.subscribeToAsyncValidators();
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

  /*getErrorMessages(fieldName: string): string[] {
    const control = this.form.get(fieldName);
    if (
      !control ||
      !control.errors ||
      (!control.touched && !control.dirty) ||
      control.pending
    ) {
      return [];
    }
    const field = this.formConfig.find((f) => f.name === fieldName);

    if (!field || !field.validators) {
      return [];
    }

    const errors = control.errors;
    const messages: string[] = [];
    for (const errorKey of Object.keys(errors)) {
      const validator = field.validators.find((v) => {
        const validatorName = this.getValidatorName(v.validator);
        return validatorName === errorKey;
      });

      if (validator) {
        messages.push(validator.message);
      }
    }
    return messages;
  }*/

    getErrorMessages(fieldName: string): string[] {
      const control = this.form.get(fieldName);
    
      // Si no hay control o no hay errores, retornar un array vacío
      if (!control || !control.errors) {
        return [];
      }
    
      // Si el control está "pending", no mostramos errores hasta que finalice
      if (control.pending) {
        return [];
      }
    
      // Si el control no está "touched" ni "dirty", retornar un array vacío
      if (!control.touched && !control.dirty) {
        return [];
      }
    
      // Obtener el campo correspondiente en formConfig
      const field = this.formConfig.find((f) => f.name === fieldName);
      if (!field || !field.validators) {
        return [];
      }
    
      // Obtener los errores del control
      const errors = control.errors;
      const messages: string[] = [];
    
      // Mapear los errores a los mensajes correspondientes
      for (const errorKey of Object.keys(errors)) {
        const validator = field.validators.find((v) => {
          const validatorName = this.getValidatorName(v.validator);
          return validatorName === errorKey;
        });
    
        if (validator) {
          messages.push(validator.message);
        }
      }
    
      return messages;
    }

    private getValidatorName(validator: ValidatorFn | AsyncValidatorFn): string {
      // Validadores estáticos
      if (validator === Validators.required) return 'required';
      if (validator === Validators.email) return 'email';
    
      // Validadores dinámicos (minLength, min, maxLength, max, pattern)
      if (this.isValidatorType(validator, Validators.minLength)) return 'minlength';
      if (this.isValidatorType(validator, Validators.min)) return 'min';
      if (this.isValidatorType(validator, Validators.maxLength)) return 'maxlength';
      if (this.isValidatorType(validator, Validators.max)) return 'max';
      if (this.isValidatorType(validator, Validators.pattern)) return 'pattern';
    
      // Validadores asíncronos
      if (this.isAsyncValidator(validator)) {
        return validator.name || 'asyncValidator';
      }
    
      // Validadores personalizados
      if (typeof validator === 'function') {
        // Intentamos obtener el nombre del validador personalizado
        const validatorName = validator.name;
    
        // Si el validador tiene un nombre, lo devolvemos
        if (validatorName) {
          return validatorName;
        }
    
        // Si no tiene nombre, intentamos obtener el nombre del error que devuelve
        const control = new FormControl('');
        control.setValidators(validator as ValidatorFn);
        control.updateValueAndValidity();
    
        if (control.errors) {
          const errorKey = Object.keys(control.errors)[0];
          return errorKey || 'customValidator';
        }
      }
    
      // Si no se puede determinar el nombre, devolvemos un valor por defecto
      return 'unknownValidator';
    }
    
    private isValidatorType(validator: ValidatorFn | AsyncValidatorFn, validatorType: Function): boolean {
      // Creamos una instancia del validador tipo para comparar
      const sampleValidator = validatorType(/.*/); // Usamos una expresión regular genérica para pattern
      return validator.toString() === sampleValidator.toString();
    }

  private isAsyncValidator(validator: ValidatorFn | AsyncValidatorFn): boolean {
    // Creamos un control ficticio para probar el validador
    const control = new FormControl('');

    try {
      const result = validator(control);
      // Si el resultado es una Promise o un Observable, es un validador asíncrono
      return result instanceof Promise || result instanceof Observable;
    } catch (error) {
      // Si hay un error, asumimos que no es un validador asíncrono
      return false;
    }
  }

}
