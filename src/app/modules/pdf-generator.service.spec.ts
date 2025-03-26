import { TestBed } from '@angular/core/testing';
import { PdfGeneratorService } from './pdf-generator.service';
import { jsPDF } from 'jspdf';

jest.mock('jspdf', () => {
  // Mock jsPDF constructor
  const textMock = jest.fn();
  const saveMock = jest.fn();
  
  return {
    jsPDF: jest.fn().mockImplementation(() => {
      return {
        text: textMock,
        save: saveMock,
      };
    }),
    // Exportar los mocks para poder verificarlos después
    textMock,
    saveMock,
  };
});

describe('PdfGeneratorService', () => {
  let service: PdfGeneratorService;
  let pdfInstance: any;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfGeneratorService);
    pdfInstance = new jsPDF(); // Mock instance of jsPDF
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should generate a PDF', () => {
    const content = 'This is a test document.';
    const filename = 'test.pdf';

    service.generatePDF(content, filename);

    // Verifica que se llama a text y save en la instancia mock
    expect(pdfInstance.text).toHaveBeenCalledWith(content, 10, 10);
    expect(pdfInstance.save).toHaveBeenCalledWith(filename);
  });
});