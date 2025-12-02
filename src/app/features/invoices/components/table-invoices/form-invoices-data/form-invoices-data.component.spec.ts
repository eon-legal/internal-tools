import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormInvoicesDataComponent } from './form-invoices-data.component';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import {
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { InvoicePresetsDataService } from '../../../../../data-access/invoice-presets/invoice-presets-data.service';

describe('FormInvoicesDataComponent', () => {
  let component: FormInvoicesDataComponent;
  let fixture: ComponentFixture<FormInvoicesDataComponent>;
  let mockDialogRef: jest.Mocked<DynamicDialogRef>;
  let mockDialogConfig: Partial<DynamicDialogConfig>;
  let mockTranslateService: Partial<TranslateService>;
  let mockInvoicePresetsService: Partial<InvoicePresetsDataService>;

  beforeEach(async () => {
    mockDialogRef = {
      close: jest.fn(),
    } as unknown as jest.Mocked<DynamicDialogRef>;

    mockDialogConfig = {
      data: {},
    };

    mockTranslateService = {
      instant: jest.fn((key: string) => key),
    };

    mockInvoicePresetsService = {
      getPresets: jest.fn(() => of([])),
      searchPresets: jest.fn(() => of([])),
      incrementUsageCount: jest.fn(() => of({} as any)),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormInvoicesDataComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: mockDialogRef },
        { provide: DynamicDialogConfig, useValue: mockDialogConfig },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: InvoicePresetsDataService, useValue: mockInvoicePresetsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormInvoicesDataComponent);
    component = fixture.componentInstance;

    // Mock completo del FormGenericComponent con funciones jest.fn()
    component.formTable = {
      getForm: {
        markAllAsTouched: jest.fn(),
        get valid() {
          return false;
        },
      },
      getDataFormComplete: jest.fn(() => ({})),
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
  });

  describe('Form Validation', () => {
    it('should have required validator for description field', () => {
      const field = component.formConfig.find((f) => f.name === 'description');
      const requiredValidator = field?.validators?.find(
        (v) => v.message === 'common.validation.required'
      );
      expect(requiredValidator).toBeDefined();
    });

    it('should have min validator for total field', () => {
      const field = component.formConfig.find((f) => f.name === 'total');
      const minValidator = field?.validators?.find(
        (v) => v.message === 'invoices.table.form.messages.greater_than_zero'
      );
      expect(minValidator).toBeDefined();
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
      (
        asyncValidatorFn(control) as Observable<ValidationErrors | null>
      ).subscribe((res) => (result = res));
      tick();

      expect(result).toEqual({ testAsyncError: true });
    }));
  });
});
