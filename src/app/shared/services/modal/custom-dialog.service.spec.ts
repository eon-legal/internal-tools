import { CustomDialogService } from './custom-dialog.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TestBed } from '@angular/core/testing';

describe('CustomDialogService', () => {
  let service: CustomDialogService;
  let dialogServiceMock: jest.Mocked<DialogService>;
  let mockDialogRef: jest.Mocked<DynamicDialogRef>;

  beforeEach(() => {
    // Create mock dialog reference
    mockDialogRef = {
      close: jest.fn()
    } as unknown as jest.Mocked<DynamicDialogRef>;

    // Create mock DialogService
    dialogServiceMock = {
      open: jest.fn().mockReturnValue(mockDialogRef)
    } as unknown as jest.Mocked<DialogService>;

    TestBed.configureTestingModule({
      providers: [
        CustomDialogService,
        { provide: DialogService, useValue: dialogServiceMock }
      ]
    });

    service = TestBed.inject(CustomDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('openDialog', () => {
    it('should open a dialog with provided component, header and data', () => {
      const mockComponent = {} as any;
      const mockHeader = 'Test Header';
      const mockData = { test: 'data' };

      const result = service.openDialog(mockComponent, mockHeader, mockData);

      expect(dialogServiceMock.open).toHaveBeenCalledWith(mockComponent, {
        header: mockHeader,
        baseZIndex: 10000,
        data: mockData,
        focusOnShow: false,
        modal: true,
        closable: true
      });
      expect(result).toBe(mockDialogRef);
      expect(service['dialogRef']).toBe(mockDialogRef);
    });

    it('should open a dialog with empty data when not provided', () => {
      const mockComponent = {} as any;
      const mockHeader = 'Test Header';

      service.openDialog(mockComponent, mockHeader);

      expect(dialogServiceMock.open).toHaveBeenCalledWith(mockComponent, {
        header: mockHeader,
        baseZIndex: 10000,
        data: {},
        focusOnShow: false,
        modal: true,
        closable: true
      });
    });
  });

  describe('closeDialog', () => {
    it('should close the current dialog when one is open', () => {
      // First open a dialog to set the dialogRef
      service['dialogRef'] = mockDialogRef;
      
      service.closeDialog();

      expect(mockDialogRef.close).toHaveBeenCalled();
      expect(service['dialogRef']).toBeNull();
    });

    it('should not throw error when no dialog is open', () => {
      service['dialogRef'] = null;
      
      expect(() => service.closeDialog()).not.toThrow();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });
});