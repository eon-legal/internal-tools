import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormGenericComponent } from './form-generic.component';
import { FormField } from './interfaces/form-field';

describe('FormGenericComponent', () => {
  let component: FormGenericComponent<any>;
  let fixture: ComponentFixture<FormGenericComponent<any>>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        InputSwitchModule,
        CheckboxModule,
        DatePickerModule,
        FileUploadComponent,
        FormGenericComponent, // Importa el componente standalone
      ],
      providers: [
        FormBuilder,
        provideHttpClient(), // Proporciona HttpClient
        provideHttpClientTesting(), // Proporciona HttpClientTestingBackend
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormGenericComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should create the getGroupForm based on formConfig', () => {
    const formConfig: FormField<any>[] = [
      {
        name: 'name',
        type: 'input',
        label: 'Name',
        validators: [],
      },
      {
        name: 'age',
        type: 'number',
        label: 'Age',
        validators: [],
      },
    ];

    component.formConfig = formConfig;
    component.ngOnInit(); // Llama a ngOnInit para crear el formulario

    expect(component.getGroupForm).toBeInstanceOf(FormGroup);
    expect(component.getGroupForm.contains('name')).toBeTruthy();
    expect(component.getGroupForm.contains('age')).toBeTruthy();
  });

  it('should render input fields based on formConfig', () => {
    const formConfig: FormField<{ name: string }>[] = [
      {
        name: 'name',
        type: 'input',
        label: 'Name',
        validators: [],
      },
    ];

    component.formConfig = formConfig;
    component.ngOnInit();
    fixture.detectChanges(); // Asegúrate de que el template se actualice

    const inputElement = fixture.nativeElement.querySelector('input');
    expect(inputElement).toBeTruthy();
    expect(inputElement.getAttribute('ng-reflect-name')).toBe('name');
  });

  it('should show error messages when a field is invalid', () => {
    const formConfig: FormField<{ name: string }>[] = [
      {
        name: 'name',
        type: 'input',
        label: 'Name',
        validators: [
          { validator: Validators.required, message: 'The name is required' },
        ],
      },
    ];

    component.formConfig = formConfig;
    component.ngOnInit(); // Inicializa el formulario

    // Marcar el campo como "tocado" y "sucio" para forzar la validación
    component.getGroupForm.get('name')?.markAsTouched();

    component.getGroupForm.get('name')?.markAsDirty();

    fixture.detectChanges(); // Actualizar vista

    // Verificar que el mensaje de error se muestre en el DOM
    const errorMessageElement =
      fixture.nativeElement.querySelector('.p-error small');
    expect(errorMessageElement).toBeTruthy(); // Verificar que el elemento existe
    expect(errorMessageElement.textContent).toContain('The name is required'); // Verificar el mensaje
  });

  it('should handle file selection', () => {
    const formConfig: FormField<any>[] = [
      {
        name: 'file',
        type: 'file',
        label: 'File',
        validators: [],
        primeNgConfig: {
          fileOptions: {
            accept: ['pdf'], // Proporciona un valor para `accept`
          },
        },
      },
    ];

    component.formConfig = formConfig;
    component.ngOnInit();
    fixture.detectChanges(); // Asegúrate de que el template se actualice

    const mockFiles = [new File([''], 'test.pdf', { type: 'application/pdf' })];
    component.onFileSelect(mockFiles, 'file');

    expect(component.getGroupForm.get('file')?.value).toEqual(mockFiles);
  });

  it('should handle file upload', () => {
    const formConfig: FormField<any>[] = [
      {
        name: 'file',
        type: 'file',
        label: 'File',
        validators: [],
        primeNgConfig: {
          fileOptions: {
            accept: ['pdf'], // Proporciona un valor para `accept`
            uploadHandler: jest.fn(),
          },
        },
      },
    ];

    component.formConfig = formConfig;
    component.ngOnInit();
    fixture.detectChanges(); // Asegúrate de que el template se actualice

    const mockFiles = [new File([''], 'test.pdf', { type: 'application/pdf' })];
    component.getGroupForm.get('file')?.setValue(mockFiles);
    component.onUpload('file');

    expect(
      formConfig[0].primeNgConfig?.fileOptions?.uploadHandler
    ).toHaveBeenCalledWith(mockFiles, 'file');
  });

  it('should clear files', () => {
    const formConfig: FormField<any>[] = [
      {
        name: 'file',
        type: 'file',
        label: 'File',
        validators: [],
        primeNgConfig: {
          fileOptions: {
            accept: ['pdf'], // Proporciona un valor para `accept`
          },
        },
      },
    ];

    component.formConfig = formConfig;
    component.ngOnInit();
    fixture.detectChanges(); // Asegúrate de que el template se actualice

    const mockFiles = [new File([''], 'test.pdf', { type: 'application/pdf' })];
    component.getGroupForm.get('file')?.setValue(mockFiles);
    component.onClear('file');

    expect(component.getGroupForm.get('file')?.value).toEqual([]);
  });

  it('should validate and format decimal input', fakeAsync(() => {
    const formConfig: FormField<{ price: number }>[] = [
      {
        name: 'price',
        type: 'decimal',
        label: 'Price',
        validators: [],
      },
    ];

    component.formConfig = formConfig;
    component.ngOnInit();
    fixture.detectChanges(); // Asegúrate de que el template se actualice

    const mockEvent = { value: '123.456' };
    component.validateInputNumberDecimal(mockEvent as any, 'price');
    tick();
    expect(component.getGroupForm.get('price')?.value).toBe(123.45); // Redondeado a 2 decimales
  }));

  it('should validate and format percentage input', fakeAsync(() => {
    const formConfig: FormField<{ discount: number }>[] = [
      {
        name: 'discount',
        type: 'number_percent',
        label: 'Discount',
        validators: [],
      },
    ];

    component.formConfig = formConfig;
    component.ngOnInit();
    fixture.detectChanges(); // Asegúrate de que el template se actualice

    const mockEvent = { value: '50.123' };
    component.validateInputPercentaje(mockEvent as any, 'discount');
    tick();
    expect(component.getGroupForm.get('discount')?.value).toBe(50.12); // Redondeado a 2 decimales
  }));
});
