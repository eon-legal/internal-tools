import { ConfirmationService } from './confirmation.service';
import { ConfirmationComponent } from '../../components/confirmation/confirmation.component';
import { TestBed } from '@angular/core/testing';
import { CustomModalService } from '../custom-modal/custom-modal.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

describe('ConfirmationService', () => {
  let service: ConfirmationService;
  let customModalService: jest.Mocked<CustomModalService>;
  let dialogRefMock: DynamicDialogRef;
  beforeEach(() => {
    dialogRefMock = {
      close: jest.fn(),
      onClose: {
        subscribe: jest.fn(),
      },
    } as unknown as DynamicDialogRef;

    TestBed.configureTestingModule({
      providers: [
        ConfirmationService,
        {
          provide: CustomModalService,
          useValue: {
            open: jest.fn().mockReturnValue({ modalServiceRef: dialogRefMock }),
          },
        },
      ],
    });

    service = TestBed.inject(ConfirmationService);
    customModalService = TestBed.inject(
      CustomModalService
    ) as jest.Mocked<CustomModalService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call customDialogService.open with default message when no message is provided', () => {
    const result = service.openConfirmation();
    expect(customModalService.open).toHaveBeenCalledWith(
      ConfirmationComponent,
      expect.objectContaining({
        title: '',
        data: { message: '¿Estás seguro de que deseas realizar esta acción?' },
      })
    );
    //verificacion adiconal botones
    const call = customModalService.open.mock.calls[0];
    expect(call).toBeDefined();
    const buttonsConfig = call[1]?.buttons;
    expect(buttonsConfig).toBeDefined();
    expect(buttonsConfig?.css).toBe(
      'flex flex-column md:flex-row md:justify-content-between gap-2'
    );
    expect(buttonsConfig?.buttons?.length).toBe(2);
  });

  // Test 3: Llamada con mensaje personalizado (MODIFICADO)
  it('should call customModalService.open with custom message', () => {
    const customMessage = '¿Confirmas esta acción específica?';
    service.openConfirmation(customMessage);

    // Verificación específica solo para el mensaje
    expect(customModalService.open).toHaveBeenCalledWith(
      ConfirmationComponent,
      expect.objectContaining({
        data: { message: customMessage },
      })
    );
  });

  // Test 4: Retorno del DynamicDialogRef
  it('should return the DynamicDialogRef from customModalService.open', () => {
    const result = service.openConfirmation();
    expect(result).toBe(dialogRefMock);
  });

  // Tests para acciones de botones (igual que antes)
  describe('Button actions', () => {
    it('should close with false when Cancel button is clicked', () => {
      service.openConfirmation();
      const existButtons = customModalService.open.mock.calls[0][1]?.buttons;
      expect(existButtons).toBeDefined();
      expect(existButtons?.buttons).toHaveLength(2);
      expect(existButtons?.buttons?.[0]).toBeDefined();
      existButtons?.buttons?.[0]?.action?.();
      expect(dialogRefMock.close).toHaveBeenCalledWith(false);
    });

    it('should close with true when Accept button is clicked', () => {
      service.openConfirmation();
      const existButtons = customModalService.open.mock.calls[0][1]?.buttons;
      expect(existButtons).toBeDefined();
      expect(existButtons?.buttons).toHaveLength(2);
      expect(existButtons?.buttons?.[1]).toBeDefined();
      existButtons?.buttons?.[1]?.action?.();
      expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    });
  });
});
