import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImagesToPdfComponent } from './images-to-pdf.component';
import { TableGenericComponent } from '../../../../shared/components/table-generic/table-generic.component';
import { ButtonGenericComponent } from '../../../../shared/components/button-generic/button-generic.component';
import { MessagesComponent } from '../../../../shared/components/messages/messages.component';
import { DragDropAreaComponent } from '../../../../shared/components/drag-drop-area/drag-drop-area.component';
import { FormGenericComponent } from '../../../../shared/components/form-generic/form-generic.component';
import { DomSanitizer } from '@angular/platform-browser';
import { DownloadImagePdfService } from '../../services/download-image-pdf.service';
import { ConfirmationService } from '../../../../shared/services/confirmation/confirmation.service';
import { of } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => {
    return {
      addImage: jest.fn(),
      save: jest.fn(),
      // Agrega otros métodos que uses de jsPDF
    };
  });
});

// Mock URL.createObjectURL
URL.createObjectURL = jest.fn(() => 'mock-url');

describe('ImagesToPdfComponent', () => {
  let component: ImagesToPdfComponent;
  let fixture: ComponentFixture<ImagesToPdfComponent>;
  let mockDownloadImagePdfService: jest.Mocked<DownloadImagePdfService>;
  let mockConfirmationService: jest.Mocked<ConfirmationService>;
  let mockDomSanitizer: jest.Mocked<DomSanitizer>;

  beforeEach(async () => {
    mockDownloadImagePdfService = {
      uploadFilesImages: jest.fn(),
    } as unknown as jest.Mocked<DownloadImagePdfService>;

    mockConfirmationService = {
      openConfirmation: jest.fn(() => ({
        onClose: of(true), // Simulate dialog confirmation
      })),
    } as unknown as jest.Mocked<ConfirmationService>;

    mockDomSanitizer = {
      bypassSecurityTrustHtml: jest.fn((html) => html),
    } as unknown as jest.Mocked<DomSanitizer>;

    await TestBed.configureTestingModule({
      imports: [
        ImagesToPdfComponent, // Import the standalone component
        TableGenericComponent,
        ButtonGenericComponent,
        MessagesComponent,
        DragDropAreaComponent,
        FormGenericComponent,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: DownloadImagePdfService,
          useValue: mockDownloadImagePdfService,
        },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        { provide: DomSanitizer, useValue: mockDomSanitizer },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImagesToPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize formConfig correctly', () => {
    expect(component.formConfig).toBeDefined();
    expect(component.formConfig.length).toBe(1);
    expect(component.formConfig[0].name).toBe('file');
  });

  it('should validate and assign files correctly', () => {
    const validFile = new File([''], 'test.png', { type: 'image/png' });
    const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });

    const files = [validFile, invalidFile];
    component.validateAndAssignFiles(files, 'file');

    expect(component.getFormDataFile()).toContain(validFile);
    expect(component.getFormDataFile()).not.toContain(invalidFile);
  });

  it('should handle file drop event', () => {
    const validFile = new File([''], 'test.png', { type: 'image/png' });

    // Create a mock FileList
    const fileList = {
      0: validFile,
      length: 1,
      item: (index: number) => (index === 0 ? validFile : null),
    } as unknown as FileList;

    component.onDrop(fileList);
    expect(component.getFormDataFile()).toContain(validFile);
  });

  it('should handle file upload confirmation', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });

    // Simula el método getFormDataFile
    jest.spyOn(component, 'getFormDataFile').mockReturnValue([file]);

    // Simula la tabla y su propiedad dataTable
    component.tableGenericComponent = {
      dataTable: [file], // Asigna un arreglo de archivos a dataTable
    } as TableGenericComponent<File>;

    // Simula el objeto DynamicDialogRef
    const mockDialogRef: Partial<DynamicDialogRef> = {
      onClose: of(true), // Simula que el usuario confirma
      close: jest.fn(), // Simula el método close
      destroy: jest.fn(), // Simula el método destroy
      dragStart: jest.fn(),
      dragEnd: jest.fn(),
      resizeInit: jest.fn(),
      resizeEnd: jest.fn(),
      // Agrega otros métodos según sea necesario
    };

    // Simula la llamada a openConfirmation
    mockConfirmationService.openConfirmation.mockReturnValue(
      mockDialogRef as DynamicDialogRef
    );

    // Simula el método setFormDataFile
    const setFormDataFileSpy = jest.spyOn(component, 'setFormDataFile');

    component.onUpload(); // Llama al método onUpload

    // Verifica que el servicio se haya llamado con los archivos correctos
    expect(mockConfirmationService.openConfirmation).toHaveBeenCalled();
    expect(mockDownloadImagePdfService.uploadFilesImages).toHaveBeenCalledWith([
      file,
    ]);

    // Verifica que el formulario se haya limpiado
    expect(setFormDataFileSpy).toHaveBeenCalledWith([]);
  });

  it('should reset the table to initial state', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    component.setFormDataFile([file]);
    component.arrayFileWhitOutChange = [file];

    component.restartTable();
    expect(component.getFormDataFile()).toEqual([file]);
  });

  it('should change button state based on form data', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    component.setFormDataFile([file]);

    component.changeStateButton();
    expect(component.buttons.buttons[0].disabled).toBe(false);

    component.setFormDataFile([]);
    component.changeStateButton();
    expect(component.buttons.buttons[0].disabled).toBe(true);
  });

  it('should generate safe HTML for image preview', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });

    // Simula el método customContentTemplate1
    const safeHtml = component.customContentTemplate1(file);

    // Verifica que se haya generado el HTML seguro
    expect(safeHtml).toBeDefined();

    // Verifica que se haya llamado al sanitizador
    expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalled();
  });
});