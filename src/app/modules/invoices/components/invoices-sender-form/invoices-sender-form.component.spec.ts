import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { InvoicesSenderFormComponent } from './invoices-sender-form.component';
import { FormGenericComponent } from '../../../../shared/components/form-generic/form-generic.component';
import { InvoicesStore } from '../../../../store/app.store';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

interface MockFirstForm {
  numberInvoice: string;
  dateOrDateRange: boolean;
  date: Date | null;
  rangeDates: { start: Date; end: Date } | null;
  name: string;
  national: boolean;
  address: string;
  passport: string;
}

class MockInvoicesStore {
  getAllMarkFieldForm = jest.fn(() => false);
  getFirstForm = jest.fn(
    (): MockFirstForm => ({
      numberInvoice: '',
      dateOrDateRange: false,
      date: null,
      rangeDates: null,
      name: '',
      national: true,
      address: '',
      passport: '',
    })
  );
  firstForm = jest.fn(() => ({}));
  updateFirstForm = jest.fn();
  updateValidFirstForm = jest.fn();
}

describe('InvoicesSenderFormComponent', () => {
  let component: InvoicesSenderFormComponent;
  let fixture: ComponentFixture<InvoicesSenderFormComponent>;
  let mockStore: MockInvoicesStore;

  beforeEach(async () => {
    mockStore = new MockInvoicesStore();

    await TestBed.configureTestingModule({
      imports: [
        InvoicesSenderFormComponent,
        FormGenericComponent,
        ReactiveFormsModule,
      ],
      providers: [{ provide: InvoicesStore, useValue: mockStore }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicesSenderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with data from store', () => {
    const storeData: MockFirstForm = {
      numberInvoice: 'INV-001',
      dateOrDateRange: true,
      date: null,
      rangeDates: null,
      name: 'Test Name',
      national: false,
      address: 'Test Address',
      passport: 'P1234567',
    };

    mockStore.getFirstForm.mockReturnValue(storeData);

    fixture = TestBed.createComponent(InvoicesSenderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.formConfig[0].initialData).toBe(storeData.numberInvoice);
    expect(component.formConfig[1].initialData).toBe(storeData.dateOrDateRange);
  });

  it('should initialize form with date range data from store', () => {
    const storeData: MockFirstForm = {
      numberInvoice: 'INV-001',
      dateOrDateRange: true,
      date: null,
      rangeDates: { start: new Date(), end: new Date() },
      name: 'Test Name',
      national: false,
      address: 'Test Address',
      passport: 'P1234567',
    };

    mockStore.getFirstForm.mockReturnValue(storeData);

    fixture = TestBed.createComponent(InvoicesSenderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.formConfig[3].initialData).toEqual(storeData.rangeDates);
  });

  it('should mark all fields as touched when required', () => {
    mockStore.getAllMarkFieldForm.mockReturnValue(true);
    const markAllSpy = jest.spyOn(
      component.formSenderGenericComponent.getForm,
      'markAllAsTouched'
    );

    component.ngAfterViewInit();

    expect(markAllSpy).toHaveBeenCalled();
  });

  it('should update store on destroy with valid form', () => {
    const formData = {
      numberInvoice: 'INV-001',
      dateOrDateRange: false,
      date: new Date(),
      rangeDates: null,
      name: 'Test Name',
      national: true,
      address: 'Test Address',
      passport: '',
    };

    component.formSenderGenericComponent.getForm.patchValue(formData);
    component.ngOnDestroy();

    expect(mockStore.updateFirstForm).toHaveBeenCalled();
    expect(mockStore.updateValidFirstForm).toHaveBeenCalledWith(true);
  });

  it('should update store on destroy with invalid form', () => {
    component.formSenderGenericComponent.getForm.patchValue({
      numberInvoice: '',
      dateOrDateRange: false,
      date: null,
      rangeDates: null,
      name: '',
      national: true,
      address: '',
      passport: '',
    });

    component.ngOnDestroy();

    expect(mockStore.updateFirstForm).toHaveBeenCalled();
    expect(mockStore.updateValidFirstForm).toHaveBeenCalledWith(false);
  });

  it('should toggle date fields based on dateOrDateRange value', fakeAsync(() => {
    const dateOrDateRangeControl =
      component.formSenderGenericComponent.getFormControl('dateOrDateRange');
    const dateControl =
      component.formSenderGenericComponent.getFormControl('date');
    const rangeDatesControl =
      component.formSenderGenericComponent.getFormControl('rangeDates');

    // Initial state (single date)
    expect(dateControl?.enabled).toBe(true);
    expect(rangeDatesControl?.enabled).toBe(false);

    // Change to date range
    dateOrDateRangeControl?.setValue(true);
    tick();
    fixture.detectChanges();

    expect(dateControl?.enabled).toBe(false);
    expect(rangeDatesControl?.enabled).toBe(true);

    // Back to single date
    dateOrDateRangeControl?.setValue(false);
    tick();
    fixture.detectChanges();

    expect(dateControl?.enabled).toBe(true);
    expect(rangeDatesControl?.enabled).toBe(false);
  }));

  it('should toggle address/passport fields based on national value', fakeAsync(() => {
    const nationalControl =
      component.formSenderGenericComponent.getFormControl('national');
    const addressControl =
      component.formSenderGenericComponent.getFormControl('address');
    const passportControl =
      component.formSenderGenericComponent.getFormControl('passport');

    // Initial state (national)
    expect(addressControl?.enabled).toBe(true);
    expect(passportControl?.enabled).toBe(false);

    // Change to international
    nationalControl?.setValue(false);
    tick();
    fixture.detectChanges();

    expect(addressControl?.enabled).toBe(false);
    expect(passportControl?.enabled).toBe(true);

    // Back to national
    nationalControl?.setValue(true);
    tick();
    fixture.detectChanges();

    expect(addressControl?.enabled).toBe(true);
    expect(passportControl?.enabled).toBe(false);
  }));

  it('should update validators when toggling dateOrDateRange', fakeAsync(() => {
    const dateOrDateRangeControl =
      component.formSenderGenericComponent.getFormControl('dateOrDateRange');
    const dateControl =
      component.formSenderGenericComponent.getFormControl('date');
    const rangeDatesControl =
      component.formSenderGenericComponent.getFormControl('rangeDates');

    // Initial state (single date)
    expect(dateControl?.hasValidator(Validators.required)).toBe(true);
    expect(rangeDatesControl?.validator).toBeNull();

    // Change to date range
    dateOrDateRangeControl?.setValue(true);
    tick();
    fixture.detectChanges();
    expect(dateControl?.validator).toBeNull();
    expect(rangeDatesControl?.hasValidator(Validators.required)).toBe(true);

    // Back to single date
    dateOrDateRangeControl?.setValue(false);
    tick();
    fixture.detectChanges();

    expect(dateControl?.hasValidator(Validators.required)).toBe(true);
    expect(rangeDatesControl?.validator).toBeNull();
  }));

  it('should update validators when toggling national', fakeAsync(() => {
    const nationalControl =
      component.formSenderGenericComponent.getFormControl('national');
    const addressControl =
      component.formSenderGenericComponent.getFormControl('address');
    const passportControl =
      component.formSenderGenericComponent.getFormControl('passport');

    // Initial state (national)
    expect(addressControl?.hasValidator(Validators.required)).toBe(true);
    expect(passportControl?.validator).toBeNull();

    // Change to international
    nationalControl?.setValue(false);
    tick();
    fixture.detectChanges();

    expect(addressControl?.validator).toBeNull();
    expect(passportControl?.hasValidator(Validators.required)).toBe(true);

    // Back to national
    nationalControl?.setValue(true);
    tick();
    fixture.detectChanges();

    expect(addressControl?.hasValidator(Validators.required)).toBe(true);
    expect(passportControl?.validator).toBeNull();
  }));

  it('should patch form values when changeData is called', () => {
    const testData = {
      numberInvoice: 'TEST-123',
      name: 'Test Name',
    };

    const patchSpy = jest.spyOn(
      component.formSenderGenericComponent.getForm,
      'patchValue'
    );

    component.changeData(testData);

    expect(patchSpy).toHaveBeenCalledWith(testData);
  });
});
