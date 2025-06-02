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
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ModalRef } from '../../../../shared/components/button-generic/interfaces/buttons';
import { ConfirmationComponent } from '../../../../shared/components/confirmation/confirmation.component';

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => {
    return {
      addImage: jest.fn(),
      save: jest.fn(),
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

  // Create a complete mock ModalRef
  const createMockModalRef = (result: boolean): ModalRef<ConfirmationComponent> => {
    return {
      onClose: jest.fn((callback: (data: boolean) => void) => callback(result)),
      close: jest.fn(),
      getInstance: jest.fn(() => ({ 
        message: 'Test message',
      } as ConfirmationComponent))
    };
  };

  beforeEach(async () => {
    mockDownloadImagePdfService = {
      uploadFilesImages: jest.fn(),
    } as unknown as jest.Mocked<DownloadImagePdfService>;

    mockConfirmationService = {
      openConfirmation: jest.fn(() => createMockModalRef(true)),
    } as unknown as jest.Mocked<ConfirmationService>;

    mockDomSanitizer = {
      bypassSecurityTrustHtml: jest.fn((html) => html),
    } as unknown as jest.Mocked<DomSanitizer>;

    await TestBed.configureTestingModule({
      imports: [
        ImagesToPdfComponent,
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

    // Mock component state
    jest.spyOn(component, 'getFormDataFile').mockReturnValue([file]);
    component.tableGenericComponent = {
      dataTable: [file],
    } as TableGenericComponent<File>;

    // Spy on service methods
    const uploadSpy = jest.spyOn(mockDownloadImagePdfService, 'uploadFilesImages');
    const setFormDataFileSpy = jest.spyOn(component, 'setFormDataFile');

    // Test the method
    component.onUpload();

    // Verify interactions
    expect(mockConfirmationService.openConfirmation).toHaveBeenCalled();
    expect(uploadSpy).toHaveBeenCalledWith([file]);
    expect(setFormDataFileSpy).toHaveBeenCalledWith([]);
  });

  it('should not upload files when confirmation is cancelled', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    
    // Mock cancelled confirmation
    mockConfirmationService.openConfirmation.mockImplementationOnce(() => 
      createMockModalRef(false)
    );

    jest.spyOn(component, 'getFormDataFile').mockReturnValue([file]);
    component.tableGenericComponent = {
      dataTable: [file],
    } as TableGenericComponent<File>;

    const uploadSpy = jest.spyOn(mockDownloadImagePdfService, 'uploadFilesImages');
    const setFormDataFileSpy = jest.spyOn(component, 'setFormDataFile');

    component.onUpload();

    expect(mockConfirmationService.openConfirmation).toHaveBeenCalled();
    expect(uploadSpy).not.toHaveBeenCalled();
    expect(setFormDataFileSpy).not.toHaveBeenCalled();
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
    expect(component.buttons?.buttons?.[0]?.disabled).toBe(false);

    component.setFormDataFile([]);
    component.changeStateButton();
    expect(component.buttons?.buttons?.[0]?.disabled).toBe(true);
  });

  it('should generate safe HTML for image preview', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    const safeHtml = component.customContentTemplate1(file);
    expect(safeHtml).toBeDefined();
    expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalled();
  });
});