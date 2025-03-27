import { TestBed } from '@angular/core/testing';
import { DownloadImagePdfService } from './download-image-pdf.service';
import { ToastrService } from 'ngx-toastr';

// Mock de jsPDF
const mockJsPDF = {
  addPage: jest.fn(),
  addImage: jest.fn(),
  output: jest
    .fn()
    .mockReturnValue(new Blob(['dummy pdf'], { type: 'application/pdf' })),
  internal: {
    pageSize: {
      width: 210,
      height: 297,
    },
  },
  setFontSize: jest.fn(),
  setTextColor: jest.fn(),
  text: jest.fn(),
  getTextDimensions: jest.fn().mockReturnValue({ w: 50 }),
};

jest.mock('jspdf', () => {
  return {
    __esModule: true,
    default: jest.fn(() => mockJsPDF),
    jsPDF: jest.fn(() => mockJsPDF),
  };
});

describe('DownloadImagePdfService', () => {
  let service: DownloadImagePdfService;
  let mockToastr: jest.Mocked<ToastrService>;
  let mockWindowOpen: jest.Mock;
  let mockCreateObjectURL: jest.Mock;

  beforeEach(() => {
    // Mock de ToastrService
    mockToastr = {
      warning: jest.fn(),
      error: jest.fn(),
      success: jest.fn(),
    } as unknown as jest.Mocked<ToastrService>;

    // Mock de window y URL
    mockWindowOpen = jest.fn();
    mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock-url');

    global.URL.createObjectURL = mockCreateObjectURL;
    global.window.open = mockWindowOpen;

    TestBed.configureTestingModule({
      providers: [{ provide: ToastrService, useValue: mockToastr }],
    });
    service = TestBed.inject(DownloadImagePdfService);

    // Resetear todos los mocks antes de cada test
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('uploadFilesImages', () => {
    it('should show warning when no files are provided', () => {
      service.uploadFilesImages([]);
      expect(mockToastr.warning).toHaveBeenCalledWith(
        'No se han seleccionado imágenes para generar el PDF',
        'Advertencia'
      );
    });

    it('should show warning when non-image files are provided', () => {
      const invalidFile = new File([''], 'test.pdf', {
        type: 'application/pdf',
      });
      service.uploadFilesImages([invalidFile]);

      expect(mockToastr.warning).toHaveBeenCalledWith(
        'Se encontraron 1 archivos que no son imágenes',
        'Advertencia'
      );
    });

    it('should show error when no valid images remain after filtering', () => {
      const invalidFiles = [
        new File([''], 'test.pdf', { type: 'application/pdf' }),
        new File([''], 'test.doc', { type: 'application/msword' }),
      ];
      service.uploadFilesImages(invalidFiles);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'No hay imágenes válidas para generar el PDF',
        'Error'
      );
    });

    it('should process valid images and generate PDF', (done) => {
      // Mock de archivos de imagen válidos
      const mockImageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

      // Mock de las funciones internas
      jest
        .spyOn(service, 'toBase64')
        .mockResolvedValue('data:image/jpeg;base64,mock');
      jest
        .spyOn(service, 'getImageDimensions')
        .mockResolvedValue({ width: 100, height: 100 });

      service.uploadFilesImages([mockImageFile]);

      // Usar setTimeout para esperar las promesas
      setTimeout(() => {
        // Verificar que se creó el PDF
        const jsPDF = require('jspdf');
        expect(jsPDF.jsPDF).toHaveBeenCalledWith({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        // Verificar que se procesó la imagen
        expect(service.toBase64).toHaveBeenCalledWith(mockImageFile);
        expect(service.getImageDimensions).toHaveBeenCalledWith(
          'data:image/jpeg;base64,mock'
        );

        // Verificar que se añadió la imagen al PDF
        expect(mockJsPDF.addImage).toHaveBeenCalledWith(
          'data:image/jpeg;base64,mock',
          'JPEG',
          expect.any(Number),
          expect.any(Number),
          expect.any(Number),
          expect.any(Number)
        );

        // Verificar que se generó y abrió el PDF
        expect(mockJsPDF.output).toHaveBeenCalledWith('blob');
        expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
        expect(mockWindowOpen).toHaveBeenCalledWith('blob:mock-url', '_blank');

        done();
      }, 0);
    });

    it('should handle multiple images with pages and footers', (done) => {
      // Mock de archivos de imagen válidos
      const mockImageFiles = [
        new File([''], 'test1.jpg', { type: 'image/jpeg' }),
        new File([''], 'test2.png', { type: 'image/png' }),
      ];

      // Mock de las funciones internas
      jest
        .spyOn(service, 'toBase64')
        .mockImplementation((file) =>
          Promise.resolve(`data:${file.type.split('/')[1]};base64,mock`)
        );
      jest
        .spyOn(service, 'getImageDimensions')
        .mockResolvedValue({ width: 100, height: 100 });

      service.uploadFilesImages(mockImageFiles);

      setTimeout(() => {
        // Verificar que se añadió una página para la segunda imagen
        expect(mockJsPDF.addPage).toHaveBeenCalledTimes(1);

        // Verificar que se añadieron los pies de página
        expect(mockJsPDF.setFontSize).toHaveBeenCalledWith(10);
        expect(mockJsPDF.setTextColor).toHaveBeenCalledWith(100);
        expect(mockJsPDF.text).toHaveBeenCalledWith(
          'Página 1 de 2',
          expect.any(Number),
          287
        );
        expect(mockJsPDF.text).toHaveBeenCalledWith(
          'Página 2 de 2',
          expect.any(Number),
          287
        );

        done();
      }, 0);
    });

    it('should show error when image processing fails', (done) => {
      const mockImageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

      // Simular error en el procesamiento
      jest
        .spyOn(service, 'toBase64')
        .mockRejectedValue(new Error('Conversion error'));

      service.uploadFilesImages([mockImageFile]);

      setTimeout(() => {
        expect(mockToastr.error).toHaveBeenCalledWith(
          'Error al generar el PDF. Por favor, intente nuevamente.',
          'Error'
        );
        done();
      }, 0);
    });
  });

  /*describe('toBase64', () => {
    it('should convert file to base64', (done) => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock FileReader success
      jest.spyOn(global, 'FileReader').mockImplementation(function(this: FileReader) {
        const reader = this;
        setTimeout(() => {
          reader.onload({
            target: {
              result: 'data:image/jpeg;base64,test'
            }
          } as any);
        }, 0);
        return reader;
      });

      service.toBase64(mockFile).then((result) => {
        expect(result).toBe('data:image/jpeg;base64,test');
        done();
      });
    });

    it('should reject on error', (done) => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const mockError = new Error('Read error');
      
      // Mock FileReader error
      jest.spyOn(global, 'FileReader').mockImplementation(function(this: FileReader) {
        const reader = this;
        setTimeout(() => {
          reader.onerror(mockError);
        }, 0);
        return reader;
      });

      service.toBase64(mockFile).catch((error) => {
        expect(error).toBe(mockError);
        done();
      });
    });
  });*/

  /* describe('getImageDimensions', () => {
    it('should return image dimensions', (done) => {
      const mockBase64 = 'data:image/png;base64,mock';
      const mockDimensions = { width: 800, height: 600 };
      
      // Mock Image success
      jest.spyOn(global, 'Image').mockImplementation(function(this: HTMLImageElement) {
        const img = this;
        setTimeout(() => {
          Object.assign(img, {
            width: mockDimensions.width,
            height: mockDimensions.height,
            onload: null
          });
          if (img.onload) img.onload(new Event('load'));
        }, 0);
        return img;
      });

      service.getImageDimensions(mockBase64).then((dimensions) => {
        expect(dimensions).toEqual(mockDimensions);
        done();
      });
    });

    it('should return default dimensions on error', (done) => {
      const mockBase64 = 'data:image/png;base64,mock';
      
      // Mock Image error
      jest.spyOn(global, 'Image').mockImplementation(function(this: HTMLImageElement) {
        const img = this;
        setTimeout(() => {
          Object.assign(img, {
            onerror: null
          });
          if (img.onerror) img.onerror(new Event('error'));
        }, 0);
        return img;
      });

      service.getImageDimensions(mockBase64).then((dimensions) => {
        expect(dimensions).toEqual({ width: 100, height: 100 });
        done();
      });
    });
  });*/
});
