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
import { of, throwError } from 'rxjs';

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
  let pdfMergeService: PdfMergeService;
  let confirmationService: ConfirmationService;
  let toastrService: ToastrService;

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
          useValue: {
            mergeAndOpenPdfs: jest.fn(() => Promise.resolve())
          }
        },
        { 
          provide: ConfirmationService, 
          useValue: {
            openConfirmation: jest.fn(() => createMockModalRef(true))
          }
        },
        { 
          provide: ToastrService, 
          useValue: {
            warning: jest.fn(),
            error: jest.fn(),
            success: jest.fn()
          }
        },
        { 
          provide: DomSanitizer, 
          useValue: {
            bypassSecurityTrustHtml: jest.fn((html) => html)
          }
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfMergeComponent);
    component = fixture.componentInstance;
    pdfMergeService = TestBed.inject(PdfMergeService);
    confirmationService = TestBed.inject(ConfirmationService);
    toastrService = TestBed.inject(ToastrService);
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

    expect(toastrService.warning).toHaveBeenCalledWith(
      'Para combinar el PDF al menos deben existir dos archivos pdf',
      'Advertencia'
    );
    expect(confirmationService.openConfirmation).not.toHaveBeenCalled();
  });

  it('should handle file upload confirmation with 2+ files', async () => {
    const file1 = new File([''], 'test1.pdf', { type: 'application/pdf' });
    const file2 = new File([''], 'test2.pdf', { type: 'application/pdf' });

    // Mock component state
    jest.spyOn(component, 'getFormDataFile').mockReturnValue([file1, file2]);
    component.tableGenericComponent = {
      dataTable: [file1, file2],
    } as TableGenericComponent<File>;

    // Mock service
    const mergeSpy = jest.spyOn(pdfMergeService, 'mergeAndOpenPdfs').mockResolvedValue(undefined);
    const setFormDataFileSpy = jest.spyOn(component, 'setFormDataFile');

    // Test the method
    await component.onUpload();

    // Verify interactions
    expect(confirmationService.openConfirmation).toHaveBeenCalled();
    expect(mergeSpy).toHaveBeenCalledWith([file1, file2]);
    expect(setFormDataFileSpy).toHaveBeenCalledWith([]);
  });

  it('should not merge files when confirmation is cancelled', async () => {
    const file1 = new File([''], 'test1.pdf', { type: 'application/pdf' });
    const file2 = new File([''], 'test2.pdf', { type: 'application/pdf' });
    
    // Mock cancelled confirmation
    jest.spyOn(confirmationService, 'openConfirmation').mockImplementation(() => 
      createMockModalRef(false)
    );

    jest.spyOn(component, 'getFormDataFile').mockReturnValue([file1, file2]);
    component.tableGenericComponent = {
      dataTable: [file1, file2],
    } as TableGenericComponent<File>;

    const mergeSpy = jest.spyOn(pdfMergeService, 'mergeAndOpenPdfs');
    const setFormDataFileSpy = jest.spyOn(component, 'setFormDataFile');

    await component.onUpload();

    expect(confirmationService.openConfirmation).toHaveBeenCalled();
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
    
    const mergeSpy = jest.spyOn(pdfMergeService, 'mergeAndOpenPdfs').mockResolvedValue(undefined);
    
    await component.merge([file1, file2]);
    
    expect(mergeSpy).toHaveBeenCalledWith([file1, file2]);
  });

  /*it('should handle merge errors', async () => {
    const file1 = new File([''], 'test1.pdf', { type: 'application/pdf' });
    const file2 = new File([''], 'test2.pdf', { type: 'application/pdf' });
    
    jest.spyOn(pdfMergeService, 'mergeAndOpenPdfs').mockRejectedValue(new Error('Merge failed'));
    
    await component.merge([file1, file2]);
    
    expect(toastrService.error).toHaveBeenCalledWith('Error al combinar PDFs', 'Error');
  });*/
});