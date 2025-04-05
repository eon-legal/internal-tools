import { TestBed, ComponentFixture } from '@angular/core/testing';
import { InvoicesDestinationFormComponent } from './invoices-destination-form.component';
import { FormGenericComponent } from '../form-generic/form-generic.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { InvoicesStore } from '../../../store/app.store';

// Complete mock for InvoicesStore
class MockInvoicesStore {
  getAllMarkFieldForm = jest.fn(() => true);
  getSeconfForm = jest.fn(() => ({
    nameDestination: '',
    accountDestination: '',
    addressDestination: '',
    nameBank: '',
    addressBank: '',
    nif: '',
  }));
  updateSecondForm = jest.fn();
  updateValidSecondForm = jest.fn();
}

describe('InvoicesDestinationFormComponent', () => {
  let component: InvoicesDestinationFormComponent;
  let fixture: ComponentFixture<InvoicesDestinationFormComponent>;
  let mockStore: MockInvoicesStore;

  beforeEach(async () => {
    mockStore = new MockInvoicesStore();

    await TestBed.configureTestingModule({
      imports: [InvoicesDestinationFormComponent, FormGenericComponent],
      providers: [{ provide: InvoicesStore, useValue: mockStore }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicesDestinationFormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test básico de creación
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // Tests para ngAfterViewInit
  it('should mark all fields as touched when store requires field marking', () => {
    mockStore.getAllMarkFieldForm.mockReturnValue(true);
    fixture.detectChanges();

    expect(mockStore.getAllMarkFieldForm).toHaveBeenCalled();
    expect(component.formDestinationGenericComponent.getGroupForm.touched).toBe(
      true
    );
  });

  it('should not mark fields when store does not require field marking', () => {
    mockStore.getAllMarkFieldForm.mockReturnValue(false);
    fixture.detectChanges();

    expect(mockStore.getAllMarkFieldForm).toHaveBeenCalled();
    expect(component.formDestinationGenericComponent.getGroupForm.touched).toBe(
      false
    );
  });

  // Tests para ngOnDestroy
  it('should update store with form data on destroy', () => {
    const testData = {
      nameDestination: 'Test Name',
      accountDestination: '123456',
      addressDestination: 'Test Address',
      nameBank: 'Test Bank',
      addressBank: 'Bank Address',
      nif: '12345678A',
    };

    fixture.detectChanges();
    component.formDestinationGenericComponent.getGroupForm.setValue(testData);
    component.ngOnDestroy();

    expect(mockStore.updateSecondForm).toHaveBeenCalledWith(testData);
  });

  it('should update validSecondForm to true when form is valid on destroy', () => {
    const validData = {
      nameDestination: 'Valid Name',
      accountDestination: '123456',
      addressDestination: 'Valid Address',
      nameBank: 'Valid Bank',
      addressBank: 'Bank Address',
      nif: '12345678A',
    };

    fixture.detectChanges();
    component.formDestinationGenericComponent.getGroupForm.setValue(validData);
    component.ngOnDestroy();

    expect(mockStore.updateValidSecondForm).toHaveBeenCalledWith(true);
  });

  it('should update validSecondForm to false when form is invalid on destroy', () => {
    const invalidData = {
      nameDestination: '', // Campo requerido vacío
      accountDestination: '',
      addressDestination: '',
      nameBank: '',
      addressBank: '',
      nif: '',
    };

    fixture.detectChanges();
    component.formDestinationGenericComponent.getGroupForm.setValue(
      invalidData
    );
    component.ngOnDestroy();

    expect(mockStore.updateValidSecondForm).toHaveBeenCalledWith(false);
  });

  // Tests para getSecondFormStore
  it('should call getSeconfForm from store when getting form data', () => {
    component.getSecondFormStore();
    expect(mockStore.getSeconfForm).toHaveBeenCalled();
  });

  // Tests para isValidForm
  it('should return true when form is valid', () => {
    const validData = {
      nameDestination: 'Valid Name',
      accountDestination: '123456',
      addressDestination: 'Valid Address',
      nameBank: 'Valid Bank',
      addressBank: 'Bank Address',
      nif: '12345678A',
    };

    fixture.detectChanges();
    component.formDestinationGenericComponent.getGroupForm.setValue(validData);
    expect(component.isValidForm()).toBe(true);
  });

  it('should return false when form is invalid', () => {
    const invalidData = {
      nameDestination: '', // Campo requerido vacío
      accountDestination: '',
      addressDestination: '',
      nameBank: '',
      addressBank: '',
      nif: '',
    };

    fixture.detectChanges();
    component.formDestinationGenericComponent.getGroupForm.setValue(
      invalidData
    );
    expect(component.isValidForm()).toBe(false);
  });

  // Tests para getValueForm
  it('should return current form data', () => {
    const testData = {
      nameDestination: 'Test Name',
      accountDestination: '123456',
      addressDestination: 'Test Address',
      nameBank: 'Test Bank',
      addressBank: 'Bank Address',
      nif: '12345678A',
    };

    fixture.detectChanges();
    component.formDestinationGenericComponent.getGroupForm.setValue(testData);
    expect(component.getValueForm()).toEqual(testData);
  });

  // Test para la configuración inicial del formulario
  it('should initialize form with data from store', () => {
    const storeData = {
      nameDestination: 'Store Name',
      accountDestination: '789012',
      addressDestination: 'Store Address',
      nameBank: 'Store Bank',
      addressBank: 'Store Bank Address',
      nif: '98765432B',
    };

    // Configurar el mock ANTES de crear el componente
    mockStore.getSeconfForm.mockReturnValue(storeData);

    // Recrear el componente con los nuevos datos del mock
    fixture = TestBed.createComponent(InvoicesDestinationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Verificar que los datos del store se usaron para inicializar el formulario
    expect(component.formConfig[0].initialData).toBe(storeData.nameDestination);
    expect(component.formConfig[1].initialData).toBe(
      storeData.accountDestination
    );
    expect(component.formConfig[2].initialData).toBe(
      storeData.addressDestination
    );
    expect(component.formConfig[3].initialData).toBe(storeData.nameBank);
    expect(component.formConfig[4].initialData).toBe(storeData.addressBank);
    expect(component.formConfig[5].initialData).toBe(storeData.nif);
    // Verificar todos los campos...
  });
});
/**
 *   /*beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        InvoicesDestinationFormComponent
      ],
      providers: [
        { provide: InvoicesStore, useClass: MockInvoicesStore },
        { provide: FormGenericComponent, useClass: MockFormGenericComponent }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicesDestinationFormComponent);
    component = fixture.componentInstance;
    
    // Get the mock instances
    mockStore = TestBed.inject(InvoicesStore) as unknown as MockInvoicesStore;
    mockFormGeneric = TestBed.inject(FormGenericComponent) as unknown as MockFormGenericComponent;
    
    // Initialize ViewChild with our complete mock
    component.formDestinationGenericComponent = {
      getGroupForm: mockFormGeneric.getGroupForm,
      getDataFormComplete: mockFormGeneric.getDataFormComplete
    } as any;
  });*/
