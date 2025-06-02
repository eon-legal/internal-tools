import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { InvoicesDestinationFormComponent } from './invoices-destination-form.component';
import { FormGenericComponent } from '../form-generic/form-generic.component';
import { InvoicesStore } from '../../../store/app.store';
import { GenericFirestoreService } from '../../services/generic-firestore/generic-firestore.service';
import { ADDRESSEE_TABLE } from '../../../features/crud-addressee/constants/collection-table';
import { of, throwError } from 'rxjs';
import { SELECT_DATA_INITIAL } from '../form-generic/constants/select-data-initial';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../../services/loading/loading.service';
import { SecondForm } from '../../../features/invoices/interfaces/second-form';
import { Firestore } from '@angular/fire/firestore';

const mockSecondForm: SecondForm = {
  nameDestination: 'Test Name',
  accountDestination: '123456',
  addressDestination: 'Test Address',
  nameBank: 'Test Bank',
  addressBank: 'Test Bank Address',
  nif: '12345678',
  chooseDestination: { label: 'Test', value: '1' },
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
  let mockGenericFirestoreService: jest.Mocked<GenericFirestoreService<SecondForm>>;
  let mockToastr: jest.Mocked<ToastrService>;
  let mockLoadingService: jest.Mocked<LoadingService>;

  beforeEach(async () => {
    mockStore = new MockInvoicesStore();

    mockGenericFirestoreService = {
      getAll: jest.fn(() => of([{ id: '1', ...mockSecondForm }])),
      getById: jest.fn(() => of(mockSecondForm)),
    } as unknown as jest.Mocked<GenericFirestoreService<SecondForm>>;

    mockToastr = {
      error: jest.fn(),
    } as unknown as jest.Mocked<ToastrService>;

    mockLoadingService = {
      show: jest.fn(),
      hide: jest.fn(),
    } as unknown as jest.Mocked<LoadingService>;

    await TestBed.configureTestingModule({
      imports: [InvoicesDestinationFormComponent, FormGenericComponent],
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: InvoicesStore, useValue: mockStore },
        {
          provide: GenericFirestoreService,
          useValue: mockGenericFirestoreService,
        },
        { provide: ToastrService, useValue: mockToastr },
        { provide: LoadingService, useValue: mockLoadingService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicesDestinationFormComponent);
    component = fixture.componentInstance;
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
    it('should call loadingService.show and getAll', fakeAsync(() => {
      component.isNotModalCallService();
      expect(mockLoadingService.show).toHaveBeenCalled();
      expect(mockGenericFirestoreService.getAll).toHaveBeenCalledWith(
        ADDRESSEE_TABLE
      );
      tick();
      expect(mockLoadingService.hide).toHaveBeenCalled();
    }));

    it('should update formConfig options when data is received', fakeAsync(() => {
      const mockData = [
        { id: '1', nameDestination: 'Test 1' },
        { id: '2', nameDestination: 'Test 2' },
      ] as SecondForm[];
      mockGenericFirestoreService.getAll.mockReturnValue(of(mockData));

      component.createForm();
      component.isNotModalCallService();
      tick();

      expect(component.formConfig[0]?.primeNgConfig?.options).toEqual([
        SELECT_DATA_INITIAL,
        { label: 'Test 1', value: '1' },
        { label: 'Test 2', value: '2' },
      ]);
    }));

    it('should handle error and show toastr message', fakeAsync(() => {
      const error = new Error('Test Error');
      mockGenericFirestoreService.getAll.mockReturnValue(
        throwError(() => error)
      );

      component.isNotModalCallService();
      tick();

      expect(mockToastr.error).toHaveBeenCalledWith(
        'Ha ocurrido un error al consumir el servicio',
        'Error'
      );
      expect(mockLoadingService.hide).toHaveBeenCalled();
    }));
  });

  describe('createForm', () => {
    it('should create form with all fields when isModal is false', () => {
      component.isModal = false;
      component.createForm();
      expect(component.formConfig.length).toBe(7);
      expect(component.formConfig[0].name).toBe('chooseDestination');
    });

    it('should create form without chooseDestination when isModal is true', () => {
      component.isModal = true;
      component.initialField = { ...mockSecondForm };
      component.createForm();
      expect(component.formConfig.length).toBe(6);
      expect(component.formConfig[0].name).not.toBe('chooseDestination');
    });

    it('should set initialData from initialField when isModal is true', () => {
      component.isModal = true;
      component.initialField = { ...mockSecondForm };
      component.createForm();

      expect(component.formConfig[0].initialData).toBe(
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
  });
});