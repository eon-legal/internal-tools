import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepperInvoicesGeneratePdfComponent } from './stepper-invoices-generate-pdf.component';
import { ToastrService } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CreateInvoicePdfService } from '../../services/create-invoice-pdf.service';
// Mock para ToastrService
class MockToastrService {
  success = jest.fn();
  error = jest.fn();
  info = jest.fn();
  warning = jest.fn();
  clear = jest.fn();
}

// Mock para CreateInvoicePdfService
class MockCreateInvoicePdfService {
  newGeneratePDFInvoices = jest.fn();
}

// Mock para pdfmake-wrapper
jest.mock('pdfmake-wrapper', () => ({
  PdfMakeWrapper: jest.fn().mockImplementation(() => ({
    pageMargins: jest.fn().mockReturnThis(),
    defaultStyle: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
    styles: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnValue({
      open: jest.fn()
    })
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
    build: jest.fn().mockResolvedValue({})
  }))
}));

describe('StepperInvoicesGeneratePdfComponent', () => {
  let component: StepperInvoicesGeneratePdfComponent;
  let fixture: ComponentFixture<StepperInvoicesGeneratePdfComponent>;
  let toastrService: ToastrService;
  let pdfService: CreateInvoicePdfService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperInvoicesGeneratePdfComponent, NoopAnimationsModule],
      providers: [
        {provide: ToastrService, useClass: MockToastrService},
        { provide: CreateInvoicePdfService, useClass: MockCreateInvoicePdfService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepperInvoicesGeneratePdfComponent);
    component = fixture.componentInstance;
    toastrService = TestBed.inject(ToastrService);
    pdfService = TestBed.inject(CreateInvoicePdfService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});