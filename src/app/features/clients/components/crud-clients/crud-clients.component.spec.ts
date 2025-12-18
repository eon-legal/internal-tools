import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CrudClientsComponent } from './crud-clients.component';
import { ClientsDataService } from '../../../../data-access/clients/clients-data.service';
import { CustomModalService } from '../../../../shared/services/custom-modal/custom-modal.service';
import { LoadingService } from '../../../../shared/services/loading/loading.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { of, Subject, throwError } from 'rxjs';
import { Client, IndividualClient, CompanyClient } from '../../../invoices/interfaces/database-models';
import { LanguageService } from '../../../../shared/services/language/language.service';

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

describe('CrudClientsComponent', () => {
  let component: CrudClientsComponent;
  let fixture: ComponentFixture<CrudClientsComponent>;
  let mockClientsDataService: jest.Mocked<ClientsDataService>;
  let mockCustomModalService: jest.Mocked<CustomModalService>;
  let mockLoadingService: jest.Mocked<LoadingService>;
  let mockTranslateService: jest.Mocked<TranslateService>;
  let mockToastrService: jest.Mocked<ToastrService>;
  let mockLanguageService: Partial<LanguageService>;
  let langChangeSubject: Subject<{ lang: string; translations: unknown }>;

  beforeEach(async () => {
    langChangeSubject = new Subject();

    mockClientsDataService = {
      getClients: jest.fn(() => of([mockIndividualClient, mockCompanyClient])),
      getClientById: jest.fn((id: string) =>
        of(id === '1' ? mockIndividualClient : mockCompanyClient)
      ),
      createClient: jest.fn((client: any) => of({ ...client, id: '3' } as Client)),
      updateClient: jest.fn((id: string, client: any) => of({ ...client, id } as Client)),
      deleteClient: jest.fn(() => of(void 0)),
      setDefaultClient: jest.fn((id: string) => of({ ...mockCompanyClient, id, is_default: true })),
    } as unknown as jest.Mocked<ClientsDataService>;

    mockCustomModalService = {
      open: jest.fn(() => ({
        modalServiceRef: {
          getInstance: jest.fn(() => ({
            isValidForm: jest.fn(() => true),
            getValueForm: jest.fn(() => mockIndividualClient),
          })),
          close: jest.fn(),
          onClose: jest.fn((callback: any) => {
            callback(mockIndividualClient);
          }),
        },
      })),
    } as unknown as jest.Mocked<CustomModalService>;

    mockLoadingService = {
      show: jest.fn(),
      hide: jest.fn(),
    } as unknown as jest.Mocked<LoadingService>;

    mockTranslateService = {
      instant: jest.fn((key: string) => key),
    } as unknown as jest.Mocked<TranslateService>;

    mockToastrService = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
    } as unknown as jest.Mocked<ToastrService>;

    mockLanguageService = {
      getText: jest.fn((key: string) => key),
      onLanguageChange: jest.fn(() => langChangeSubject.asObservable()),
    };

    await TestBed.configureTestingModule({
      imports: [CrudClientsComponent],
      providers: [
        { provide: ClientsDataService, useValue: mockClientsDataService },
        { provide: CustomModalService, useValue: mockCustomModalService },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: LanguageService, useValue: mockLanguageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudClientsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
    component['subscription'].forEach(sub => sub.unsubscribe());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load clients on init', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(mockLoadingService.show).toHaveBeenCalled();
      expect(mockClientsDataService.getClients).toHaveBeenCalled();
      expect(mockLoadingService.hide).toHaveBeenCalled();
      expect(component.dataTable.length).toBe(2);
    }));

    it('should handle error when loading clients', fakeAsync(() => {
      mockClientsDataService.getClients.mockReturnValue(
        throwError(() => new Error('Load error'))
      );

      component.ngOnInit();
      tick();

      expect(mockToastrService.error).toHaveBeenCalled();
      expect(mockLoadingService.hide).toHaveBeenCalled();
    }));
  });

  describe('createClient', () => {
    it('should create individual client successfully', fakeAsync(() => {
      const clientData = {
        client_type: 'individual' as const,
        first_name: 'Jane',
        last_name: 'Smith',
        nif: '11111111A',
      };

      component.createClient(clientData);
      tick();

      expect(mockClientsDataService.createClient).toHaveBeenCalledWith(clientData);
      expect(mockToastrService.success).toHaveBeenCalled();
    }));

    it('should create company client successfully', fakeAsync(() => {
      const clientData = {
        client_type: 'company' as const,
        company_name: 'New Corp',
        nif: '22222222B',
      };

      component.createClient(clientData);
      tick();

      expect(mockClientsDataService.createClient).toHaveBeenCalledWith(clientData);
      expect(mockToastrService.success).toHaveBeenCalled();
    }));

    it('should handle error when creating client', fakeAsync(() => {
      mockClientsDataService.createClient.mockReturnValue(
        throwError(() => new Error('Create error'))
      );

      component.createClient(mockIndividualClient);
      tick();

      expect(mockToastrService.error).toHaveBeenCalled();
    }));
  });

  describe('updateClient', () => {
    it('should update client successfully', fakeAsync(() => {
      const updatedData = { ...mockIndividualClient, first_name: 'Updated' };

      component.updateClient('1', updatedData);
      tick();

      expect(mockClientsDataService.updateClient).toHaveBeenCalledWith('1', updatedData);
      expect(mockToastrService.success).toHaveBeenCalled();
    }));

    it('should handle error when updating client', fakeAsync(() => {
      mockClientsDataService.updateClient.mockReturnValue(
        throwError(() => new Error('Update error'))
      );

      component.updateClient('1', mockIndividualClient);
      tick();

      expect(mockToastrService.error).toHaveBeenCalled();
    }));
  });

  describe('deleteClient', () => {
    it('should delete client successfully', fakeAsync(() => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      component.deleteClient('1');
      tick();

      expect(mockClientsDataService.deleteClient).toHaveBeenCalledWith('1');
      expect(mockToastrService.success).toHaveBeenCalled();
    }));

    it('should not delete client when user cancels', fakeAsync(() => {
      jest.spyOn(window, 'confirm').mockReturnValue(false);

      component.deleteClient('1');
      tick();

      expect(mockClientsDataService.deleteClient).not.toHaveBeenCalled();
    }));

    it('should handle error when deleting client', fakeAsync(() => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockClientsDataService.deleteClient.mockReturnValue(
        throwError(() => new Error('Delete error'))
      );

      component.deleteClient('1');
      tick();

      expect(mockToastrService.error).toHaveBeenCalled();
    }));
  });

  describe('setDefaultClient', () => {
    it('should set default client successfully', fakeAsync(() => {
      component.setDefaultClient('2');
      tick();

      expect(mockClientsDataService.setDefaultClient).toHaveBeenCalledWith('2');
      expect(mockToastrService.success).toHaveBeenCalled();
    }));

    it('should handle error when setting default client', fakeAsync(() => {
      mockClientsDataService.setDefaultClient.mockReturnValue(
        throwError(() => new Error('Set default error'))
      );

      component.setDefaultClient('2');
      tick();

      expect(mockToastrService.error).toHaveBeenCalled();
    }));
  });

  describe('clientToTableRow', () => {
    it('should transform individual client to table row', () => {
      const tableRow = component['clientToTableRow'](mockIndividualClient);

      expect(tableRow.id).toBe('1');
      expect(tableRow.name).toBe('John Doe');
      expect(tableRow.nif).toBe('12345678A');
      expect(tableRow.national).toBe('common.labels.yes');
      expect(tableRow.is_default).toBe('');
    });

    it('should transform company client to table row', () => {
      const tableRow = component['clientToTableRow'](mockCompanyClient);

      expect(tableRow.id).toBe('2');
      expect(tableRow.name).toBe('Acme Corp');
      expect(tableRow.nif).toBe('87654321B');
      expect(tableRow.national).toBe('common.labels.no');
      expect(tableRow.is_default).toBe('⭐');
    });
  });
});

