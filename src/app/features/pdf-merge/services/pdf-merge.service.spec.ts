import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PdfMergeService } from './pdf-merge.service';
import { ToastrService } from 'ngx-toastr';
import { PDFDocument } from 'pdf-lib';

class MockFile extends File {
  constructor(parts: (string | Blob | ArrayBuffer)[], name: string, options?: FilePropertyBag) {
    super(parts, name, options);
  }
  
  override arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new TextEncoder().encode('%PDF-1.4').buffer);
  }
}

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    create: jest.fn().mockResolvedValue({
      copyPages: jest.fn().mockReturnValue([{}]),
      addPage: jest.fn(),
      save: jest.fn().mockResolvedValue(new Uint8Array()),
      getPageIndices: jest.fn().mockReturnValue([0]),
      getPages: jest.fn().mockReturnValue([{}]),
      getPageCount: jest.fn().mockReturnValue(1)
    }),
    load: jest.fn().mockResolvedValue({
      getPageIndices: jest.fn().mockReturnValue([0]),
      getPages: jest.fn().mockReturnValue([{}]),
      getPageCount: jest.fn().mockReturnValue(1)
    })
  }
}));

describe('PdfMergeService', () => {
  let service: PdfMergeService;
  let toastrService: ToastrService;
  let windowOpenSpy: jest.SpyInstance;
  let originalCreateObjectURL: (obj: Blob) => string;
  let originalRevokeObjectURL: (url: string) => void;

  beforeEach(() => {
    originalCreateObjectURL = window.URL.createObjectURL;
    originalRevokeObjectURL = window.URL.revokeObjectURL;
    
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        PdfMergeService,
        {
          provide: ToastrService,
          useValue: {
            warning: jest.fn(),
            error: jest.fn(),
            success: jest.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(PdfMergeService);
    toastrService = TestBed.inject(ToastrService);
  });

  afterEach(() => {
    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('mergePdfs', () => {
    it('should throw error when no files provided', async () => {
      await expect(service.mergePdfs([])).rejects.toThrow('No PDF files provided');
      expect(toastrService.warning).toHaveBeenCalledWith(
        'No se han seleccionado archivos PDF para fusionar', 
        'Advertencia'
      );
    });

    it('should skip non-PDF files', async () => {
      const files = [
        new MockFile([''], 'test.txt', { type: 'text/plain' }),
        new MockFile(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' })
      ];

      await service.mergePdfs(files);
      expect(toastrService.warning).toHaveBeenCalledWith(
        'El archivo test.txt no es un PDF válido',
        'Advertencia'
      );
      expect(PDFDocument.load).toHaveBeenCalledTimes(1);
    });

    it('should merge valid PDF files', async () => {
      const files = [
        new MockFile(['%PDF-1.4'], 'test1.pdf', { type: 'application/pdf' }),
        new MockFile(['%PDF-1.4'], 'test2.pdf', { type: 'application/pdf' })
      ];

      const result = await service.mergePdfs(files);
      expect(PDFDocument.create).toHaveBeenCalled();
      expect(PDFDocument.load).toHaveBeenCalledTimes(2);
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle PDF processing errors', async () => {
      const error = new Error('PDF processing failed');
      (PDFDocument.load as jest.Mock).mockRejectedValueOnce(error);
      
      const file = new MockFile(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });

      await expect(service.mergePdfs([file])).rejects.toThrow(error);
      expect(toastrService.error).toHaveBeenCalledWith(
        'Error al procesar el archivo test.pdf',
        'Error'
      );
    });
  });
describe('openPdfInNewTab', () => {
  it('should open PDF in new tab and revoke URL', fakeAsync(() => {
    const pdfData = new Uint8Array([1, 2, 3]);
    let loadListener: any = null;

    const mockWindow = {
      closed: false,
      addEventListener: jest.fn((type, listener) => {
        if (type === 'load') {
          loadListener = listener;
        }
      }),
      removeEventListener: jest.fn(),
      document: { readyState: 'complete' }
    };

    const windowOpenSpy = jest.spyOn(window, 'open').mockReturnValue(mockWindow as any);
    const revokeSpy = jest.spyOn(window.URL, 'revokeObjectURL');

    service.openPdfInNewTab(pdfData);
    
    // Simular el evento load inmediatamente
    if (loadListener && typeof loadListener === 'function') {
      loadListener(new Event('load'));
    }
    
    // Avanzar el tiempo para procesar el setTimeout
    tick(3000); // Avanzamos 3 segundos para cubrir el setTimeout de 3000ms

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(windowOpenSpy).toHaveBeenCalledWith('blob:mock-url', '_blank', 'noopener,noreferrer');
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock-url');
  }));

  it('should handle popup blockers', async () => {
    jest.spyOn(window, 'open').mockReturnValue(null);
    const pdfData = new Uint8Array([1, 2, 3]);

    await expect(service.openPdfInNewTab(pdfData)).rejects.toThrow('Popup blocked by browser');
    expect(toastrService.error).toHaveBeenCalledWith(
      'No se pudo abrir el PDF. Por favor, intente nuevamente.',
      'Error'
    );
  });
});
  describe('mergeAndOpenPdfs', () => {
    it('should merge and open PDFs', async () => {
      const files = [
        new MockFile(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' })
      ];

      jest.spyOn(service, 'mergePdfs').mockResolvedValue(new Uint8Array());
      const openSpy = jest.spyOn(service, 'openPdfInNewTab').mockResolvedValue();

      await service.mergeAndOpenPdfs(files);
      expect(service.mergePdfs).toHaveBeenCalledWith(files);
      expect(openSpy).toHaveBeenCalled();
    });

    it('should handle merge errors', async () => {
      const error = new Error('Merge failed');
      jest.spyOn(service, 'mergePdfs').mockRejectedValue(error);
      
      const files = [
        new MockFile(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' })
      ];

      await expect(service.mergeAndOpenPdfs(files)).rejects.toThrow('Merge failed');
      expect(toastrService.error).toHaveBeenCalledWith(
        'Error al procesar los archivos PDF',
        'Error'
      );
    });
  });
});