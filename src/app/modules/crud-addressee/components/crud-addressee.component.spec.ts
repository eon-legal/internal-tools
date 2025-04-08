import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { CrudAddresseeComponent } from './crud-addressee.component';
import { ToastrService } from 'ngx-toastr';
import { CustomModalService } from '../../../shared/services/custom-modal/custom-modal.service';
import { GenericFirestoreService } from '../../../shared/services/generic-firestore/generic-firestore.service';
import { LoadingService } from '../../../shared/services/loading/loading.service';
import { Observable, of, throwError } from 'rxjs';
import { SecondForm } from '../../invoices/interfaces/second-form';
import { MESSAGE_ERROR } from '../../../shared/constants/message-error';

const datosMock: SecondForm[] = [
  {
    nameDestination: 'Italia',
    accountDestination: 'cuenta 5',
    addressDestination: 'direccion 1',
    nameBank: 'banco 1',
    addressBank: 'direccion banco 1',
    nif: '123',
    id: '1',
  },
  {
    nameDestination: 'Noruega',
    accountDestination: 'cuenta 10',
    addressDestination: 'direccion 2',
    nameBank: 'banco 2',
    addressBank: 'direccion banco 2',
    nif: '456',
    id: '2',
  },
];
describe('CrudAddresseeComponent', () => {
  let component: CrudAddresseeComponent;
  let fixture: ComponentFixture<CrudAddresseeComponent>;
  let mockGenericFirestoreService: {
    getAll: jest.Mock<Observable<SecondForm[]>>;
    //jest.fn().mockReturnValue(of[]), update: jest.fn(), delete: jest.fn(), add: jest.fn()
  };
  let mockToastService: jest.Mocked<ToastrService>;
  let mockLoadingService: { show: jest.Mock; hide: jest.Mock };
  let customModalService: { open: jest.Mock };

  beforeEach(async () => {
    mockGenericFirestoreService = {
      getAll: jest.fn(),
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

    await TestBed.configureTestingModule({
      imports: [CrudAddresseeComponent],
      providers: [
        { provide: ToastrService, useValue: mockToastService },
        { provide: CustomModalService, useValue: customModalService },
        {
          provide: GenericFirestoreService,
          useValue: mockGenericFirestoreService,
        },
        { provide: LoadingService, useValue: mockLoadingService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudAddresseeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load addressees on ngOnInit', 
    //fakeAsync(
      () => {
    // Arrange
    mockGenericFirestoreService.getAll.mockReturnValue(of(datosMock));

    // Act
    component.ngOnInit();
    //fixture.detectChanges(); // Trigger change detection to start the data loading
    //tick(); // Simulate the asynchronous operation completing
    //fixture.detectChanges(); // Update the view with the loaded data

    // Assert
    expect(mockGenericFirestoreService.getAll).toHaveBeenCalled();
    expect(component.dataTable.length).toBe(2);
  }
//)
);

  it('should handle error when loading addressees fails', 
    //fakeAsync(
      () => {
    // Arrange
    mockGenericFirestoreService.getAll.mockReturnValue(
      throwError(() => new Error('Simulated error'))
    );

    // Act
    component.ngOnInit();
    //fixture.detectChanges();
    /*tick();
    fixture.detectChanges();*/

    // Assert
    expect(mockGenericFirestoreService.getAll).toHaveBeenCalled();
    expect(component.dataTable.length).toBe(0);
    expect(mockToastService.error).toHaveBeenCalledWith(MESSAGE_ERROR, 'Error');
  }
//)
);
  it('should call the addressee', () => {
    const row = { id: '1', nameDestination: 'test' } as SecondForm;
    const mockModalServiceRef = {
      onClose: jest.fn().mockReturnValue(of(undefined)), // Simula un observable
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
