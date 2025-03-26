import { TestBed } from '@angular/core/testing';
import { DownloadImagePdfService } from './download-image-pdf.service';
import { ToastrService } from 'ngx-toastr';

// Mock de ToastrService
const mockToastrService = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn()
};

// Mock completo de jsPDF con configuración específica
jest.mock('jspdf', () => {
  const mockPdfMethods = {
    addPage: jest.fn().mockReturnThis(),
    addImage: jest.fn().mockReturnThis(),
    setFontSize: jest.fn().mockReturnThis(),
    setTextColor: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    output: jest.fn().mockReturnValue(new Blob()),
    getTextDimensions: jest.fn().mockReturnValue({ w: 50 }),
    internal: {
      pageSize: { width: 210, height: 297 }, // Tamaño A4 en mm
      getFontList: jest.fn().mockReturnValue({}),
      events: []
    }
  };

  // Función constructora que incluye la configuración
  const JsPDF = function(options?: any) {
    // Verificar que se llamó con los parámetros correctos
    expect(options).toEqual({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    return mockPdfMethods;
  } as any;

  return JsPDF;
});

describe('DownloadImagePdfService', () => {
  let service: DownloadImagePdfService;
  let toastr: ToastrService;

  beforeEach(() => {
    // Configuración de mocks globales (FileReader, Image, URL, window.open)
    global.FileReader = class {
      result = 'data:image/jpeg;base64,mock-data';
      onload: () => void = () => {};
      onerror: () => void = () => {};
      readAsDataURL() {
        this.onload();
      }
    } as any;

    global.Image = class {
      onload: () => void = () => {};
      width = 100;
      height = 100;
      src = '';
      constructor() {
        setTimeout(() => this.onload(), 0);
      }
    } as any;

    global.URL = {
      createObjectURL: jest.fn().mockReturnValue('blob:mock-url'),
      revokeObjectURL: jest.fn()
    } as any;

    global.window.open = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        DownloadImagePdfService,
        { provide: ToastrService, useValue: mockToastrService }
      ]
    });

    service = TestBed.inject(DownloadImagePdfService);
    toastr = TestBed.inject(ToastrService);
    jest.clearAllMocks();
  });

  it('should create PDF with correct configuration', async () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    await service.uploadFilesImages([mockFile]);
    
    // El mock ya verifica internamente la configuración
    // Podemos añadir verificaciones adicionales si es necesario
    const JsPDF = require('jspdf');
    const pdfInstance = new JsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    expect(pdfInstance.addImage).toHaveBeenCalled();
  });

  // Resto de pruebas...
  it('should process valid image files and generate PDF', async () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    await service.uploadFilesImages([mockFile]);
    
    const JsPDF = require('jspdf');
    const pdfInstance = new JsPDF();
    
    expect(pdfInstance.addImage).toHaveBeenCalledWith(
      'data:image/jpeg;base64,mock-data',
      'JPEG',
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number)
    );
    
    expect(toastr.success).toHaveBeenCalled();
  });

  it('should handle multiple pages correctly', async () => {
    const mockFiles = [
      new File([''], 'test1.jpg', { type: 'image/jpeg' }),
      new File([''], 'test2.jpg', { type: 'image/jpeg' })
    ];
    
    await service.uploadFilesImages(mockFiles);
    
    const JsPDF = require('jspdf');
    const pdfInstance = new JsPDF();
    
    expect(pdfInstance.addPage).toHaveBeenCalledTimes(1);
  });

  it('should handle image processing errors', async () => {
    global.FileReader = class {
      onerror: () => void = () => {};
      readAsDataURL() {
        this.onerror();
      }
    } as any;
    
    const mockFile = new File([''], 'error.jpg', { type: 'image/jpeg' });
    
    await service.uploadFilesImages([mockFile]);
    
    expect(toastr.error).toHaveBeenCalledWith(
      'Error al generar el PDF. Por favor, intente nuevamente.',
      'Error'
    );
  });
});
/*    // Verificar que se llama al toastr con el mensaje de error adecuado/*import { TestBed } from '@angular/core/testing';
import { DownloadImagePdfService } from './download-image-pdf.service';
import { ToastrService } from 'ngx-toastr';
import { jsPDF } from 'jspdf';

const mockToastrService = {
  info: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
};

jest.mock('jspdf', () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => {
      return {
        text: jest.fn(),
        addImage: jest.fn(),
        addPage: jest.fn(),
        output: jest.fn().mockReturnValue(new Blob()),
        internal: {
          pageSize: { height: 210, width: 297 }, // Tamaño A4
        },
        getTextDimensions: jest.fn().mockReturnValue({ w: 50 }),
      };
    }),
  };
});

describe('DownloadImagePdfService', () => {
  let service: DownloadImagePdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DownloadImagePdfService,
        { provide: ToastrService, useValue: mockToastrService },
      ],
    });
    service = TestBed.inject(DownloadImagePdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should warn if no files are provided', () => {
    service.uploadFilesImages([]);
    expect(mockToastrService.warning).toHaveBeenCalledWith(
      'No se han seleccionado imágenes para generar el PDF',
      'Advertencia'
    );
  });

  it('should warn if there are invalid files', () => {
    const invalidFiles = [
      new File([], 'test.txt', { type: 'text/plain' }),
      new File([], 'test.pdf', { type: 'application/pdf' }),
    ];

    service.uploadFilesImages(invalidFiles);
    expect(mockToastrService.warning).toHaveBeenCalledWith(
      'Se encontraron 2 archivos que no son imágenes',
      'Advertencia'
    );
  });

  it('should generate PDF with valid image files', async () => {
    const validImageFile = new File([''], 'test.png', { type: 'image/png' });

    // Mock FileReader to simulate loading a base64 string
    const originalReadAsDataURL = FileReader.prototype.readAsDataURL;
    FileReader.prototype.readAsDataURL = function () {
      this.onload();
    };

    // Mock the image loading to return specific dimensions
    const getImageDimensionsSpy = jest.spyOn(service as any, 'getImageDimensions');
    getImageDimensionsSpy.mockResolvedValue({ width: 100, height: 100 });

    await service.uploadFilesImages([validImageFile]);

    // Expect that the addImage method of jsPDF was called
    const pdfInstance = new jsPDF();
    expect(pdfInstance.addImage).toHaveBeenCalled(); // Verifica que se agregó una imagen
    expect(pdfInstance.output).toHaveBeenCalled(); // Verifica que se generó el PDF

    // Restore original FileReader method
    FileReader.prototype.readAsDataURL = originalReadAsDataURL;
  });

  it('should show an error if an image fails to load', async () => {
    jest.spyOn(window, 'open').mockImplementation(() => {
      throw new Error('Cannot open window');
    });

    const validImageFile = new File([''], 'test.png', { type: 'image/png' });

    // We will mock FileReader to return a base64 string
    const originalReadAsDataURL = FileReader.prototype.readAsDataURL;
    FileReader.prototype.readAsDataURL = function () {
      this.onload();
    };

    const getImageDimensions = jest.fn().mockRejectedValue(new Error('Image loading error'));

    // Override getImageDimensions function in the original service
    service['getImageDimensions'] = getImageDimensions;

    await service.uploadFilesImages([validImageFile]);

    expect(mockToastrService.error).toHaveBeenCalledWith(
      'Error al generar el PDF. Por favor, intente nuevamente.',
      'Error'
    );

    // Restore original FileReader method
    FileReader.prototype.readAsDataURL = originalReadAsDataURL;
  });
});*/