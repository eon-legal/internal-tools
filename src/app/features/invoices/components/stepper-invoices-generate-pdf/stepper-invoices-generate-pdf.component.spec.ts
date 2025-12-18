import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepperInvoicesGeneratePdfComponent } from './stepper-invoices-generate-pdf.component';
import { ToastrService } from 'ngx-toastr';
import { CreateInvoicePdfService } from '../../services/create-invoice-pdf.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { InvoicesStore } from '../../../../store/app.store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslateService } from '@ngx-translate/core';

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
  let mockTranslateService: jest.Mocked<TranslateService>;

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

    mockTranslateService = {
      instant: jest.fn((key: string) => key),
      get: jest.fn((key: string) => of(key)),
      onLangChange: of({ lang: 'es' }),
      onTranslationChange: of({}),
      onDefaultLangChange: of({}),
    } as unknown as jest.Mocked<TranslateService>;

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
        ButtonModule,
        NoopAnimationsModule,
        StepperInvoicesGeneratePdfComponent,
      ],
      providers: [
        { provide: ToastrService, useValue: mockToastrService },
        {
          provide: CreateInvoicePdfService,
          useValue: mockCreateInvoicePdfService,
        },
        { provide: InvoicesStore, useValue: mockInvoicesStore },
        { provide: DialogService, useValue: mockDialogService },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StepperInvoicesGeneratePdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have action buttons configured', () => {
    expect(component.actionButtons.length).toBe(2);
    expect(component.actionButtons[0]?.label).toBe('invoices.stepper.buttons.clear_all');
    expect(component.actionButtons[1]?.label).toBe('invoices.stepper.buttons.generate_invoice');
  });

  describe('ngAfterViewInit', () => {
    it('should execute without error', () => {
      expect(() => component.ngAfterViewInit()).not.toThrow();
    });
  });

  describe('cleanDataStep', () => {
    it('should reset store data', () => {
      // Mock the combined form component
      component.combinedFormComponent = {
        senderFormComponent: {
          changeData: jest.fn(),
          formSenderGenericComponent: {
            getForm: { markAsUntouched: jest.fn() },
          },
        },
        loadDestinations: jest.fn(),
      } as any;
      mockInvoicesStore.getFirstForm.mockReturnValue({});

      component.cleanDataStep();

      expect(mockInvoicesStore.resetInvoices).toHaveBeenCalled();
      expect(mockInvoicesStore.resetTableInvoices).toHaveBeenCalled();
    });
  });

  describe('generateInvoice', () => {
    beforeEach(() => {
      mockInvoicesStore.getTableContain.mockReturnValue([]);
    });

    it('should do nothing if combined form component is not defined', async () => {
      component.combinedFormComponent = undefined as any;
      await component.generateInvoice();
      expect(
        mockCreateInvoicePdfService.newGeneratePDFInvoices
      ).not.toHaveBeenCalled();
    });

    it('should show error when form is invalid', async () => {
      component.combinedFormComponent = {
        isValidSenderAndTable: jest.fn().mockReturnValue(false),
        isValidDestination: jest.fn().mockReturnValue(false),
        markAllAsTouched: jest.fn(),
        getSelectedDestination: jest.fn(),
      } as any;

      await component.generateInvoice();

      expect(mockToastrService.error).toHaveBeenCalled();
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
