import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ContainInvoicesComponent } from './contain-invoices.component';
import { TableGenericComponent } from '../../../../../shared/components/table-generic/table-generic.component';
import { ButtonGenericComponent } from '../../../../../shared/components/button-generic/button-generic.component';
import { InvoicesStore } from '../../../../../store/app.store';
import { DataInvoicesTable } from '../../../interfaces/data-invoices-table';
import { DataInvoicesConstant } from '../../../constants/data-invoices';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormInvoicesDataComponent } from '../form-invoices-data/form-invoices-data.component';
import { CustomModalService } from '../../../../../shared/services/custom-modal/custom-modal.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { TranslateModule } from '@ngx-translate/core';

// Mocks
class MockInvoicesStore {
  getTableContain = jest.fn(() => [] as DataInvoicesTable[]);
  updateTable = jest.fn();
}

describe('ContainInvoicesComponent', () => {
  let component: ContainInvoicesComponent;
  let fixture: ComponentFixture<ContainInvoicesComponent>;
  let mockStore: MockInvoicesStore;
  let customModalService: jest.Mocked<CustomModalService>;
  let dialogRefMock: DynamicDialogRef;

  beforeEach(async () => {
    dialogRefMock = {
      close: jest.fn(),
      onClose: jest.fn((callback) => {
        callback({
          description: 'Test Item',
          qtt: 1,
          price: 100,
          perCentIva: { label: '21%', value: 21 },
          total: 100,
        });
      }),
    } as unknown as DynamicDialogRef;
    await TestBed.configureTestingModule({
      imports: [
        TableGenericComponent,
        ButtonGenericComponent,
        ContainInvoicesComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: InvoicesStore, useValue: new MockInvoicesStore() },
        {
          provide: CustomModalService,
          useValue: {
            open: jest.fn().mockReturnValue({ modalServiceRef: dialogRefMock }),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ContainInvoicesComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(InvoicesStore) as unknown as MockInvoicesStore;
    customModalService = TestBed.inject(
      CustomModalService
    ) as jest.Mocked<CustomModalService>;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty table if store is empty', () => {
    expect(component.rowTable.length).toBe(2);
    expect(component.rowTable[0]?.perCentIva).toBe(DataInvoicesConstant.IVA);
    expect(component.rowTable[1]?.perCentIva).toBe(DataInvoicesConstant.TOTAL);
  });

  it('should initialize with existing data from store', () => {
    mockStore.getTableContain.mockReturnValue([
      {
        id: '1',
        description: 'Test',
        total: 100,
        sTotal: 82.64,
        perCentIva: 21,
        indexDelete: 1,
      },
      {
        id: '',
        description: '',
        perCentIva: DataInvoicesConstant.IVA,
        total: 17.36,
        sTotal: 0,
      },
      {
        id: '',
        description: '',
        perCentIva: DataInvoicesConstant.TOTAL,
        total: 100,
        sTotal: 0,
      },
    ]);

    fixture = TestBed.createComponent(ContainInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.rowTable.length).toBe(3);
  });

  it('should hide delete button for IVA and TOTAL rows', () => {
    const ivaRow: DataInvoicesTable = {
      id: '',
      description: '',
      perCentIva: DataInvoicesConstant.IVA,
      total: 0,
      sTotal: 0,
    };
    const totalRow: DataInvoicesTable = {
      id: '',
      description: '',
      perCentIva: DataInvoicesConstant.TOTAL,
      total: 0,
      sTotal: 0,
    };
    const normalRow: DataInvoicesTable = {
      id: '1',
      description: 'Test',
      perCentIva: 21,
      total: 100,
      sTotal: 82.64,
      indexDelete: 1,
    };

    expect(component.hideLastRows(ivaRow)).toBe(true);
    expect(component.hideLastRows(totalRow)).toBe(true);
    expect(component.hideLastRows(normalRow)).toBe(false);
  });

  it('should delete a row and update sums', () => {
    component.rowTable = [
      {
        id: '1',
        description: 'Item 1',
        total: 100,
        sTotal: 82.64,
        perCentIva: 21,
        indexDelete: 1,
      },
      {
        id: '2',
        description: 'Item 2',
        total: 200,
        sTotal: 165.28,
        perCentIva: 21,
        indexDelete: 2,
      },
      {
        id: '',
        description: '',
        perCentIva: DataInvoicesConstant.IVA,
        total: 52.08,
        sTotal: 0,
      },
      {
        id: '',
        description: '',
        perCentIva: DataInvoicesConstant.TOTAL,
        total: 300,
        sTotal: 0,
      },
    ];

    jest.spyOn(component, 'updateFieldTableSumAllExcepIVA');

    component.deleteRow({ indexDelete: 1 } as DataInvoicesTable);

    expect(component.rowTable.length).toBe(3);
    expect(component.rowTable[0]?.description).toBe('Item 2');
    expect(component.updateFieldTableSumAllExcepIVA).toHaveBeenCalled();
  });

  it('should open dialog to add new item', fakeAsync(() => {
    component.show();
    tick();

    expect(customModalService.open).toHaveBeenCalledWith(
      FormInvoicesDataComponent,
      expect.objectContaining({
        title: 'invoices.table.modal_title',
        width: '800px',
        data: {},
      })
    );
    dialogRefMock.onClose;
    expect(component.rowTable.length).toBe(3);
  }));

  it('should calculate IVA and totals correctly when adding new item', fakeAsync(() => {
    component.rowTable = [
      {
        id: '',
        description: '',
        perCentIva: DataInvoicesConstant.IVA,
        total: 0,
        sTotal: 0,
      },
      {
        id: '',
        description: '',
        perCentIva: DataInvoicesConstant.TOTAL,
        total: 0,
        sTotal: 0,
      },
    ];

    // Verificamos que se llama a updateFieldTableSumAllExcepIVA en lugar de calculateValues
    jest.spyOn(component, 'updateFieldTableSumAllExcepIVA');

    component.show();
    tick();

    const newItem = component.rowTable[0];
    expect(newItem).toBeDefined();
    expect(newItem!.description).toBe('Test Item');
    expect(newItem!.total).toBe(100);
    expect(newItem!.sTotal).toBeCloseTo(82.64);
    expect(newItem!.perCentIva).toBe(21);
    expect(newItem!.total).toBe(100);

    expect(component.rowTable[1]?.perCentIva).toBe(DataInvoicesConstant.IVA);
    expect(component.rowTable[1]?.total).toBeCloseTo(17.36);
    expect(component.rowTable[2]?.perCentIva).toBe(DataInvoicesConstant.TOTAL);
    expect(component.rowTable[2]?.total).toBe(100);

    expect(component.updateFieldTableSumAllExcepIVA).toHaveBeenCalled();
  }));

  it('should update sums correctly', () => {
    component.rowTable = [
      {
        id: '1',
        description: 'Item 1',
        total: 100,
        sTotal: 82.64,
        perCentIva: 21,
      },
      {
        id: '2',
        description: 'Item 2',
        total: 200,
        sTotal: 165.28,
        perCentIva: 21,
      },
      {
        id: '',
        description: '',
        perCentIva: DataInvoicesConstant.IVA,
        total: 0,
        sTotal: 0,
      },
      {
        id: '',
        description: '',
        perCentIva: DataInvoicesConstant.TOTAL,
        total: 0,
        sTotal: 0,
      },
    ];

    component.updateFieldTableSumAllExcepIVA();

    expect(component.rowTable[2]?.total).toBeCloseTo(52.08);
    expect(component.rowTable[3]?.total).toBe(300);
  });

  it('should assign unique indexDelete values', () => {
    const testData: DataInvoicesTable[] = [
      {
        id: '1',
        description: 'Item 1',
        total: 100,
        sTotal: 82.64,
        perCentIva: 21,
        indexDelete: 1,
      },
      {
        id: '2',
        description: 'Item 2',
        total: 200,
        sTotal: 165.28,
        perCentIva: 21,
        indexDelete: 3,
      },
    ];

    const newItem = component.assingnIndexDeleteUltraOptimo(testData, {
      id: '3',
      description: 'Item 3',
      total: 0,
      sTotal: 0,
      perCentIva: 21,
    });

    expect(newItem.indexDelete).toBe(4);
  });

  it('should update store on destroy', () => {
    component.ngOnDestroy();
    expect(mockStore.updateTable).toHaveBeenCalledWith(component.rowTable);
  });

  it('should format table cells correctly', () => {
    const testData = {
      id: '1',
      description: 'Test',
      sTotal: 100,
      perCentIva: 21,
      total: 121,
    } as DataInvoicesTable;

    const sTotalFormatted =
      component.formatOptions.sTotal?.formatFunction?.(testData);
    expect(sTotalFormatted).toContain('€');

    const ivaFormatted =
      component.formatOptions.perCentIva?.formatFunction?.(testData);
    expect(ivaFormatted).toContain('%');

    const totalFormatted =
      component.formatOptions.total?.formatFunction?.(testData);
    expect(totalFormatted).toContain('€');

    const summaryRow = {
      id: '',
      description: '',
      perCentIva: DataInvoicesConstant.IVA,
      total: 21,
      sTotal: 0,
    } as DataInvoicesTable;
    const summaryFormatted =
      component.formatOptions.perCentIva?.formatFunction?.(summaryRow);
    expect(summaryFormatted).not.toContain('%');
  });
});
