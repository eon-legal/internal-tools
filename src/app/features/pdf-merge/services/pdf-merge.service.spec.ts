import { PdfMergeService } from './pdf-merge.service';
import { ToastrService } from 'ngx-toastr';
import { PDFDocument } from 'pdf-lib';

describe('PdfMergeService', () => {
  let service: PdfMergeService;
  let toastrSpy: jest.Mocked<ToastrService>;
  let mockWindowOpen: jest.SpyInstance;

  beforeEach(() => {
    // Create mock ToastrService
    toastrSpy = {
      warning: jest.fn(),
      error: jest.fn(),
      success: jest.fn(),
      info: jest.fn(),
    } as any;

    // Mock window.open
    mockWindowOpen = jest.spyOn(window, 'open').mockImplementation(() => ({
      closed: false,
      focus: jest.fn(),
    } as any));

    // Mock URL methods
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();

    // Create service instance with mock Toastr
    service = new PdfMergeService(toastrSpy);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('mergeAndOpenPdfs', () => {
    it('should show warning when no files are provided', async () => {
      await service.mergeAndOpenPdfs([]);
      
      expect(toastrSpy.warning).toHaveBeenCalledWith(
        'No se han seleccionado archivos PDF para fusionar',
        'Advertencia'
      );
    });

    it('should show warning when non-PDF files are provided', async () => {
      const mockFiles = [
        new File([''], 'test.png', { type: 'image/png' }),
        new File([''], 'test.pdf', { type: 'application/pdf' }),
      ] as any;

      await service.mergeAndOpenPdfs(mockFiles);
      
      expect(toastrSpy.warning).toHaveBeenCalledWith(
        'Se encontraron 1 archivos que no son PDF',
        'Advertencia'
      );
    });

    it('should show error when no valid PDFs remain after filtering', async () => {
      const mockFiles = [
        new File([''], 'test.png', { type: 'image/png' }),
      ] as any;

      await service.mergeAndOpenPdfs(mockFiles);
      
      expect(toastrSpy.error).toHaveBeenCalledWith(
        'No hay archivos PDF válidos para fusionar',
        'Error'
      );
    });

    it('should process valid PDF files successfully', async () => {
      // Mock PDFDocument methods
      const mockMergedPdf = {
        copyPages: jest.fn().mockResolvedValue(['page1', 'page2']),
        addPage: jest.fn(),
        save: jest.fn().mockResolvedValue(new Uint8Array()),
        getPageIndices: jest.fn().mockReturnValue([0]),
      };

      jest.spyOn(PDFDocument, 'create').mockResolvedValue(mockMergedPdf as any);
      jest.spyOn(PDFDocument, 'load').mockResolvedValue({
        getPageIndices: jest.fn().mockReturnValue([0]),
      } as any);

      // Mock File.arrayBuffer
      global.File.prototype.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));

      const mockFiles = [
        new File(['%PDF-1.4...'], 'test1.pdf', { type: 'application/pdf' }),
        new File(['%PDF-1.4...'], 'test2.pdf', { type: 'application/pdf' }),
      ] as any;

      await service.mergeAndOpenPdfs(mockFiles);

      expect(PDFDocument.create).toHaveBeenCalled();
      expect(mockWindowOpen).toHaveBeenCalledWith('mock-url', '_blank');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should show warning when popup is blocked', async () => {
      mockWindowOpen.mockReturnValueOnce(null); // Simulate blocked popup

      // Mock PDFDocument methods
      const mockMergedPdf = {
        copyPages: jest.fn().mockResolvedValue(['page1']),
        addPage: jest.fn(),
        save: jest.fn().mockResolvedValue(new Uint8Array()),
        getPageIndices: jest.fn().mockReturnValue([0]),
      };

      jest.spyOn(PDFDocument, 'create').mockResolvedValue(mockMergedPdf as any);
      jest.spyOn(PDFDocument, 'load').mockResolvedValue({
        getPageIndices: jest.fn().mockReturnValue([0]),
      } as any);

      // Mock File.arrayBuffer
      global.File.prototype.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));

      const mockFiles = [
        new File(['%PDF-1.4...'], 'test.pdf', { type: 'application/pdf' }),
      ] as any;

      await service.mergeAndOpenPdfs(mockFiles);

      expect(toastrSpy.warning).toHaveBeenCalledWith(
        'El navegador bloqueó la ventana emergente. Por favor, habilite popups para esta página.',
        'Advertencia'
      );
    });

    it('should handle errors during PDF processing', async () => {
      // Mock PDFDocument to throw error
      jest.spyOn(PDFDocument, 'create').mockResolvedValue({
        copyPages: jest.fn(),
        addPage: jest.fn(),
        save: jest.fn(),
        getPageIndices: jest.fn(),
      } as any);
      
      jest.spyOn(PDFDocument, 'load').mockRejectedValue(new Error('Load error'));

      // Mock File.arrayBuffer
      global.File.prototype.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));

      const mockFiles = [
        new File([''], 'test.pdf', { type: 'application/pdf' }),
      ] as any;

      await service.mergeAndOpenPdfs(mockFiles);

      expect(toastrSpy.error).toHaveBeenCalledWith(
        'Error al fusionar los PDFs. Por favor, intente nuevamente.',
        'Error'
      );
    });

    it('should revoke object URL after timeout', async () => {
      jest.useFakeTimers();

      // Mock PDFDocument methods
      const mockMergedPdf = {
        copyPages: jest.fn().mockResolvedValue(['page1']),
        addPage: jest.fn(),
        save: jest.fn().mockResolvedValue(new Uint8Array()),
        getPageIndices: jest.fn().mockReturnValue([0]),
      };

      jest.spyOn(PDFDocument, 'create').mockResolvedValue(mockMergedPdf as any);
      jest.spyOn(PDFDocument, 'load').mockResolvedValue({
        getPageIndices: jest.fn().mockReturnValue([0]),
      } as any);

      // Mock File.arrayBuffer
      global.File.prototype.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));

      const mockFiles = [
        new File(['%PDF-1.4...'], 'test.pdf', { type: 'application/pdf' }),
      ] as any;

      await service.mergeAndOpenPdfs(mockFiles);

      // Advance timers to trigger the revokeObjectURL
      jest.advanceTimersByTime(1000);

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');

      jest.useRealTimers();
    });
  });
});