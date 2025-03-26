import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { StepperInvoicesGeneratePdfComponent } from './stepper-invoices-generate-pdf.component';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { StepperContextComponent } from '../../../../shared/components/stepper-context/stepper-context.component';
import { ViewContainerRef, ComponentRef } from '@angular/core';
import { InvoicesStore } from '../../../../store/app.component.store';
import { ToastrService } from 'ngx-toastr';
import { CreateInvoicePdfService } from '../../services/create-invoice-pdf.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { InvoicesSenderFormComponent } from '../invoices-sender-form/invoices-sender-form.component';
import { ContainInvoicesComponent } from '../table-invoices/contain-invoices/contain-invoices.component';
import { InvoicesDestinationFormComponent } from '../invoices-destination-form/invoices-destination-form.component';

// Mocks
class MockInvoicesStore {
  resetInvoices = jest.fn();
  resetTableInvoices = jest.fn();
  getFirstForm = jest.fn(() => ({
    name: 'Test Name',
    national: true,
    address: 'Test Address',
    passport: ''
  }));
  getIsValidFirstForm = jest.fn(() => true);
  getIsValidSecondForm = jest.fn(() => true);
  getSeconfForm = jest.fn(() => ({
    nameDestination: 'Test Destination',
    accountDestination: '123456',
    addressDestination: 'Test Address'
  }));
  getTableContain = jest.fn(() => [
    { description: 'Item 1', total: 100 },
    { description: 'Item 2', total: 200 }
  ]);
  updateTable = jest.fn();
  updateAllMarkFieldForm = jest.fn();
  updateFirstForm = jest.fn();
  updateValidFirstForm = jest.fn();
}

class MockToastrService {
  error = jest.fn();
  success = jest.fn();
}

class MockCreateInvoicePdfService {
  newGeneratePDFInvoices = jest.fn().mockResolvedValue(Promise.resolve());
}
jest.mock('pdfmake-wrapper');
// Mock para ViewContainerRef
class MockViewContainerRef {
  clear = jest.fn();
  createComponent = jest.fn().mockReturnValue({
    instance: {},
    destroy: jest.fn()
  });
}

describe('StepperInvoicesGeneratePdfComponent', () => {
  let component: StepperInvoicesGeneratePdfComponent;
  let fixture: ComponentFixture<StepperInvoicesGeneratePdfComponent>;
  let mockStore: MockInvoicesStore;
  let mockToastr: MockToastrService;
  let mockPdfService: MockCreateInvoicePdfService;
  let mockViewContainerRef: MockViewContainerRef;

  beforeEach(async () => {
    mockStore = new MockInvoicesStore();
    mockToastr = new MockToastrService();
    mockPdfService = new MockCreateInvoicePdfService();
    mockViewContainerRef = new MockViewContainerRef();

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        StepperModule,
        ButtonModule,
        StepperInvoicesGeneratePdfComponent,
        StepperContextComponent,
        // Mocks de componentes dinámicos
        InvoicesSenderFormComponent,
        ContainInvoicesComponent,
        InvoicesDestinationFormComponent
      ],
      providers: [
        { provide: InvoicesStore, useValue: mockStore },
        { provide: ToastrService, useValue: mockToastr },
        { provide: CreateInvoicePdfService, useValue: mockPdfService },
        { provide: ViewContainerRef, useValue: mockViewContainerRef }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepperInvoicesGeneratePdfComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*xit('should initialize with step 1', () => {
    expect(component.data()).toBe(1);
  });

  xit('should have correct step names', () => {
    expect(component.nameStepOne).toBe('Remitente Factura');
    expect(component.nameStepTwo).toBe('Tabla Factura');
    expect(component.nameStepThree).toBe('Destinatario - Generar Factura');
  });

  xdescribe('getVisibleButtons', () => {
    it('should return correct buttons for step 1', () => {
      component.data.set(1);
      const buttons = component.getVisibleButtons(1);
      expect(buttons.length).toBe(2);
      expect(buttons[0].label).toBe('Limpiar Todo');
      expect(buttons[1].label).toBe('Siguiente');
    });

    it('should return correct buttons for step 2', () => {
      component.data.set(2);
      const buttons = component.getVisibleButtons(2);
      expect(buttons.length).toBe(2);
      expect(buttons[0].label).toBe('Atrás');
      expect(buttons[1].label).toBe('Siguiente');
    });

    it('should return correct buttons for step 3', () => {
      component.data.set(3);
      const buttons = component.getVisibleButtons(3);
      expect(buttons.length).toBe(2);
      expect(buttons[0].label).toBe('Atrás');
      expect(buttons[1].label).toBe('Generar Factura');
    });
  });

  xdescribe('updateCurrentComponent', () => {
    it('should load InvoicesSenderFormComponent for step 1', () => {
      component.data.set(1);
      component.updateCurrentComponent();
      expect(mockViewContainerRef.clear).toHaveBeenCalled();
      expect(mockViewContainerRef.createComponent).toHaveBeenCalledWith(InvoicesSenderFormComponent);
    });

    it('should load ContainInvoicesComponent for step 2', () => {
      component.data.set(2);
      component.updateCurrentComponent();
      expect(mockViewContainerRef.createComponent).toHaveBeenCalledWith(ContainInvoicesComponent);
    });

    it('should load InvoicesDestinationFormComponent for step 3', () => {
      component.data.set(3);
      component.updateCurrentComponent();
      expect(mockViewContainerRef.createComponent).toHaveBeenCalledWith(InvoicesDestinationFormComponent);
    });
  });

  xdescribe('cleanDataStep', () => {
    it('should reset store data and update form', () => {
      // Mock del componente de paso 1
      component.componentRefs[1] = {
        changeData: jest.fn(),
        formSenderGenericComponent: {
          getGroupForm: {
            markAsUntouched: jest.fn()
          }
        }
      };

      component.cleanDataStep();

      expect(mockStore.resetInvoices).toHaveBeenCalled();
      expect(mockStore.resetTableInvoices).toHaveBeenCalled();
      expect(component.componentRefs[1].changeData).toHaveBeenCalledWith(mockStore.getFirstForm());
      expect(component.componentRefs[1].formSenderGenericComponent.getGroupForm.markAsUntouched).toHaveBeenCalled();
    });
  });

  xdescribe('notAllowedShowPdf', () => {
    beforeEach(() => {
      // Mock del componente de paso 3
      component.componentRefs[3] = {
        isValidForm: jest.fn(() => true),
        formDestinationGenericComponent: {
          getGroupForm: {
            markAllAsTouched: jest.fn()
          },
          getDataFormComplete: jest.fn(() => ({
            nameDestination: 'Test Destination',
            accountDestination: '123456'
          }))
        }
      };
    });

    it('should show error if step 1 form is invalid', () => {
      mockStore.getIsValidFirstForm.mockReturnValue(false);
      component.notAllowedShowPdf();
      expect(mockToastr.error).toHaveBeenCalledWith(
        'Deben ser válidos los formularios del paso 1.',
        'Error'
      );
      expect(mockStore.updateAllMarkFieldForm).toHaveBeenCalledWith(true);
    });

    it('should show error if step 3 form is invalid', () => {
      mockStore.getIsValidFirstForm.mockReturnValue(true);
      component.componentRefs[3].isValidForm.mockReturnValue(false);
      component.notAllowedShowPdf();
      expect(mockToastr.error).toHaveBeenCalledWith(
        'Deben ser válidos los formularios del paso 3.',
        'Error'
      );
    });

    it('should generate PDF if all forms are valid', fakeAsync(() => {
      mockStore.getIsValidFirstForm.mockReturnValue(true);
      component.componentRefs[3].isValidForm.mockReturnValue(true);
      
      component.notAllowedShowPdf();
      tick();
      
      expect(mockPdfService.newGeneratePDFInvoices).toHaveBeenCalled();
      expect(mockToastr.error).not.toHaveBeenCalled();
    }));
  });

  xdescribe('askHaveDataTableCreate', () => {
    it('should add summary rows when table is empty', () => {
      mockStore.getTableContain.mockReturnValue([]);
      component.askHaveDataTableCreate();
      expect(mockStore.updateTable).toHaveBeenCalled();
      const updatedTable = mockStore.updateTable.mock.calls[0][0];
      expect(updatedTable.length).toBe(2);
      expect(updatedTable[0].perCentIva).toBe('IVA');
      expect(updatedTable[1].perCentIva).toBe('TOTAL');
    });

    it('should not add rows when table has data', () => {
      mockStore.getTableContain.mockReturnValue([{ description: 'Test', total: 100 }]);
      component.askHaveDataTableCreate();
      expect(mockStore.updateTable).not.toHaveBeenCalled();
    });
  });

  xdescribe('ngOnDestroy', () => {
    it('should reset store data on destroy', () => {
      component.ngOnDestroy();
      expect(mockStore.resetTableInvoices).toHaveBeenCalled();
      expect(mockStore.resetInvoices).toHaveBeenCalled();
    });
  });*/
});