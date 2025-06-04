import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploadComponent } from './file-upload.component';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { ChangeDetectorRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;
  let cdr: ChangeDetectorRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadModule, FileUploadComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should initialize with default values', () => {
      expect(component.accept).toEqual([]);
      expect(component.auto).toBe(false);
      expect(component.noFooter).toBe(false);
      expect(component.multiple).toBe(false);
      expect(component.chooseLabel).toBe('Seleccionar');
      expect(component.uploadLabel).toBe('Descargar');
      expect(component.cancelLabel).toBe('Limpiar');
      expect(component.files).toEqual([]);
    });

    it('should accept input properties', () => {
      component.accept = ['.pdf', '.jpg'];
      component.auto = true;
      component.noFooter = true;
      component.multiple = true;
      component.chooseLabel = 'Choose';
      component.uploadLabel = 'Upload';
      component.cancelLabel = 'Cancel';
      component.files = [new File([''], 'test.pdf')];

      expect(component.accept).toEqual(['.pdf', '.jpg']);
      expect(component.auto).toBe(true);
      expect(component.noFooter).toBe(true);
      expect(component.multiple).toBe(true);
      expect(component.chooseLabel).toBe('Choose');
      expect(component.uploadLabel).toBe('Upload');
      expect(component.cancelLabel).toBe('Cancel');
      expect(component.files.length).toBe(1);
    });
  });

  describe('getAccept()', () => {
    it('should return * when no accept types are provided', () => {
      component.accept = [];
      expect(component.getAccept()).toBe('*');
    });

    it('should return formatted accept string when types are provided', () => {
      component.accept = ['pdf', 'jpg'];
      expect(component.getAccept()).toBe('.pdf,.jpg');
    });

    it('should handle single accept type', () => {
      component.accept = ['pdf'];
      expect(component.getAccept()).toBe('.pdf');
    });
  });

  describe('File selection', () => {
    it('should handle file selection and filter duplicates', () => {
      // Crear archivos con propiedades únicas
      const mockFile1 = new File(['content1'], 'file1.pdf', {
        type: 'application/pdf',
        lastModified: Date.now(),
      });
      const mockFile2 = new File(['content2'], 'file2.pdf', {
        type: 'application/pdf',
        lastModified: Date.now(),
      });

      const fisrtSelectionEvent = {
        files: [mockFile1, mockFile2],
      } as FileSelectEvent;

      component.onFileSelect(fisrtSelectionEvent);

      expect(component.selectedFiles().length).toBe(2);
      expect(component.selectedFiles()).toContainEqual(mockFile1);
      expect(component.selectedFiles()).toContainEqual(mockFile2);

      // Duplicado exacto de mockFile1
      const duplicateFile = new File(['content1'], 'file1.pdf', {
        type: 'application/pdf',
        lastModified: mockFile1.lastModified,
      });

      // Duplicado exacto de mockFile1
      const newFile = new File(['content3'], 'file3.pdf', {
        type: 'application/pdf',
        lastModified: Date.now(),
      });

      const secondSelectionEvent = {
        files: [duplicateFile, newFile],
      } as FileSelectEvent;

      jest.spyOn(component.select, 'emit');
      component.onFileSelect(secondSelectionEvent);
      expect(component.selectedFiles().length).toBe(3);

      expect(component.select.emit).toHaveBeenCalledWith([newFile]);
      const fileInList = component
        .selectedFiles()
        .find((f) => f.name === 'file1.pdf');
      expect(fileInList).toBe(mockFile1);
    });
    it('should not emit select event when no new files are selected', () => {
      const mockFile = new File(['content'], 'file.pdf');
      component.selectedFiles.set([mockFile]);

      const mockEvent = {
        files: [mockFile],
      };

      jest.spyOn(component.select, 'emit');
      component.onFileSelect(mockEvent as any);

      expect(component.selectedFiles().length).toBe(1);
      expect(component.select.emit).not.toHaveBeenCalled();
    });
  });

  describe('File management', () => {
    it('should set files programmatically', () => {
      const mockFiles = [
        new File([''], 'test1.pdf'),
        new File([''], 'test2.pdf'),
      ];
      component.setFiles(mockFiles);
      expect(component.getFiles()).toEqual(mockFiles);
    });

    it('should clear files', () => {
      const mockFiles = [new File([''], 'test.pdf')];
      component.selectedFiles.set(mockFiles);
      component.fileUpload = { clear: jest.fn() } as any;

      component.clearFiles();

      expect(component.getFiles()).toEqual([]);
      expect(component.fileUpload.clear).toHaveBeenCalled();
    });

    it('should get files', () => {
      const mockFiles = [new File([''], 'test.pdf')];
      component.selectedFiles.set(mockFiles);
      expect(component.getFiles()).toEqual(mockFiles);
    });
  });

  describe('Events', () => {
    it('should emit upload event', () => {
      jest.spyOn(component.upload, 'emit');
      component.onUpload();
      expect(component.upload.emit).toHaveBeenCalled();
    });

    it('should emit clean event and clear files on clear', () => {
      jest.spyOn(component.clean, 'emit');
      component.selectedFiles.set([new File([''], 'test.pdf')]);
      component.fileUpload = { clear: jest.fn() } as any;

      component.onClear();

      expect(component.clean.emit).toHaveBeenCalled();
      expect(component.selectedFiles().length).toBe(0);
      expect(component.fileUpload.clear).toHaveBeenCalled();
    });

    it('should not clear files if no files are selected', () => {
      jest.spyOn(component.clean, 'emit');
      component.selectedFiles.set([]);
      component.fileUpload = { clear: jest.fn() } as any;

      component.onClear();

      expect(component.clean.emit).toHaveBeenCalled();
      expect(component.fileUpload.clear).not.toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('should clear selected files when files input changes to empty array', () => {
      component.selectedFiles.set([new File([''], 'test.pdf')]);

      component.files = [];
      component.ngOnChanges({
        files: {
          currentValue: [],
          previousValue: undefined,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(component.selectedFiles()).toEqual([]);
    });

    it('should not clear selected files on first change', () => {
      component.selectedFiles.set([new File([''], 'test.pdf')]);

      component.files = [];
      component.ngOnChanges({
        files: {
          currentValue: [],
          previousValue: undefined,
          firstChange: true,
          isFirstChange: () => true,
        },
      });

      expect(component.selectedFiles().length).toBe(1);
    });

    it('should not clear selected files when files input changes to non-empty array', () => {
      component.selectedFiles.set([new File([''], 'test.pdf')]);

      component.files = [new File([''], 'new.pdf')];
      component.ngOnChanges({
        files: {
          currentValue: [new File([''], 'new.pdf')],
          previousValue: undefined,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(component.selectedFiles().length).toBe(1);
    });
  });
});
