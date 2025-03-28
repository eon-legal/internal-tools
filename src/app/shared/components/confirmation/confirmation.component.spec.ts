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
      close: jest.fn()
    } as unknown as jest.Mocked<DynamicDialogRef>;

    mockDialogConfig = {
      data: {
        message: 'Test message'
      }
    };

    await TestBed.configureTestingModule({
      imports: [ButtonGenericComponent, ConfirmationComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: mockDialogRef },
        { provide: DynamicDialogConfig, useValue: mockDialogConfig }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with message from config', () => {
    expect(component.messages).toBe('Test message');
  });

  it('should display message in template', () => {
    const messageElement = fixture.nativeElement.querySelector('p');
    expect(messageElement.textContent).toContain('Test message');
  });

  describe('Buttons Configuration', () => {
    it('should have correct buttons configuration', () => {
      expect(component.buttons).toBeDefined();
      expect(component.buttons?.buttons).toBeDefined();
      
      const buttons = component.buttons?.buttons || [];
      expect(buttons.length).toBe(2);
      
      const cancelButton = buttons[0];
      expect(cancelButton?.label).toBe('Cancelar');
      expect(cancelButton?.severity).toBe('danger');
      expect(cancelButton?.icon).toBe('pi pi-times');

      const acceptButton = buttons[1];
      expect(acceptButton?.label).toBe('Aceptar');
      expect(acceptButton?.severity).toBe('primary');
      expect(acceptButton?.icon).toBe('pi pi-check');
    });

    it('should close dialog with false when cancel button is clicked', () => {
      // Simular botón cancelar
      const cancelButton = component.buttons?.buttons?.[0];
      if (cancelButton && cancelButton.action) {
        cancelButton.action();
      }
      
      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });

    it('should close dialog with true when accept button is clicked', () => {
      // Simular botón aceptar
      const acceptButton = component.buttons?.buttons?.[1];
      if (acceptButton && acceptButton.action) {
        acceptButton.action();
      }
      
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });
  });

  it('should update message when config data changes', () => {
    mockDialogConfig.data = { message: 'New test message' };
    fixture = TestBed.createComponent(ConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.messages).toBe('New test message');
  });
});