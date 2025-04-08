import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationComponent } from './confirmation.component';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonGenericComponent } from '../button-generic/button-generic.component';

describe('ConfirmationComponent', () => {
  let component: ConfirmationComponent;
  let fixture: ComponentFixture<ConfirmationComponent>;
  let mockDialogRef: jest.Mocked<DynamicDialogRef>;
  let mockDialogConfig: Partial<DynamicDialogConfig>;

  beforeEach(async () => {
    mockDialogRef = {
      close: jest.fn(),
    } as unknown as jest.Mocked<DynamicDialogRef>;

    mockDialogConfig = {
      data: {
        message: 'Test message',
      },
    };

    await TestBed.configureTestingModule({
      imports: [ButtonGenericComponent, ConfirmationComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: mockDialogRef },
        { provide: DynamicDialogConfig, useValue: mockDialogConfig },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display message when is not provided input', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('div')).toBeNull();
  });

  it('should display message in template and initialize input', () => {
    component.message = 'Test message';
    fixture.detectChanges();
    const divElement = fixture.nativeElement.querySelector('div');
    expect(divElement).toBeDefined();
    const messageElement = divElement.querySelector('p');
    expect(messageElement.textContent).toContain('Test message');
  });
});
