import { CreateInvoicePdfService } from './create-invoice-pdf.service';
import { TestBed } from '@angular/core/testing';
import { SecondForm } from '../interfaces/second-form';
import { FisrtForm } from '../interfaces/first-form';
import { DataInvoicesTable } from '../interfaces/data-invoices-table';

// Mock the entire pdfmake-wrapper module
jest.mock('pdfmake-wrapper', () => {
  const mockPdfInstance = {
    pageMargins: jest.fn().mockReturnThis(),
    defaultStyle: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
    styles: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnValue({
      open: jest.fn()
    })
  };

  // Constructor function
  const PdfMakeWrapper = jest.fn(() => mockPdfInstance);

  return {
    PdfMakeWrapper,
    Txt: jest.fn(() => ({
      bold: jest.fn().mockReturnThis(),
      fontSize: jest.fn().mockReturnThis(),
      margin: jest.fn().mockReturnThis(),
      end: {}
    })),
    Img: jest.fn(() => ({
      fit: jest.fn().mockReturnThis(),
      alignment: jest.fn().mockReturnThis(),
      margin: jest.fn().mockReturnThis(),
      build: jest.fn().mockResolvedValue({})
    }))
  };
});

// Mock pdfmake and pdfFonts
jest.mock('pdfmake/build/pdfmake', () => ({
  vfs: {},
  fonts: {},
  createPdf: jest.fn()
}));

jest.mock('pdfmake/build/vfs_fonts', () => ({
  pdfMake: { vfs: {} }
}));

describe('CreateInvoicePdfService', () => {
  let service: CreateInvoicePdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CreateInvoicePdfService]
    });

    service = TestBed.inject(CreateInvoicePdfService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('newGeneratePDFInvoices', () => {
    const mockNameAddress: [string, string] = ['Test Name', 'Test Address'];
    const mockEndPage: SecondForm = {
      nameDestination: 'Test Destination',
      accountDestination: 'Test Account',
      addressDestination: 'Test Address',
      nameBank: 'Test Bank',
      addressBank: 'Test Bank Address',
      nif: 'Test NIF'
    };
    
    const completeMockRightInvoice: FisrtForm = {
      numberInvoice: 'INV-001',
      date: new Date(),
      name: 'Test Name',
      passport: 'PASSPORT123'
    };

    const mockTableData: DataInvoicesTable[] = [{
      id: '1',
      description: 'Test Item',
      qtt: '2',
      price: '10',
      sTotal: '20',
      perCentIva: '21',
      total: '24.20'
    }];

    it('should create and open a PDF invoice', async () => {
      await service.newGeneratePDFInvoices(
        mockNameAddress,
        mockEndPage,
        completeMockRightInvoice,
        mockTableData
      );

      const pdfMakeWrapper = require('pdfmake-wrapper');
      
      // Verify PdfMakeWrapper was called as constructor
      expect(pdfMakeWrapper.PdfMakeWrapper).toHaveBeenCalled();
      
      // Verify methods were called
      const mockInstance = pdfMakeWrapper.PdfMakeWrapper.mock.results[0].value;
      expect(mockInstance.pageMargins).toHaveBeenCalledWith([40, 60, 40, 60]);
      expect(mockInstance.defaultStyle).toHaveBeenCalledWith({ fontSize: 10 });
      
      // Updated to expect 4 calls: Logo, content table, invoice table, from section
      expect(mockInstance.add).toHaveBeenCalledTimes(4);
      expect(mockInstance.create).toHaveBeenCalled();
      expect(mockInstance.create().open).toHaveBeenCalled();
    });

    it('should always include passport in PDF', async () => {
      await service.newGeneratePDFInvoices(
        mockNameAddress,
        mockEndPage,
        completeMockRightInvoice,
        mockTableData
      );

      const pdfMakeWrapper = require('pdfmake-wrapper');
      expect(pdfMakeWrapper.PdfMakeWrapper).toHaveBeenCalled();

      // Verify the Txt content includes "Pasaporte" since we always use passport now
      expect(pdfMakeWrapper.Txt).toHaveBeenCalledWith(
        expect.stringContaining('Pasaporte')
      );
    });

    it('should handle null date', async () => {
      const invoiceWithNullDate: FisrtForm = {
        ...completeMockRightInvoice,
        date: null
      };

      await service.newGeneratePDFInvoices(
        mockNameAddress,
        mockEndPage,
        invoiceWithNullDate,
        mockTableData
      );

      const pdfMakeWrapper = require('pdfmake-wrapper');
      expect(pdfMakeWrapper.PdfMakeWrapper).toHaveBeenCalled();
    });

    it('should format the table data correctly', async () => {
      await service.newGeneratePDFInvoices(
        mockNameAddress,
        mockEndPage,
        completeMockRightInvoice,
        mockTableData
      );

      const pdfMakeWrapper = require('pdfmake-wrapper');
      const mockInstance = pdfMakeWrapper.PdfMakeWrapper.mock.results[0].value;
      
      // Find the invoice table call (third add call)
      const tableCall = mockInstance.add.mock.calls[2];
      expect(tableCall).toBeDefined();
      
      const tableDef = tableCall[0].table;
      expect(tableDef).toBeDefined();
      
      // Verify header row
      const headerRow = tableDef.body[0];
      expect(headerRow).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ text: 'ID', style: 'tableHeader' }),
          expect.objectContaining({ text: 'DESCRIPCIÓN', style: 'tableHeader' }),
          expect.objectContaining({ text: 'QTT', style: 'tableHeader' })
        ])
      );
      
      // Verify data row
      const dataRow = tableDef.body[1];
      expect(dataRow).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ text: '1' }),
          expect.objectContaining({ text: 'Test Item' }),
          expect.objectContaining({ text: '2' })
        ])
      );
    });
  });
});