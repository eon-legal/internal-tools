import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploadComponent } from './file-upload.component';
import { FileUploadModule } from 'primeng/fileupload';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FileUploadModule,
        FileUploadComponent        
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should generate accept string correctly', () => {
    component.accept = ['pdf', 'jpg'];
    expect(component.getAccept()).toBe('.pdf,.jpg');

    component.accept = [];
    expect(component.getAccept()).toBe('*');
  });

  it('should add files on file select', () => {
    const mockFiles = [
      new File([''], 'test1.pdf', { type: 'application/pdf' }),
      new File([''], 'test2.jpg', { type: 'image/jpg' }),
    ];

    const mockEvent = { files: mockFiles } as FileSelectEvent;

    component.onFileSelect(mockEvent);

    expect(component.selectedFiles().length).toBe(2);
    expect(component.selectedFiles()).toEqual(mockFiles);
  });

  it('should clear files on clear', () => {
    const mockFiles = [new File([''], 'test.pdf', { type: 'application/pdf' })];
    component.selectedFiles.set(mockFiles);

    component.onClear();

    expect(component.selectedFiles().length).toBe(0);
  });

  it('should emit upload event', () => {
    jest.spyOn(component.upload, 'emit');

    component.onUpload();

    expect(component.upload.emit).toHaveBeenCalled();
  });

  it('should set files correctly', () => {
    const mockFiles = [new File([''], 'test.pdf', { type: 'application/pdf' })];
    component.setFiles(mockFiles);

    expect(component.selectedFiles()).toEqual(mockFiles);
  });

  it('should get files correctly', () => {
    const mockFiles = [new File([''], 'test.pdf', { type: 'application/pdf' })];
    component.selectedFiles.set(mockFiles);

    expect(component.getFiles()).toEqual(mockFiles);
  });

  it('should clear files and call fileUpload.clear()', () => {
    const mockFiles = [new File([''], 'test.pdf', { type: 'application/pdf' })];
    component.selectedFiles.set(mockFiles);

    component.fileUpload = { clear: jest.fn() } as unknown as FileUpload;

    component.clearFiles();

    expect(component.selectedFiles().length).toBe(0);
    expect(component.fileUpload.clear).toHaveBeenCalled();
  });

  it('should emit select event with new files', () => {
    jest.spyOn(component.select, 'emit');

    const mockFiles = [new File([''], 'test.pdf', { type: 'application/pdf' })];
    const mockEvent = { files: mockFiles } as FileSelectEvent;

    component.onFileSelect(mockEvent);

    expect(component.select.emit).toHaveBeenCalledWith(mockFiles);
  });

  it('should emit clean event on clear', () => {
    jest.spyOn(component.clean, 'emit');

    component.onClear();

    expect(component.clean.emit).toHaveBeenCalled();
  });
});
