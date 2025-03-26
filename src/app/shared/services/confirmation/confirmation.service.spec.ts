import { ConfirmationService } from './confirmation.service';
import { CustomDialogService } from '../modal/custom-dialog.service';
import { ConfirmationComponent } from '../../components/confirmation/confirmation.component';
import { TestBed } from '@angular/core/testing';

describe('ConfirmationService', () => {
  let service: ConfirmationService;
  let customDialogServiceMock: jest.Mocked<CustomDialogService>;

  beforeEach(() => {
    // Create a mock for CustomDialogService
    customDialogServiceMock = {
      openDialog: jest.fn()
    } as unknown as jest.Mocked<CustomDialogService>;

    TestBed.configureTestingModule({
      providers: [
        ConfirmationService,
        { provide: CustomDialogService, useValue: customDialogServiceMock }
      ]
    });

    service = TestBed.inject(ConfirmationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call customDialogService.openDialog with default message when no message is provided', () => {
    const defaultMessage = '¿Estás seguro de que deseas realizar esta acción?';
    
    service.openConfirmation();
    
    expect(customDialogServiceMock.openDialog).toHaveBeenCalledWith(
      ConfirmationComponent,
      '',
      { message: defaultMessage }
    );
  });

  it('should call customDialogService.openDialog with custom message when provided', () => {
    const customMessage = 'Custom confirmation message';
    
    service.openConfirmation(customMessage);
    
    expect(customDialogServiceMock.openDialog).toHaveBeenCalledWith(
      ConfirmationComponent,
      '',
      { message: customMessage }
    );
  });

  it('should return the dialog reference from customDialogService', () => {
    const mockDialogRef = {};
    customDialogServiceMock.openDialog.mockReturnValue(mockDialogRef as any);
    
    const result = service.openConfirmation();
    
    expect(result).toBe(mockDialogRef);
  });
});