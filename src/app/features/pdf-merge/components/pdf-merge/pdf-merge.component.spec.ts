import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfMergeComponent } from './pdf-merge.component';
import { TableGenericComponent } from '../../../../shared/components/table-generic/table-generic.component';
import { ButtonGenericComponent } from '../../../../shared/components/button-generic/button-generic.component';
import { MessagesComponent } from '../../../../shared/components/messages/messages.component';
import { DragDropAreaComponent } from '../../../../shared/components/drag-drop-area/drag-drop-area.component';
import { FormGenericComponent } from '../../../../shared/components/form-generic/form-generic.component';
import { DomSanitizer } from '@angular/platform-browser';
import { PdfMergeService } from '../../services/pdf-merge.service';
import { ConfirmationService } from '../../../../shared/services/confirmation/confirmation.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ModalRef } from '../../../../shared/components/button-generic/interfaces/buttons';
import { ConfirmationComponent } from '../../../../shared/components/confirmation/confirmation.component';
import { ToastrService } from 'ngx-toastr';

// Mock PDFDocument from pdf-lib
jest.mock('pdf-lib', () => {
  return {
    PDFDocument: {
      create: jest.fn().mockResolvedValue({
        copyPages: jest.fn().mockResolvedValue([]),
        addPage: jest.fn(),
        save: jest.fn().mockResolvedValue(new Uint8Array()),
      }),
      load: jest.fn().mockResolvedValue({
        getPageIndices: jest.fn().mockReturnValue([0]),
      }),
    },
  };
});

// Mock URL.createObjectURL
URL.createObjectURL = jest.fn(() => 'mock-url');

describe('PdfMergeComponent', () => {
  let component: PdfMergeComponent;
  let fixture: ComponentFixture<PdfMergeComponent>;
  let mockPdfMergeService: jest.Mocked<PdfMergeService>;
  let mockConfirmationService: jest.Mocked<ConfirmationService>;
  let mockToastrService: jest.Mocked<ToastrService>;
  let mockDomSanitizer: jest.Mocked<DomSanitizer>;

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
    mockPdfMergeService = {
      mergePdfs: jest.fn(),
      openPdfInNewTab: jest.fn(),
      mergeAndOpenPdfs: jest.fn(),
    } as unknown as jest.Mocked<PdfMergeService>;

    mockConfirmationService = {
      openConfirmation: jest.fn(() => createMockModalRef(true)),
    } as unknown as jest.Mocked<ConfirmationService>;

    mockToastrService = {
      warning: jest.fn(),
      error: jest.fn(),
      success: jest.fn(),
    } as unknown as jest.Mocked<ToastrService>;

    mockDomSanitizer = {
      bypassSecurityTrustHtml: jest.fn((html) => html),
    } as unknown as jest.Mocked<DomSanitizer>;

    await TestBed.configureTestingModule({
      imports: [
        PdfMergeComponent,
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
          provide: PdfMergeService,
          useValue: mockPdfMergeService,
        },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: DomSanitizer, useValue: mockDomSanitizer },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfMergeComponent);
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
    expect(component.formConfig[0].primeNgConfig?.fileOptions?.accept).toEqual(['pdf']);
  });

  it('should validate and assign PDF files correctly', () => {
    const validFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });

    const files = [validFile, invalidFile];
    component.validateAndAssignFiles(files, 'file');

    expect(component.getFormDataFile()).toContain(validFile);
    expect(component.getFormDataFile()).not.toContain(invalidFile);
  });

  it('should handle file drop event for PDF files', () => {
    const validFile = new File([''], 'test.pdf', { type: 'application/pdf' });

    const fileList = {
      0: validFile,
      length: 1,
      item: (index: number) => (index === 0 ? validFile : null),
    } as unknown as FileList;

    component.onDrop(fileList);
    expect(component.getFormDataFile()).toContain(validFile);
  });

  it('should show warning when trying to merge with less than 2 files', () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });

    // Mock component state with only 1 file
    jest.spyOn(component, 'getFormDataFile').mockReturnValue([file]);
    component.tableGenericComponent = {
      dataTable: [file],
    } as TableGenericComponent<File>;

    component.onUpload();

    expect(mockToastrService.warning).toHaveBeenCalledWith(
      'Para combinar el PDF al menos deben existir dos archivos pdf',
      'Advertencia'
    );
    expect(mockConfirmationService.openConfirmation).not.toHaveBeenCalled();
  });

  it('should handle file upload confirmation with 2+ files', async () => {
    const file1 = new File([''], 'test1.pdf', { type: 'application/pdf' });
    const file2 = new File([''], 'test2.pdf', { type: 'application/pdf' });

    // Mock component state
    jest.spyOn(component, 'getFormDataFile').mockReturnValue([file1, file2]);
    component.tableGenericComponent = {
      dataTable: [file1, file2],
    } as TableGenericComponent<File>;

    // Spy on service methods
    const mergeSpy = jest.spyOn(mockPdfMergeService, 'mergeAndOpenPdfs');
    const setFormDataFileSpy = jest.spyOn(component, 'setFormDataFile');

    // Test the method
    await component.onUpload();

    // Verify interactions
    expect(mockConfirmationService.openConfirmation).toHaveBeenCalled();
    expect(mergeSpy).toHaveBeenCalledWith([file1, file2]);
    expect(setFormDataFileSpy).toHaveBeenCalledWith([]);
  });

  it('should not merge files when confirmation is cancelled', async () => {
    const file1 = new File([''], 'test1.pdf', { type: 'application/pdf' });
    const file2 = new File([''], 'test2.pdf', { type: 'application/pdf' });
    
    // Mock cancelled confirmation
    mockConfirmationService.openConfirmation.mockImplementationOnce(() => 
      createMockModalRef(false)
    );

    jest.spyOn(component, 'getFormDataFile').mockReturnValue([file1, file2]);
    component.tableGenericComponent = {
      dataTable: [file1, file2],
    } as TableGenericComponent<File>;

    const mergeSpy = jest.spyOn(mockPdfMergeService, 'mergeAndOpenPdfs');
    const setFormDataFileSpy = jest.spyOn(component, 'setFormDataFile');

    await component.onUpload();

    expect(mockConfirmationService.openConfirmation).toHaveBeenCalled();
    expect(mergeSpy).not.toHaveBeenCalled();
    expect(setFormDataFileSpy).not.toHaveBeenCalled();
  });

  it('should reset the table to initial state', () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    component.setFormDataFile([file]);
    component.arrayFileWhitOutChange = [file];

    component.restartTable();
    expect(component.getFormDataFile()).toEqual([file]);
  });

  it('should change button state based on form data', () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    component.setFormDataFile([file]);

    component.changeStateButton();
    expect(component.buttons?.buttons?.[0]?.disabled).toBe(false);

    component.setFormDataFile([]);
    component.changeStateButton();
    expect(component.buttons?.buttons?.[0]?.disabled).toBe(true);
  });

  it('should display error messages for invalid files', () => {
    const invalidFiles = ['invalid.txt', 'wrong.doc'];
    component.showErrorMessages(invalidFiles);

    expect(component.errorMessage).toContain('Los siguientes archivos no son pdf permitidas:');
    expect(component.errorMessage).toContain('<li>invalid.txt</li>');
    expect(component.errorMessage).toContain('<li>wrong.doc</li>');
  });

  it('should handle file reorganization', () => {
    const file1 = new File([''], 'test1.pdf', { type: 'application/pdf' });
    const file2 = new File([''], 'test2.pdf', { type: 'application/pdf' });
    component.setFormDataFile([file1, file2]);

    component.organizeRow([file2, file1]);
    expect(component.getFormDataFile()).toEqual([file2, file1]);
    expect(component.orderTable).toBe(true);
  });

  it('should call merge service directly', async () => {
    const file1 = new File([''], 'test1.pdf', { type: 'application/pdf' });
    const file2 = new File([''], 'test2.pdf', { type: 'application/pdf' });
    
    await component.merge([file1, file2]);
    
    expect(mockPdfMergeService.mergeAndOpenPdfs).toHaveBeenCalledWith([file1, file2]);
  });

  it('should handle merge errors', async () => {
    const file1 = new File([''], 'test1.pdf', { type: 'application/pdf' });
    const file2 = new File([''], 'test2.pdf', { type: 'application/pdf' });
    
    mockPdfMergeService.mergeAndOpenPdfs.mockRejectedValueOnce(new Error('Merge failed'));
    
    await component.merge([file1, file2]);
    
    expect(mockToastrService.error).toHaveBeenCalledWith('Error al combinar PDFs:', 'Error');
  });
});