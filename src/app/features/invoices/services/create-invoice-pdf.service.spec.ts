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
      identificationType: 'DNI',
      identification: 'PASSPORT123'
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

    it('should include identification type in PDF', async () => {
      await service.newGeneratePDFInvoices(
        mockNameAddress,
        mockEndPage,
        completeMockRightInvoice,
        mockTableData
      );

      const pdfMakeWrapper = require('pdfmake-wrapper');
      expect(pdfMakeWrapper.PdfMakeWrapper).toHaveBeenCalled();

      // Verify the Txt content includes the identification type (DNI in this case)
      expect(pdfMakeWrapper.Txt).toHaveBeenCalledWith(
        expect.stringContaining('DNI:')
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

      // Verify header row has black background and white text
      const headerRow = tableDef.body[0];
      expect(headerRow).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            text: 'ID',
            fillColor: '#000000',
            color: '#FFFFFF',
            bold: true,
          }),
          expect.objectContaining({
            text: 'DESCRIPCIÓN',
            fillColor: '#000000',
            color: '#FFFFFF',
            bold: true,
          }),
          expect.objectContaining({
            text: 'CANT',
            fillColor: '#000000',
            color: '#FFFFFF',
            bold: true,
          }),
        ])
      );

      // Verify data row (item row)
      const dataRow = tableDef.body[1];
      expect(dataRow).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ text: '1', alignment: 'center' }),
          expect.objectContaining({ text: 'Test Item', alignment: 'left' }),
          expect.objectContaining({ text: '2', alignment: 'center' }),
        ])
      );

      // Verify table layout uses medium blue borders
      expect(tableCall[0].layout.hLineColor()).toBe('#3559A6');
      expect(tableCall[0].layout.vLineColor()).toBe('#3559A6');
    });

    it('should include IVA and Total summary rows', async () => {
      const tableDataWithSummary: DataInvoicesTable[] = [
        {
          id: '01',
          description: 'Test Item',
          qtt: '1',
          price: '206.61',
          sTotal: '206.61',
          perCentIva: '21',
          total: '250.00',
        },
        {
          id: '',
          description: '',
          qtt: '',
          sTotal: '',
          perCentIva: 'IVA',
          total: '43.39',
        },
        {
          id: '',
          description: '',
          qtt: '',
          sTotal: '',
          perCentIva: 'Total',
          total: '250.00',
        },
      ];

      await service.newGeneratePDFInvoices(
        mockNameAddress,
        mockEndPage,
        completeMockRightInvoice,
        tableDataWithSummary
      );

      const pdfMakeWrapper = require('pdfmake-wrapper');
      const mockInstance = pdfMakeWrapper.PdfMakeWrapper.mock.results[0].value;

      const tableCall = mockInstance.add.mock.calls[2];
      const tableDef = tableCall[0].table;

      // Table should have: header row + 1 item row + spacer row + IVA row + Total row = 5 rows
      expect(tableDef.body.length).toBe(5);

      // Verify IVA row (4th row, index 3)
      const ivaRow = tableDef.body[3];
      expect(ivaRow[4]).toEqual(
        expect.objectContaining({ text: 'IVA', bold: true })
      );
      expect(ivaRow[5]).toEqual(
        expect.objectContaining({ text: '43,39 €', alignment: 'right' })
      );

      // Verify Total row (5th row, index 4)
      const totalRow = tableDef.body[4];
      expect(totalRow[4]).toEqual(
        expect.objectContaining({
          text: 'Total',
          bold: true,
          fillColor: '#E5E5E5',
        })
      );
      expect(totalRow[5]).toEqual(
        expect.objectContaining({
          text: '250,00 €',
          bold: true,
          fillColor: '#000000',
          color: '#FFFFFF',
        })
      );
    });

    it('should format currency with comma as decimal separator and euro sign', async () => {
      const tableDataWithDecimals: DataInvoicesTable[] = [
        {
          id: '01',
          description: 'Test Item',
          qtt: '1',
          price: '206.61',
          sTotal: '206.61',
          perCentIva: '21',
          total: '250.00',
        },
      ];

      await service.newGeneratePDFInvoices(
        mockNameAddress,
        mockEndPage,
        completeMockRightInvoice,
        tableDataWithDecimals
      );

      const pdfMakeWrapper = require('pdfmake-wrapper');
      const mockInstance = pdfMakeWrapper.PdfMakeWrapper.mock.results[0].value;

      const tableCall = mockInstance.add.mock.calls[2];
      const tableDef = tableCall[0].table;
      const dataRow = tableDef.body[1];

      // Check S.TOTAL column uses comma as decimal separator
      expect(dataRow[3].text).toBe('206,61 €');
      // Check TOTAL column uses comma as decimal separator
      expect(dataRow[5].text).toBe('250,00 €');
    });
  });
});