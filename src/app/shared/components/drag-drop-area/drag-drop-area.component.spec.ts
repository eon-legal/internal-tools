import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DragDropAreaComponent } from './drag-drop-area.component';
import { DragDropModule } from 'primeng/dragdrop';

describe('DragDropAreaComponent', () => {
  let component: DragDropAreaComponent;
  let fixture: ComponentFixture<DragDropAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragDropModule, DragDropAreaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DragDropAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should prevent default behavior on dragover', () => {
    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as DragEvent;

    component.onDragOver(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('should prevent default behavior and emit files on drop', () => {
    const mockFiles = [
      new File([''], 'test1.png', { type: 'image/png' }),
      new File([''], 'test2.jpg', { type: 'image/jpg' }),
    ];

    const mockEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        files: mockFiles,
      },
    } as unknown as DragEvent;

    jest.spyOn(component.fileDrop, 'emit');

    component.onDrop(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(component.fileDrop.emit).toHaveBeenCalledWith(mockFiles);
  });

  it('should not emit files on drop if no files are present', () => {
    const mockEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        files: null,
      },
    } as unknown as DragEvent;

    jest.spyOn(component.fileDrop, 'emit');

    component.onDrop(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(component.fileDrop.emit).not.toHaveBeenCalled();
  });

  it('should render the note correctly', () => {
    const noteElement = fixture.nativeElement.querySelector('p');
    expect(noteElement.textContent).toBe('Arrastre y suelte imágenes aquí.');
  });

  it('should render the cloud icon', () => {
    const iconElement = fixture.nativeElement.querySelector('i.pi-cloud-upload');
    expect(iconElement).toBeTruthy();
  });
});