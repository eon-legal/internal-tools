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
import { TranslateService } from '@ngx-translate/core';

interface MockFirstForm {
  numberInvoice: string;
  date: Date | null;
  name: string;
  identificationType: string;
  identification: string;
}

class MockInvoicesStore {
  getAllMarkFieldForm = jest.fn(() => false);
  getFirstForm = jest.fn(
    (): MockFirstForm => ({
      numberInvoice: '',
      date: new Date(),
      name: '',
      identificationType: 'DNI',
      identification: '',
    })
  );
  firstForm = jest.fn(() => ({}));
  updateFirstForm = jest.fn();
  updateValidFirstForm = jest.fn();
}

class MockTranslateService {
  instant = jest.fn((key: string) => key);
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
      providers: [
        { provide: InvoicesStore, useValue: mockStore },
        { provide: TranslateService, useClass: MockTranslateService }
      ],
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
      date: new Date(),
      name: 'Test Name',
      identificationType: 'DNI',
      identification: 'P1234567',
    };

    mockStore.getFirstForm.mockReturnValue(storeData);

    fixture = TestBed.createComponent(InvoicesSenderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.formConfig[1]?.initialData).toBe(storeData.name);
    // formConfig[2] is identificationType, formConfig[3] is identification
    expect(component.formConfig[2]?.initialData).toBe(storeData.identificationType);
    expect(component.formConfig[3]?.initialData).toBe(storeData.identification);
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
      date: new Date(),
      name: 'Test Name',
      identificationType: 'DNI',
      identification: 'P1234567',
    };

    component.formSenderGenericComponent.getForm.patchValue(formData);
    component.ngOnDestroy();

    expect(mockStore.updateFirstForm).toHaveBeenCalled();
    expect(mockStore.updateValidFirstForm).toHaveBeenCalledWith(true);
  });

  it('should update store on destroy with invalid form', () => {
    component.formSenderGenericComponent.getForm.patchValue({
      numberInvoice: '',
      date: null,
      name: '',
      identificationType: 'DNI',
      identification: '',
    });

    component.ngOnDestroy();

    expect(mockStore.updateFirstForm).toHaveBeenCalled();
    expect(mockStore.updateValidFirstForm).toHaveBeenCalledWith(false);
  });

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
