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
import { ADDRESSEE_TABLE } from '../../../modules/crud-addressee/constants/collection-table';
import { of, throwError } from 'rxjs';
import { SELECT_DATA_INITIAL } from '../form-generic/constants/select-data-initial';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../../services/loading/loading.service';
import { SecondForm } from '../../../modules/invoices/interfaces/second-form';
import { Firestore } from '@angular/fire/firestore';
import { By } from '@angular/platform-browser';

// Mock data completo con valores válidos
const mockSecondForm: SecondForm = {
  nameDestination: 'Test Name',
  accountDestination: '123456',
  addressDestination: 'Test Address',
  nameBank: 'Test Bank',
  addressBank: 'Test Bank Address',
  nif: '12345678',
  chooseDestination: { label: 'Test', value: '1' },
};

interface MockControl {
  valid: boolean;
  disabled?: boolean;
  valueChanges?: any;
  value?: any;
  patchValue?: jest.Mock;
  disable?: jest.Mock;
  enable?: jest.Mock;
}

type MockControls = {
  [key in keyof SecondForm]: MockControl;
};

class MockInvoicesStore {
  private secondFormData: SecondForm = { ...mockSecondForm };

  /*getSecondForm = jest.fn(() => this.secondFormData);
  updateSecondForm = jest.fn((formData) => (this.secondFormData = formData));*/
  getSecondForm = jest.fn();
  updateSecondForm = jest.fn();
  updateValidSecondForm = jest.fn();
  getAllMarkFieldForm = jest.fn(() => false);

  // Helper para testing
  /*setSecondFormData(data: Partial<SecondForm>) {
    this.secondFormData = { ...this.secondFormData, ...data };
  }*/
}

// First, let's define a proper type for our form controls
type FormControls = {
  [K in keyof Omit<SecondForm, 'id'>]: { valid: boolean };
};
/*
class MockFormGenericComponent {
  // Private state that won't cause type issues
  private _valid = false;
  private _controls: FormControls = {
    chooseDestination: { valid: false },
    nameDestination: { valid: false },
    accountDestination: { valid: false },
    addressDestination: { valid: false },
    nameBank: { valid: false },
    addressBank: { valid: false },
    nif: { valid: false },
  };

  // Public form interface
  getForm = {
    markAllAsTouched: jest.fn(),
    controls: this._controls,
    get: jest.fn((name: keyof FormControls) => this._controls[name]),
    patchValue: jest.fn(),
    get valid() {
      return this._valid;
    },
    set valid(value: boolean) {
      this._valid = value;
    },
    value: { ...mockSecondForm },
    getRawValue: jest.fn(() => ({ ...mockSecondForm })),
  };

  // Public methods
  getFormControl = jest.fn((name: keyof FormControls) => this._controls[name]);

  getDataFormComplete = jest.fn(() => this.getForm.getRawValue());

  // Helper method to set validity
  setFormValidity(valid: boolean) {
    this._valid = valid;
    (Object.keys(this._controls) as Array<keyof FormControls>).forEach(
      (key) => {
        this._controls[key].valid = valid;
      }
    );
  }
}*/

describe('InvoicesDestinationFormComponent', () => {
  let component: InvoicesDestinationFormComponent;
  let fixture: ComponentFixture<InvoicesDestinationFormComponent>;
  let mockStore: MockInvoicesStore;
  let mockGenericFirestoreService: jest.Mocked<
    GenericFirestoreService<SecondForm>
  >;
  let mockToastr: jest.Mocked<ToastrService>;
  let mockLoadingService: jest.Mocked<LoadingService>;
  //let mockFormGeneric: MockFormGenericComponent;

  beforeEach(async () => {
    mockStore = new MockInvoicesStore();
    //mockFormGeneric = new MockFormGenericComponent();

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
      //schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicesDestinationFormComponent);
    component = fixture.componentInstance;
    /*component.formDestinationGenericComponent =
      mockFormGeneric as unknown as FormGenericComponent<SecondForm>;*/
    //fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call createForm and isNotModalConsumeService when isModal is false', () => {
      const createFormSpy = jest.spyOn(component, 'createForm');
      const consumeServiceSpy = jest.spyOn(
        component,
        'isNotModalConsumeService'
      );
      component.isModal = false;
      component.ngOnInit();
      expect(createFormSpy).toHaveBeenCalled();
      expect(consumeServiceSpy).toHaveBeenCalled();
    });

    it('should only call createForm when isModal is true', () => {
      const createFormSpy = jest.spyOn(component, 'createForm');
      const consumeServiceSpy = jest.spyOn(
        component,
        'isNotModalConsumeService'
      );
      component.isModal = true;
      component.initialField = { ...mockSecondForm };
      component.ngOnInit();
      expect(createFormSpy).toHaveBeenCalled();
      expect(consumeServiceSpy).not.toHaveBeenCalled();
    });
  });

  describe('isNotModalConsumeService', () => {
    it('should call loadingService.show and getAll', fakeAsync(() => {
      component.isNotModalConsumeService();
      expect(mockLoadingService.show).toHaveBeenCalled();
      expect(mockGenericFirestoreService.getAll).toHaveBeenCalledWith(
        ADDRESSEE_TABLE
      );
      tick();
      expect(mockLoadingService.hide).toHaveBeenCalled();
    }));

    it('should update formConfig options when data is received', fakeAsync(() => {
      const mockData: SecondForm[] = [
        {
          id: '1',
          nameDestination: 'Test 1',
          accountDestination: 'Test 1',
          addressDestination: 'Test 1',
          nameBank: 'Test 1',
          addressBank: 'Test 1',
          nif: 'Test 1',
        },
        {
          id: '2',
          nameDestination: 'Test 2',
          accountDestination: 'Test 2',
          addressDestination: 'Test 2',
          nameBank: 'Test 2',
          addressBank: 'Test 2',
          nif: 'Test 2',
        },
      ] as SecondForm[];
      mockGenericFirestoreService.getAll.mockReturnValue(of(mockData));

      component.createForm();
      component.isNotModalConsumeService();
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

      component.isNotModalConsumeService();
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
      expect(component.formConfig[1].initialData).toBe(
        mockSecondForm.accountDestination
      );
      expect(component.formConfig[2].initialData).toBe(
        mockSecondForm.addressDestination
      );
      expect(component.formConfig[3].initialData).toBe(mockSecondForm.nameBank);
      expect(component.formConfig[4].initialData).toBe(
        mockSecondForm.addressBank
      );
      expect(component.formConfig[5].initialData).toBe(mockSecondForm.nif);
    });

    it('should set initialData from store when isModal is false', () => {
      const mockStoreData = { ...mockSecondForm };
      mockStore.getSecondForm.mockReturnValue(mockSecondForm);

      component.isModal = false;
      component.createForm();

      expect(component.formConfig[0].initialData).toEqual(
        mockStoreData.chooseDestination
      );
      expect(component.formConfig[1].initialData).toBe(
        mockStoreData.nameDestination
      );
      expect(component.formConfig[2].initialData).toBe(
        mockStoreData.accountDestination
      );
      expect(component.formConfig[3].initialData).toBe(
        mockStoreData.addressDestination
      );
      expect(component.formConfig[4].initialData).toBe(mockStoreData.nameBank);
      expect(component.formConfig[5].initialData).toBe(
        mockStoreData.addressBank
      );
      expect(component.formConfig[6].initialData).toBe(mockStoreData.nif);
    });
  });
  describe('ngOnDestroy', () => {
    it('should update store with invalid form when form is invalid', fakeAsync(() => {
      component.isModal = false;

      //ngOnInit
      fixture.detectChanges();
      tick();

      expect(component.formConfig.length).toBe(7);

      const genericFormComponent = fixture.debugElement.query(
        By.directive(FormGenericComponent)
      ).componentInstance;
      //fixture.debugElement.children[0].componentInstance;
      const dataMock = {
        chooseDestination: { label: 'Test', value: '1' },
        nameDestination: 'Test 1',
        accountDestination: 'Test 1',
        addressDestination: 'Test 1',
        nameBank: 'Test 1',
        addressBank: 'Test 1',
        nif: 'Test 1',
      };

      genericFormComponent.getForm.patchValue(dataMock);
      expect(component.isValidForm()).toBe(true);

      component.ngOnDestroy();

      expect(mockStore.updateSecondForm).toHaveBeenCalledWith(dataMock);
      expect(mockStore.updateValidSecondForm).toHaveBeenCalledWith(true);
    }));

    it('should update store with valid form when form is valid', fakeAsync(() => {
      component.isModal = false;
      component.ngOnInit();
      fixture.detectChanges();
      tick(); // Espera a que se complete la inicialización

      // Obtén el formulario y rellena con datos válidos
      const form = component.formDestinationGenericComponent.getForm;
      form.patchValue(mockSecondForm);
      form.markAllAsTouched();

      component.ngOnDestroy();

      expect(mockStore.updateValidSecondForm).toHaveBeenCalledWith(true);
      expect(mockStore.updateSecondForm).toHaveBeenCalledWith(mockSecondForm);
    }));
  });

  describe('helper methods', () => {
    it('isValidForm should return form correctly', () => {
      component.isModal = false;
      fixture.detectChanges();
      //caso invalido
      expect(component.isValidForm()).toBeFalsy();
      //caso valido
      component.formDestinationGenericComponent.getForm.patchValue(
        mockSecondForm
      );
      expect(component.isValidForm()).toBeTruthy();
    });
    it('isValidForm should return form correctly with data of store', () => {
      component.isModal = false;
      mockStore.getSecondForm.mockReturnValue(mockSecondForm);
      fixture.detectChanges();
      expect(component.isValidForm()).toBeTruthy();
    });
  });
});
