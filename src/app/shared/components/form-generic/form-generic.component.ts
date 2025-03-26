import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
 * Componente genérico para crear formularios dinámicos basados en una configuración.
 * Soporta múltiples tipos de campos como inputs, dropdowns, calendarios, etc.
 *
 * @typeparam T - Tipo de los datos que se manejarán en el formulario.
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
    FileUploadComponent,
  ],
  templateUrl: './form-generic.component.html',
  styleUrl: './form-generic.component.scss',
})
export class FormGenericComponent<T> implements OnInit {
  /** Valor constante para las monedas,campo enteros y decimales */
  limitInput = VALUES_FORM_LIMIT;
  /** Valor constante para representar el infinito negativo. */
  negativeInfinity = Number.NEGATIVE_INFINITY;

  /** Configuración de los campos del formulario. */
  @Input() formConfig: FormField<T>[] = [];

  /** Formulario reactivo. */
  private form!: FormGroup;

  /** Datos iniciales del formulario. */
  groupInitialData: Partial<T> = {};

  /**
   * Inicializa el componente y crea el formulario.
   */
  ngOnInit() {
    this.createForm();
  }

  /**
   * Constructor del componente.
   *
   * @param fb - Servicio FormBuilder para crear el formulario reactivo.
   */
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  /**
   * Maneja la selección de archivos en un campo de tipo `file`.
   *
   * @param files - Archivos seleccionados.
   * @param fieldName - Nombre del campo que maneja los archivos.
   */
  onFileSelect(files: File[], fieldName: string) {
    const currentFiles = this.form.get(fieldName)?.value || [];
    const fieldConfig = this.formConfig.find(
      (field) => field.name === fieldName
    );

    // Si hay un manejador personalizado, se ejecuta y se sale del método.
    if (fieldConfig?.primeNgConfig?.fileOptions?.onSelectHandler) {
      fieldConfig.primeNgConfig.fileOptions.onSelectHandler(files, fieldName);
      return;
    }

    // Filtra los archivos permitidos.
    const allowedExtensions =
      fieldConfig?.primeNgConfig?.fileOptions?.accept || [];

    const newFiles = files.filter((file) => {
      const isNotDuplicate = !currentFiles.some(
        (currentFile) =>
          currentFile.name === file.name &&
          currentFile.size === file.size &&
          currentFile.lastModified === file.lastModified
      );

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isExtensionAllowed =
        allowedExtensions.length === 0 ||
        (fileExtension && allowedExtensions.includes(fileExtension));

      return isNotDuplicate && isExtensionAllowed;
    });

    // Actualiza el valor del campo con los nuevos archivos.
    if (newFiles.length > 0) {
      const updatedFiles = [...currentFiles, ...newFiles];
      this.form.get(fieldName)?.setValue(updatedFiles);
    }
  }

  /**
   * Maneja la subida de archivos en un campo de tipo `file`.
   *
   * @param fieldName - Nombre del campo que maneja los archivos.
   */
  onUpload(fieldName: string) {
    const files = this.form.get(fieldName)?.value;
    const fieldConfig = this.formConfig.find(
      (field) => field.name === fieldName
    );

    // Si hay un manejador personalizado, se ejecuta.
    if (fieldConfig?.primeNgConfig?.fileOptions?.uploadHandler && files) {
      fieldConfig.primeNgConfig.fileOptions.uploadHandler(files, fieldName);
    }
  }

  /**
   * Limpia los archivos de un campo de tipo `file`.
   *
   * @param fieldName - Nombre del campo que maneja los archivos.
   */
  onClear(fieldName: string) {
    this.form.get(fieldName)?.setValue([]);
  }

  /**
   * Crea el formulario reactivo basado en la configuración proporcionada.
   */
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
          value:
            field.type === 'file' && !field?.initialData
              ? []
              : field?.initialData,
          disabled: field.showComponent === false
            ? true
            : field?.disabled !== undefined
            ? field?.disabled
            : false,
        },
        validators,
        asyncValidators,
      ];
      this.groupInitialData[field.name] =
        field?.initialData !== undefined
          ? field?.initialData
          : field.type === 'file' && !field?.initialData
          ? []
          : '';
    });
    this.form = this.fb.group(group);
  }

  /**
   * Obtiene el control de un campo del formulario.
   *
   * @param name - Nombre del campo.
   * @returns El control del campo.
   */
  getFormControl(name: string) {
    return this.form.get(name);
  }

  /**
   * Obtiene los datos completos del formulario.
   *
   * @returns Los datos del formulario.
   */
  getDataFormComplete() {
    return this.form.getRawValue();
  }

  /**
   * Acceder al metodo y todas las propiedades del formulario
   *
   * @returns devuelve el formulario
   */
  get getGroupForm(): FormGroup {
    return this.form;
  }

  /**
   * Obtiene los mensajes de error para un campo específico.
   *
   * @param fieldName - Nombre del campo.
   * @returns Un array de mensajes de error.
   */
  getErrorMessages(fieldName: string): string[] {
    const control = this.form.get(fieldName);
    return getErrorMessagesFn(fieldName, control, this.formConfig);
  }

  /**
   * Valida y formatea el valor de un campo de tipo número decimal.
   *
   * @param event - Evento de entrada del campo.
   * @param campo - Nombre del campo.
   */
  validateInputNumberDecimal(
    event: InputNumberInputEvent,
    campo: string
  ): void {
    const save = getValidateInputNumberDecimal(event);
    if (save.change) {
      this.form.get(campo)?.setValue(save.value);
    }
  }

  /**
   * Valida y formatea el valor de un campo de tipo porcentaje.
   *
   * @param event - Evento de entrada del campo.
   * @param campo - Nombre del campo.
   */
  validateInputPercentaje(event: InputNumberInputEvent, campo: string) {
    const save = getValidateInputPercentage(event);
    if (save.change) {
      this.form.get(campo)?.setValue(save?.value);
    }
  }

  /**
   * Valida y formatea el valor de un campo de tipo entero.
   *
   * @param event - Evento de entrada del campo.
   * @param campo - Nombre del campo.
   */
  validateInputInteger(event: InputNumberInputEvent, campo: string) {
    const save = getValidateInputInteger(event);
    if (save.change) {
      this.form.get(campo)?.setValue(save?.value);
    }
  }
}
