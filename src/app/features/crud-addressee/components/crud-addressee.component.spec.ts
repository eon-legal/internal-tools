import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudAddresseeComponent } from './crud-addressee.component';
import { ToastrService } from 'ngx-toastr';
import { CustomModalService } from '../../../shared/services/custom-modal/custom-modal.service';
import { AddresseesDataService } from '../../../data-access/addressees/addressees-data.service';
import { LoadingService } from '../../../shared/services/loading/loading.service';
import { LanguageService } from '../../../shared/services/language/language.service';
import { of, Subject, throwError } from 'rxjs';
import { SecondForm } from '../../invoices/interfaces/second-form';
import { MESSAGE_ERROR } from '../../../shared/constants/message-error';
import { Addressee } from '../interfaces/addressee';

const addresseesMock: Addressee[] = [
  {
    id: '1',
    name_destination: 'Italia',
    account_destination: 'cuenta 5',
    address_destination: 'direccion 1',
    name_bank: 'banco 1',
    address_bank: 'direccion banco 1',
    nif: '123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name_destination: 'Noruega',
    account_destination: 'cuenta 10',
    address_destination: 'direccion 2',
    name_bank: 'banco 2',
    address_bank: 'direccion banco 2',
    nif: '456',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('CrudAddresseeComponent', () => {
  let component: CrudAddresseeComponent;
  let fixture: ComponentFixture<CrudAddresseeComponent>;
  let mockAddresseesDataService: {
    getAddressees: jest.Mock;
  };
  let mockToastService: jest.Mocked<ToastrService>;
  let mockLoadingService: { show: jest.Mock; hide: jest.Mock };
  let customModalService: { open: jest.Mock };
  let mockLanguageService: Partial<LanguageService>;
  let langChangeSubject: Subject<{ lang: string; translations: unknown }>;

  beforeEach(async () => {
    langChangeSubject = new Subject();

    mockAddresseesDataService = {
      getAddressees: jest.fn(() => of(addresseesMock)),
    };

    mockToastService = {
      error: jest.fn(),
    } as unknown as jest.Mocked<ToastrService>;

    mockLoadingService = {
      show: jest.fn(),
      hide: jest.fn(),
    };

    customModalService = {
      open: jest.fn(),
    };

    mockLanguageService = {
      getText: jest.fn((key: string) => key),
      onLanguageChange: jest.fn(() => langChangeSubject.asObservable()),
    };

    await TestBed.configureTestingModule({
      imports: [CrudAddresseeComponent],
      providers: [
        { provide: ToastrService, useValue: mockToastService },
        { provide: CustomModalService, useValue: customModalService },
        { provide: AddresseesDataService, useValue: mockAddresseesDataService },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: LanguageService, useValue: mockLanguageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudAddresseeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load addressees on ngOnInit', () => {
    // Arrange
    mockAddresseesDataService.getAddressees.mockReturnValue(of(addresseesMock));

    // Act
    component.ngOnInit();

    // Assert
    expect(mockAddresseesDataService.getAddressees).toHaveBeenCalled();
    expect(component.dataTable.length).toBe(2);
  });

  it('should handle error when loading addressees fails', () => {
    // Arrange
    mockAddresseesDataService.getAddressees.mockReturnValue(
      throwError(() => new Error('Simulated error'))
    );

    // Act
    component.ngOnInit();

    // Assert
    expect(mockAddresseesDataService.getAddressees).toHaveBeenCalled();
    expect(component.dataTable.length).toBe(0);
    expect(mockToastService.error).toHaveBeenCalledWith(MESSAGE_ERROR, 'common.labels.error');
  });

  it('should call the addressee modal', () => {
    const row = { id: '1', nameDestination: 'test' } as SecondForm;
    const mockModalServiceRef = {
      onClose: jest.fn().mockReturnValue(of(undefined)),
      close: jest.fn(),
      getInstance: jest.fn(),
    };

    customModalService.open.mockReturnValue({
      modalServiceRef: mockModalServiceRef,
    });

    component.opneAddEditAddressee(row);
    expect(customModalService.open).toHaveBeenCalled();
  });
});
