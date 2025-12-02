import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientFormComponent } from './client-form.component';
import { FormGenericComponent } from '../../../../shared/components/form-generic/form-generic.component';
import { TranslateService } from '@ngx-translate/core';
import { IndividualClient, CompanyClient } from '../../../invoices/interfaces/database-models';

const mockIndividualClient: IndividualClient = {
  id: '1',
  client_type: 'individual',
  first_name: 'John',
  last_name: 'Doe',
  nif: '12345678A',
  address: '123 Main St',
  national: true,
  is_default: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockCompanyClient: CompanyClient = {
  id: '2',
  client_type: 'company',
  company_name: 'Acme Corp',
  nif: '87654321B',
  address: '456 Business Ave',
  national: false,
  is_default: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('ClientFormComponent', () => {
  let component: ClientFormComponent;
  let fixture: ComponentFixture<ClientFormComponent>;
  let mockTranslateService: jest.Mocked<TranslateService>;

  beforeEach(async () => {
    mockTranslateService = {
      instant: jest.fn((key: string) => key),
    } as unknown as jest.Mocked<TranslateService>;

    await TestBed.configureTestingModule({
      imports: [ClientFormComponent, FormGenericComponent],
      providers: [
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientFormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize with individual client type by default', () => {
      component.ngOnInit();

      expect(component.formConfig).toBeDefined();
      expect(component.formConfig.length).toBeGreaterThan(0);
      expect(component.formConfig[0]?.name).toBe('client_type');
    });

    it('should initialize with existing individual client data', () => {
      component.initialData = mockIndividualClient;
      component.ngOnInit();

      expect(component.formConfig).toBeDefined();
      // Check that individual fields are present
      const firstNameField = component.formConfig.find(f => f.name === 'first_name');
      const lastNameField = component.formConfig.find(f => f.name === 'last_name');
      expect(firstNameField).toBeDefined();
      expect(lastNameField).toBeDefined();
    });

    it('should initialize with existing company client data', () => {
      component.initialData = mockCompanyClient;
      component.ngOnInit();

      expect(component.formConfig).toBeDefined();
      // Check that company fields are present
      const companyNameField = component.formConfig.find(f => f.name === 'company_name');
      expect(companyNameField).toBeDefined();
    });
  });

  describe('buildFormConfig', () => {
    it('should build form config for individual client', () => {
      component.initialData = mockIndividualClient;
      component['buildFormConfig']();

      expect(component.formConfig).toBeDefined();
      expect(component.formConfig.length).toBeGreaterThan(0);

      // Check for individual-specific fields are visible
      const firstNameField = component.formConfig.find(f => f.name === 'first_name');
      const lastNameField = component.formConfig.find(f => f.name === 'last_name');
      const personalIdField = component.formConfig.find(f => f.name === 'personal_id');

      expect(firstNameField).toBeDefined();
      expect(firstNameField?.showComponent).not.toBe(false);
      expect(lastNameField).toBeDefined();
      expect(lastNameField?.showComponent).not.toBe(false);
      expect(personalIdField).toBeDefined();

      // Company fields should be hidden
      const companyNameField = component.formConfig.find(f => f.name === 'company_name');
      expect(companyNameField?.showComponent).toBe(false);
    });

    it('should build form config for company client', () => {
      component.initialData = mockCompanyClient;
      component['buildFormConfig']();

      expect(component.formConfig).toBeDefined();
      expect(component.formConfig.length).toBeGreaterThan(0);

      // Check for company-specific fields are visible
      const companyNameField = component.formConfig.find(f => f.name === 'company_name');
      const companyRegField = component.formConfig.find(f => f.name === 'company_registration_number');

      expect(companyNameField).toBeDefined();
      expect(companyNameField?.showComponent).not.toBe(false);
      expect(companyRegField).toBeDefined();

      // Individual fields should be hidden
      const firstNameField = component.formConfig.find(f => f.name === 'first_name');
      expect(firstNameField?.showComponent).toBe(false);
    });

    it('should include common fields for both types', () => {
      // Test individual
      component.initialData = mockIndividualClient;
      component['buildFormConfig']();
      const individualConfig = component.formConfig;

      // Test company
      component.initialData = mockCompanyClient;
      component['buildFormConfig']();
      const companyConfig = component.formConfig;

      // Common fields that should be in both
      const commonFieldNames = ['nif', 'address', 'national', 'is_default'];

      commonFieldNames.forEach(fieldName => {
        expect(individualConfig.find(f => f.name === fieldName)).toBeDefined();
        expect(companyConfig.find(f => f.name === fieldName)).toBeDefined();
      });
    });
  });

  describe('isValidForm', () => {
    it('should return true when form is valid', () => {
      component.ngOnInit();
      fixture.detectChanges();

      // Mock the form generic component
      component.formClientGenericComponent = {
        getForm: {
          valid: true,
        },
      } as any;

      expect(component.isValidForm()).toBe(true);
    });

    it('should return false when form is invalid', () => {
      component.ngOnInit();
      fixture.detectChanges();

      component.formClientGenericComponent = {
        getForm: {
          valid: false,
        },
      } as any;

      expect(component.isValidForm()).toBe(false);
    });
  });
});

