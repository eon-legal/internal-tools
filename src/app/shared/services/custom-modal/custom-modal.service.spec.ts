import { CustomModalService } from './custom-modal.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AppModalContainerComponent } from '../../components/app-modal-container/app-modal-container.component';
import { TestBed } from '@angular/core/testing';
import { TEXT_ERROR_SERVICE } from './constant/text-error-service';

// Mock for DialogService
const mockDialogService = {
  open: jest.fn().mockReturnValue({
    close: jest.fn(),
    onClose: {
      subscribe: jest.fn(),
    },
  } as unknown as DynamicDialogRef),
};

// Mock test component
class TestComponent {}

describe('CustomModalService', () => {
  let service: CustomModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CustomModalService,
        { provide: DialogService, useValue: mockDialogService },
      ],
    });

    service = TestBed.inject(CustomModalService);
    jest.clearAllMocks();
  });

  xit('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('open', () => {
    it('should throw error if no component is provided', () => {
      expect(() => service.open(null as any)).toThrowError(TEXT_ERROR_SERVICE);
    });

    it('should open the modal with default configuration', () => {
      const result = service.open(TestComponent);

      expect(mockDialogService.open).toHaveBeenCalledWith(
        AppModalContainerComponent,
        {
          header: undefined,
          focusOnShow: false,
          modal: true,
          closable: true,
          width: '50vw',
          contentStyle: {
            'max-height': '90vh',
            overflow: 'auto',
          },
          data: {
            component: TestComponent,
            config: {
              closable: true,
              registerInstance: expect.any(Function),
            },
          },
        }
      );

      expect(result).toHaveProperty('modalRef');
      expect(result).toHaveProperty('modalServiceRef');
    });

    it('should open the modal with custom configuration', () => {
      const config: any = {
        title: 'Test Title',
        width: '80vw',
        closable: false,
        data: { test: 'data' },
      };

      const result = service.open(TestComponent, config);

      expect(mockDialogService.open).toHaveBeenCalledWith(
        AppModalContainerComponent,
        {
          header: 'Test Title',
          focusOnShow: false,
          modal: true,
          closable: true,
          width: '80vw',
          contentStyle: {
            'max-height': '90vh',
            overflow: 'auto',
          },
          data: {
            component: TestComponent,
            config: {
              ...config,
              closable: false,
              registerInstance: expect.any(Function),
            },
          },
        }
      );
    });

    it('should return a ModalRef with correct functions', () => {
      const { modalServiceRef } = service.open(TestComponent);

      // Test close function
      modalServiceRef.close('test result');
      expect(mockDialogService.open().close).toHaveBeenCalledWith(
        'test result'
      );

      // Test onClose function
      const callback = jest.fn();
      modalServiceRef.onClose(callback);
      expect(mockDialogService.open().onClose.subscribe).toHaveBeenCalledWith(
        callback
      );

      // Test getInstance function
      const instance = modalServiceRef.getInstance();
      expect(instance).toBeUndefined();
    });

    it('should register and return the component instance', () => {
      const { modalServiceRef } = service.open(TestComponent);
      const mockInstance = new TestComponent();

      // Get the registerInstance function from the mock
      const registerInstance =
        mockDialogService.open.mock.calls[0][1].data.config.registerInstance;
      registerInstance(mockInstance);

      expect(modalServiceRef.getInstance()).toBe(mockInstance);
    });

    it('should assign data to the instance when getInstance is called', () => {
      const config = {
        data: { prop1: 'value1', prop2: 'value2' },
      };

      const { modalServiceRef } = service.open(TestComponent, config);
      const mockInstance = { prop1: '', prop2: '' };

      const registerInstance =
        mockDialogService.open.mock.calls[0][1].data.config.registerInstance;
      registerInstance(mockInstance);

      const instance = modalServiceRef.getInstance();

      expect(instance).toEqual({
        prop1: 'value1',
        prop2: 'value2',
      });
    });
  });
});
