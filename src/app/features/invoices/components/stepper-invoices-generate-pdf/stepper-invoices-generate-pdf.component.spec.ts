import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepperInvoicesGeneratePdfComponent } from './stepper-invoices-generate-pdf.component';
import { ViewContainerRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CreateInvoicePdfService } from '../../services/create-invoice-pdf.service';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { StepperContextComponent } from '../../../../shared/components/stepper-context/stepper-context.component';
import { InvoicesStore } from '../../../../store/app.store';
import { ContainInvoicesComponent } from '../table-invoices/contain-invoices/contain-invoices.component';
import { InvoicesDestinationFormComponent } from '../../../../shared/components/invoices-destination-form/invoices-destination-form.component';
import { InvoicesSenderFormComponent } from '../invoices-sender-form/invoices-sender-form.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { Firestore } from '@angular/fire/firestore';

// Mock para pdfmake-wrapper
jest.mock('pdfmake-wrapper', () => ({
  PdfMakeWrapper: jest.fn().mockImplementation(() => ({
    pageMargins: jest.fn().mockReturnThis(),
    defaultStyle: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
    styles: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnValue({
      open: jest.fn(),
      download: jest.fn(),
    }),
  })),
  Txt: jest.fn().mockImplementation(() => ({
    bold: jest.fn().mockReturnThis(),
    fontSize: jest.fn().mockReturnThis(),
    margin: jest.fn().mockReturnThis(),
    end: {},
  })),
  Img: jest.fn().mockImplementation(() => ({
    fit: jest.fn().mockReturnThis(),
    alignment: jest.fn().mockReturnThis(),
    margin: jest.fn().mockReturnThis(),
    build: jest.fn().mockResolvedValue({}),
  })),
  Table: jest.fn().mockImplementation(() => ({
    layout: jest.fn().mockReturnThis(),
    widths: jest.fn().mockReturnThis(),
    margin: jest.fn().mockReturnThis(),
    end: {},
  })),
}));

type MockInvoicesStore = Partial<typeof InvoicesStore> & {
  resetInvoices: jest.Mock;
  resetTableInvoices: jest.Mock;
  firstForm: jest.Mock;
  secondForm: jest.Mock;
  tableContain: jest.Mock;
  getFirstForm: jest.Mock;
  getSecondForm: jest.Mock;
  //getSecondForm?: jest.Mock; // Added optional typo version
  getTableContain: jest.Mock;
  getIsValidFirstForm: jest.Mock;
  getIsValidSecondForm: jest.Mock;
  getAllMarkFieldForm: jest.Mock;
  updateAllMarkFieldForm: jest.Mock;
  updateTable: jest.Mock;
  updateFirstForm: jest.Mock;
  updateSecondForm: jest.Mock;
  updateValidFirstForm: jest.Mock;
  updateValidSecondForm: jest.Mock;
};

describe('StepperInvoicesGeneratePdfComponent', () => {
  let component: StepperInvoicesGeneratePdfComponent;
  let fixture: ComponentFixture<StepperInvoicesGeneratePdfComponent>;
  let mockToastrService: jest.Mocked<ToastrService>;
  let mockCreateInvoicePdfService: jest.Mocked<CreateInvoicePdfService>;
  let mockInvoicesStore: MockInvoicesStore;
  let mockDialogService: jest.Mocked<DialogService>;

  beforeEach(async () => {
    mockToastrService = {
      error: jest.fn(),
      success: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    } as unknown as jest.Mocked<ToastrService>;

    mockCreateInvoicePdfService = {
      newGeneratePDFInvoices: jest.fn().mockReturnValue(of({})),
      generatePDF: jest.fn(),
    } as unknown as jest.Mocked<CreateInvoicePdfService>;

    mockDialogService = {
      open: jest.fn(),
    } as unknown as jest.Mocked<DialogService>;

    mockInvoicesStore = {
      resetInvoices: jest.fn(),
      resetTableInvoices: jest.fn(),
      firstForm: jest.fn().mockReturnValue({}),
      secondForm: jest.fn().mockReturnValue({}),
      tableContain: jest.fn().mockReturnValue([]),
      getFirstForm: jest.fn().mockReturnValue({}),
      getSecondForm: jest.fn().mockReturnValue({}),
      // Add the typo method to the mock
      getTableContain: jest.fn().mockReturnValue([]),
      getIsValidFirstForm: jest.fn().mockReturnValue(false),
      getIsValidSecondForm: jest.fn().mockReturnValue(false),
      getAllMarkFieldForm: jest.fn().mockReturnValue(false),
      updateAllMarkFieldForm: jest.fn(),
      updateTable: jest.fn(),
      updateFirstForm: jest.fn(),
      updateSecondForm: jest.fn(),
      updateValidFirstForm: jest.fn(),
      updateValidSecondForm: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        StepperModule,
        ButtonModule,
        NoopAnimationsModule,
        StepperInvoicesGeneratePdfComponent,
        StepperContextComponent,
      ],
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: ToastrService, useValue: mockToastrService },
        {
          provide: CreateInvoicePdfService,
          useValue: mockCreateInvoicePdfService,
        },
        { provide: InvoicesStore, useValue: mockInvoicesStore },
        { provide: DialogService, useValue: mockDialogService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StepperInvoicesGeneratePdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with step 1', () => {
    expect(component.data()).toBe(1);
  });

  it('should have correct step names', () => {
    expect(component.nameStepOne).toBe('Remitente Factura');
    expect(component.nameStepTwo).toBe('Tabla Factura');
    expect(component.nameStepThree).toBe('Destinatario - Generar Factura');
  });

  describe('ngAfterViewInit', () => {
    it('should call updateCurrentComponent', () => {
      const spy = jest.spyOn(component, 'updateCurrentComponent');
      component.ngAfterViewInit();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onStepChange', () => {
    it('should update data signal with new value', () => {
      component.onStepChange(2);
      expect(component.data()).toBe(2);
    });
  });

  describe('getVisibleButtons', () => {
    it('should return correct buttons for step 1', () => {
      const buttons = component.getVisibleButtons(1);
      expect(buttons.length).toBe(2);
      expect(buttons[0].label).toBe('Limpiar Todo');
      expect(buttons[1].label).toBe('Siguiente');
    });

    it('should return correct buttons for step 2', () => {
      const buttons = component.getVisibleButtons(2);
      expect(buttons.length).toBe(2);
      expect(buttons[0].label).toBe('Atrás');
      expect(buttons[1].label).toBe('Siguiente');
    });

    it('should return correct buttons for step 3', () => {
      const buttons = component.getVisibleButtons(3);
      expect(buttons.length).toBe(2);
      expect(buttons[0].label).toBe('Atrás');
      expect(buttons[1].label).toBe('Generar Factura');
    });
  });

  describe('updateCurrentComponent', () => {
    beforeEach(() => {
      component.container = {
        clear: jest.fn(),
        createComponent: jest.fn().mockReturnValue({ instance: {} }),
      } as unknown as ViewContainerRef;
    });

    it('should render InvoicesSenderFormComponent for step 1', () => {
      component.data.set(1);
      component.updateCurrentComponent();
      expect(component.container.createComponent).toHaveBeenCalledWith(
        InvoicesSenderFormComponent
      );
    });

    it('should render ContainInvoicesComponent for step 2', () => {
      component.data.set(2);
      component.updateCurrentComponent();
      expect(component.container.createComponent).toHaveBeenCalledWith(
        ContainInvoicesComponent
      );
    });

    it('should render InvoicesDestinationFormComponent for step 3', () => {
      component.data.set(3);
      component.updateCurrentComponent();
      expect(component.container.createComponent).toHaveBeenCalledWith(
        InvoicesDestinationFormComponent
      );
    });
  });

  describe('cleanDataStep', () => {
    it('should reset store data and update form', () => {
      const mockForm = {
        changeData: jest.fn(),
        formSenderGenericComponent: {
          getForm: { markAsUntouched: jest.fn() },
        },
      };
      component.componentRefs[1] = mockForm;
      mockInvoicesStore.getFirstForm.mockReturnValue({});

      component.cleanDataStep();

      expect(mockInvoicesStore.resetInvoices).toHaveBeenCalled();
      expect(mockInvoicesStore.resetTableInvoices).toHaveBeenCalled();
      expect(mockForm.changeData).toHaveBeenCalledWith({});
      expect(
        mockForm.formSenderGenericComponent.getForm.markAsUntouched
      ).toHaveBeenCalled();
    });
  });

  describe('notAllowedShowPdf', () => {
    beforeEach(() => {
      mockInvoicesStore.getTableContain.mockReturnValue([]);
    });

    it('should do nothing if not on step 3', () => {
      component.data.set(2);
      component.notAllowedShowPdf();
      expect(
        mockCreateInvoicePdfService.newGeneratePDFInvoices
      ).not.toHaveBeenCalled();
    });

    it('should show error if step 1 form is invalid', () => {
      component.data.set(3);
      component.componentRefs[3] = {
        isValidForm: jest.fn().mockReturnValue(true),
        formDestinationGenericComponent: {
          getForm: { markAllAsTouched: jest.fn() },
        },
      };
      mockInvoicesStore.getIsValidFirstForm.mockReturnValue(false);

      component.notAllowedShowPdf();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Deben ser válidos los formularios del paso 1.',
        'Error'
      );
      expect(
        mockCreateInvoicePdfService.newGeneratePDFInvoices
      ).not.toHaveBeenCalled();
    });

    it('should show error if step 3 form is invalid', () => {
      component.data.set(3);
      component.componentRefs[3] = {
        isValidForm: jest.fn().mockReturnValue(false),
        formDestinationGenericComponent: {
          getForm: { markAllAsTouched: jest.fn() },
        },
      };
      mockInvoicesStore.getIsValidFirstForm.mockReturnValue(true);
      mockInvoicesStore.getIsValidSecondForm.mockReturnValue(false);

      component.notAllowedShowPdf();

      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Deben ser válidos los formularios del paso 3.',
        'Error'
      );
      expect(
        mockCreateInvoicePdfService.newGeneratePDFInvoices
      ).not.toHaveBeenCalled();
    });

    it('should generate PDF when all forms are valid', () => {
      component.data.set(3);
      component.componentRefs[3] = {
        isValidForm: jest.fn().mockReturnValue(true),
        formDestinationGenericComponent: {
          getDataFormComplete: jest.fn().mockReturnValue({}),
          getForm: { markAllAsTouched: jest.fn() },
        },
      };
      mockInvoicesStore.getIsValidFirstForm.mockReturnValue(true);
      mockInvoicesStore.getIsValidSecondForm.mockReturnValue(true);
      mockInvoicesStore.getFirstForm.mockReturnValue({
        name: 'Test',
        address: '123 St',
      });
      mockInvoicesStore.getTableContain.mockReturnValue([
        { id: '1', description: 'Item', total: 100 },
      ]);

      component.notAllowedShowPdf();

      expect(
        mockCreateInvoicePdfService.newGeneratePDFInvoices
      ).toHaveBeenCalled();
    });
  });

  describe('askHaveDataTableCreate', () => {
    it('should add summary rows when table is empty', () => {
      mockInvoicesStore.getTableContain.mockReturnValue([]);
      component.askHaveDataTableCreate();

      expect(mockInvoicesStore.updateTable).toHaveBeenCalledWith([
        expect.objectContaining({ perCentIva: 'IVA' }),
        expect.objectContaining({ perCentIva: 'Total' }),
      ]);
    });

    it('should not add rows when table has data', () => {
      mockInvoicesStore.getTableContain.mockReturnValue([
        { id: '1', description: 'Item' },
      ]);
      component.askHaveDataTableCreate();
      expect(mockInvoicesStore.updateTable).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should reset store data', () => {
      component.ngOnDestroy();
      expect(mockInvoicesStore.resetTableInvoices).toHaveBeenCalled();
      expect(mockInvoicesStore.resetInvoices).toHaveBeenCalled();
    });
  });

  describe('form validation updates', () => {
    it('should update store when first form validation changes', () => {
      const isValid = true;
      mockInvoicesStore.updateValidFirstForm(isValid);
      expect(mockInvoicesStore.updateValidFirstForm).toHaveBeenCalledWith(
        isValid
      );
    });

    it('should update store when second form validation changes', () => {
      const isValid = false;
      mockInvoicesStore.updateValidSecondForm(isValid);
      expect(mockInvoicesStore.updateValidSecondForm).toHaveBeenCalledWith(
        isValid
      );
    });
  });
});
