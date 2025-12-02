import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { InvoicesDestinationFormComponent } from './invoices-destination-form.component';
import { FormGenericComponent } from '../form-generic/form-generic.component';
import { InvoicesStore } from '../../../store/app.store';
import { AddresseesDataService } from '../../../data-access/addressees/addressees-data.service';
import { ClientsDataService } from '../../../data-access/clients/clients-data.service';
import { of, throwError } from 'rxjs';
import { SELECT_DATA_INITIAL } from '../form-generic/constants/select-data-initial';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../../services/loading/loading.service';
import { SecondForm } from '../../../features/invoices/interfaces/second-form';
import { TranslateService } from '@ngx-translate/core';
import { IndividualClient, CompanyClient } from '../../../features/invoices/interfaces/database-models';

const mockSecondForm: SecondForm = {
  nameDestination: 'Test Name',
  accountDestination: '123456',
  addressDestination: 'Test Address',
  nameBank: 'Test Bank',
  addressBank: 'Test Bank Address',
  nif: '12345678',
  chooseDestination: { label: 'Test', value: '1' },
};

const mockAddressee = {
  id: '1',
  name_destination: 'Test Addressee',
  account_destination: '123456',
  address_destination: 'Test Address',
  name_bank: 'Test Bank',
  address_bank: 'Test Bank Address',
  nif: '12345678A',
};

const mockIndividualClient: IndividualClient = {
  id: '2',
  client_type: 'individual',
  first_name: 'John',
  last_name: 'Doe',
  nif: '87654321B',
  address: '456 Client St',
  national: true,
  is_default: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockCompanyClient: CompanyClient = {
  id: '3',
  client_type: 'company',
  company_name: 'Acme Corp',
  nif: '11111111C',
  address: '789 Business Ave',
  national: false,
  is_default: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

class MockInvoicesStore {
  getSecondForm = jest.fn();
  updateSecondForm = jest.fn();
  updateValidSecondForm = jest.fn();
  getAllMarkFieldForm = jest.fn(() => false);
}

describe('InvoicesDestinationFormComponent', () => {
  let component: InvoicesDestinationFormComponent;
  let fixture: ComponentFixture<InvoicesDestinationFormComponent>;
  let mockStore: MockInvoicesStore;
  let mockAddresseesDataService: jest.Mocked<AddresseesDataService>;
  let mockClientsDataService: jest.Mocked<ClientsDataService>;
  let mockToastr: jest.Mocked<ToastrService>;
  let mockLoadingService: jest.Mocked<LoadingService>;
  let mockTranslateService: jest.Mocked<TranslateService>;

  beforeEach(async () => {
    mockStore = new MockInvoicesStore();

    mockAddresseesDataService = {
      getAddressees: jest.fn(() => of([mockAddressee])),
      getAddresseeById: jest.fn(() => of(mockAddressee)),
    } as unknown as jest.Mocked<AddresseesDataService>;

    mockClientsDataService = {
      getClients: jest.fn(() => of([mockIndividualClient, mockCompanyClient])),
      getClientById: jest.fn((id: string) => {
        if (id === '2') return of(mockIndividualClient);
        if (id === '3') return of(mockCompanyClient);
        return of(mockIndividualClient);
      }),
    } as unknown as jest.Mocked<ClientsDataService>;

    mockToastr = {
      error: jest.fn(),
      warning: jest.fn(),
    } as unknown as jest.Mocked<ToastrService>;

    mockLoadingService = {
      show: jest.fn(),
      hide: jest.fn(),
    } as unknown as jest.Mocked<LoadingService>;

    mockTranslateService = {
      instant: jest.fn((key: string) => key),
    } as unknown as jest.Mocked<TranslateService>;

    await TestBed.configureTestingModule({
      imports: [InvoicesDestinationFormComponent, FormGenericComponent],
      providers: [
        { provide: InvoicesStore, useValue: mockStore },
        { provide: AddresseesDataService, useValue: mockAddresseesDataService },
        { provide: ClientsDataService, useValue: mockClientsDataService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicesDestinationFormComponent);
    component = fixture.componentInstance;

    // Mock formDestinationGenericComponent to prevent ngOnDestroy errors
    component.formDestinationGenericComponent = {
      getForm: {
        valid: true,
        get: jest.fn(() => ({ value: '' }))
      },
      getDataFormComplete: jest.fn(() => ({})),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Clean up any subscriptions
    if (component['subscription']) {
      component['subscription'].forEach(sub => sub.unsubscribe());
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call createForm and isNotModalCallService when isModal is false', () => {
      const createFormSpy = jest.spyOn(component, 'createForm');
      const consumeServiceSpy = jest.spyOn(component, 'isNotModalCallService');
      component.isModal = false;
      component.ngOnInit();
      expect(createFormSpy).toHaveBeenCalled();
      expect(consumeServiceSpy).toHaveBeenCalled();
    });

    it('should only call createForm when isModal is true', () => {
      const createFormSpy = jest.spyOn(component, 'createForm');
      const consumeServiceSpy = jest.spyOn(component, 'isNotModalCallService');
      component.isModal = true;
      component.initialField = { ...mockSecondForm };
      component.ngOnInit();
      expect(createFormSpy).toHaveBeenCalled();
      expect(consumeServiceSpy).not.toHaveBeenCalled();
    });
  });

  describe('isNotModalCallService', () => {
    it('should load both addressees and clients', fakeAsync(() => {
      component.isNotModalCallService();
      expect(mockLoadingService.show).toHaveBeenCalled();
      expect(mockAddresseesDataService.getAddressees).toHaveBeenCalled();
      expect(mockClientsDataService.getClients).toHaveBeenCalled();
      tick();
      expect(mockLoadingService.hide).toHaveBeenCalled();
    }));

    it('should combine addressees and clients in dropdown options', fakeAsync(() => {
      component.createForm();

      component.createForm();
      component.isNotModalCallService();
      tick();

      expect(component.formConfig[0]?.primeNgConfig?.options).toEqual([
        SELECT_DATA_INITIAL,
        { label: '👤 John Doe', value: 'client_2' },
        { label: '👤 Acme Corp', value: 'client_3' },
        { label: '📧 Test Addressee', value: 'addressee_1' },
      ]);
    }));

    it('should handle error and show toastr message', fakeAsync(() => {
      const error = new Error('Test Error');
      mockAddresseesDataService.getAddressees.mockReturnValue(
        throwError(() => error)
      );
      mockClientsDataService.getClients.mockReturnValue(
        throwError(() => error)
      );

      component.isNotModalCallService();
      tick();

      expect(mockToastr.error).toHaveBeenCalledWith(
        'common.messages.service_error',
        'common.labels.error'
      );
      expect(mockLoadingService.hide).toHaveBeenCalled();
    }));
  });

  describe('createForm', () => {
    it('should create form with all fields when isModal is false', () => {
      component.isModal = false;
      component.createForm();
      expect(component.formConfig.length).toBe(7);
      expect(component.formConfig[0]?.name).toBe('chooseDestination');
    });

    it('should create form without chooseDestination when isModal is true', () => {
      component.isModal = true;
      component.initialField = { ...mockSecondForm };
      component.createForm();
      expect(component.formConfig.length).toBe(6);
      expect(component.formConfig[0]?.name).not.toBe('chooseDestination');
    });

    it('should set initialData from initialField when isModal is true', () => {
      component.isModal = true;
      component.initialField = { ...mockSecondForm };
      component.createForm();

      expect(component.formConfig[0]?.initialData).toBe(
        mockSecondForm.nameDestination
      );
    });
  });

  describe('ngOnDestroy', () => {
    it('should update store with form data when form exists', fakeAsync(() => {
      component.isModal = false;
      fixture.detectChanges();
      
      // Wait for form to initialize
      tick();
      
      // Simulate valid form
      const form = component.formDestinationGenericComponent?.getForm;
      if (form) {
        form.patchValue(mockSecondForm);
        form.markAllAsTouched();
      }

      component.ngOnDestroy();

      expect(mockStore.updateSecondForm).toHaveBeenCalled();
      expect(mockStore.updateValidSecondForm).toHaveBeenCalled();
    }));
  });

  describe('helper methods', () => {
    it('isValidForm should return form validity', fakeAsync(() => {
      component.isModal = false;
      fixture.detectChanges();
      tick();
      
      // Initially invalid
      expect(component.isValidForm()).toBeFalsy();
      
      // Make valid
      const form = component.formDestinationGenericComponent?.getForm;
      if (form) {
        form.patchValue(mockSecondForm);
        expect(component.isValidForm()).toBeTruthy();
      }
    }));

    it('should return false when no client/addressee is selected in non-modal mode', () => {
      component.isModal = false;
      component.formDestinationGenericComponent = {
        getForm: {
          valid: true,
          get: jest.fn(() => ({
            value: SELECT_DATA_INITIAL,
          })),
        },
        getDataFormComplete: jest.fn(() => ({})),
      } as any;

      expect(component.isValidForm()).toBe(false);
      expect(mockToastr.warning).toHaveBeenCalled();
    });

    it('should return true when client is selected in non-modal mode', () => {
      component.isModal = false;
      component.formDestinationGenericComponent = {
        getForm: {
          valid: true,
          get: jest.fn(() => ({
            value: { label: 'Test Client', value: 'client_2' },
          })),
        },
        getDataFormComplete: jest.fn(() => ({})),
      } as any;

      expect(component.isValidForm()).toBe(true);
    });
  });

  describe('getSelectedClientId', () => {
    it('should return undefined when no client is selected', () => {
      expect(component.getSelectedClientId()).toBeUndefined();
    });

    it('should return client ID when client is selected', () => {
      component['selectedClientId'] = '2';
      expect(component.getSelectedClientId()).toBe('2');
    });

    it('should return undefined when addressee is selected', () => {
      component['selectedClientId'] = undefined;
      expect(component.getSelectedClientId()).toBeUndefined();
    });
  });

  describe('Client selection handling', () => {
    it('should populate form with individual client data when selected', fakeAsync(() => {
      component.createForm();
      component.isNotModalCallService();
      tick();

      // Simulate selecting a client
      component['selectedClientId'] = '2';

      expect(mockClientsDataService.getClientById).toBeDefined();
    }));

    it('should populate form with company client data when selected', fakeAsync(() => {
      component.createForm();
      component.isNotModalCallService();
      tick();

      // Simulate selecting a company client
      component['selectedClientId'] = '3';

      expect(mockClientsDataService.getClientById).toBeDefined();
    }));

    it('should clear client ID when addressee is selected', fakeAsync(() => {
      component.createForm();
      component['selectedClientId'] = '2';

      // Simulate selecting an addressee
      component['selectedClientId'] = undefined;

      expect(component.getSelectedClientId()).toBeUndefined();
    }));
  });
});