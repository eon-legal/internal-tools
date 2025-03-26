import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormInvoicesDataComponent } from './form-invoices-data.component';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';

describe('FormInvoicesDataComponent', () => {
  let component: FormInvoicesDataComponent;
  let fixture: ComponentFixture<FormInvoicesDataComponent>;
  let mockDialogRef: jest.Mocked<DynamicDialogRef>;
  let mockDialogConfig: Partial<DynamicDialogConfig>;

  beforeEach(async () => {
    mockDialogRef = {
      close: jest.fn()
    } as unknown as jest.Mocked<DynamicDialogRef>;

    mockDialogConfig = {
      data: {}
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormInvoicesDataComponent
      ],
      providers: [
        { provide: DynamicDialogRef, useValue: mockDialogRef },
        { provide: DynamicDialogConfig, useValue: mockDialogConfig }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormInvoicesDataComponent);
    component = fixture.componentInstance;
    
    // Mock completo del FormGenericComponent con funciones jest.fn()
    component.formTable = {
      getGroupForm: {
        markAllAsTouched: jest.fn(),
        get valid() { return false; }
      },
      getDataFormComplete: jest.fn(() => ({}))
    } as any;

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize form configuration with correct fields', () => {
      expect(component.formConfig).toBeDefined();
      expect(component.formConfig.length).toBe(5);
    });

    it('should initialize buttons configuration correctly', () => {
      expect(component.buttons.buttons.length).toBe(2);
      expect(component.buttons.buttons[0].label).toBe('Cerrar');
      expect(component.buttons.buttons[1].label).toBe('Agregar');
    });
  });

  describe('Form Validation', () => {
    it('should have required validator for description field', () => {
      const field = component.formConfig.find(f => f.name === 'description');
      const requiredValidator = field?.validators?.find(v => 
        v.message === 'Campo requerido.'
      );
      expect(requiredValidator).toBeDefined();
    });

    it('should have min validator for total field', () => {
      const field = component.formConfig.find(f => f.name === 'total');
      const minValidator = field?.validators?.find(v => 
        v.message === 'Deben ser valores mayores que cero'
      );
      expect(minValidator).toBeDefined();
    });
  });

  describe('Button Actions', () => {
    it('should call accept method when add button is clicked', () => {
      const markAllAsTouchedSpy = jest.spyOn(component.formTable.getGroupForm, 'markAllAsTouched');
      const addButton = component.buttons.buttons[1];
      addButton.action();
      expect(markAllAsTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('Dialog Methods', () => {
    it('should not close dialog when accept is called with invalid form', () => {
      const markAllAsTouchedSpy = jest.spyOn(component.formTable.getGroupForm, 'markAllAsTouched');
      component.accept();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
      expect(markAllAsTouchedSpy).toHaveBeenCalled();
    });

    it('should close dialog with form data when accept is called with valid form', () => {
      const testData = { description: 'Test', perCentIva: 21, total: 100 };
      
      // Mock form as valid
      jest.spyOn(component.formTable.getGroupForm, 'valid', 'get').mockReturnValue(true);
      component.formTable.getDataFormComplete = jest.fn(() => testData);

      component.accept();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith(testData);
    });
  });

  describe('Custom Validators', () => {
    it('should create custom synchronous validator', () => {
      const validatorFn = component.createCustomValidatorD(
        'testError', 
        (value) => value === 'valid'
      );
      const control = { value: 'invalid' } as AbstractControl;
      expect(validatorFn(control)).toEqual({ testError: true });
    });

    it('should create custom async validator', fakeAsync(() => {
      const asyncValidatorFn = component.createAsyncValidator(
        'testAsyncError',
        (value) => of(value === 'valid')
      );
      const control = { value: 'invalid' } as AbstractControl;
      
      let result: ValidationErrors | null = null;
      (asyncValidatorFn(control) as Observable<ValidationErrors | null>).subscribe(res => result = res);
      tick();
      
      expect(result).toEqual({ testAsyncError: true });
    }));
  });
});