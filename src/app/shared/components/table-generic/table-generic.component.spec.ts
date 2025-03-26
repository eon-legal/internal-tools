import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableGenericComponent } from './table-generic.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DragDropModule } from 'primeng/dragdrop';
import { ButtonGenericComponent } from '../button-generic/button-generic.component';
import { CommonModule } from '@angular/common';

describe('TableGenericComponent', () => {
  let component: TableGenericComponent<any>;
  let fixture: ComponentFixture<TableGenericComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        DragDropModule,
        ButtonGenericComponent,
        TableGenericComponent, // Importa el componente standalone
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableGenericComponent);
    component = fixture.componentInstance;

    // Inicializa las propiedades de entrada
    component.headerData = []; // Inicializa con un array vacío
    component.dataTable = []; // Inicializa con un array vacío
    component.listPagination = [5, 10, 20]; // Inicializa con valores predeterminados
    component.itemInitialPagination = 5; // Inicializa con un valor predeterminado
    component.operation = { buttons: [] }; // Inicializa con un objeto vacío
    component.enableDragDrop = false; // Inicializa con un valor predeterminado

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the table when headerData has items', () => {
    // Configura los datos de entrada
    component.headerData = [{ header: 'Name', field: 'name' }];
    component.dataTable = [{ name: 'John Doe' }];
    fixture.detectChanges();

    // Verifica que la tabla se renderiza
    const table = fixture.nativeElement.querySelector('p-table');
    expect(table).toBeTruthy();
  });

  it('should not render the table when headerData is empty', () => {
    // Configura los datos de entrada
    component.headerData = [];
    component.dataTable = [{ name: 'John Doe' }];
    fixture.detectChanges();

    // Verifica que la tabla no se renderiza
    const table = fixture.nativeElement.querySelector('p-table');
    expect(table).toBeFalsy();
  });

  it('should reorder rows when drag and drop is enabled', () => {
    // Configura los datos de entrada
    component.headerData = [{ header: 'Name', field: 'name' }];
    component.dataTable = [{ name: 'John Doe' }, { name: 'Jane Doe' }];
    component.enableDragDrop = true;
    fixture.detectChanges();

    // Simula el arrastre y soltar de una fila
    const firstRow = component.dataTable[0];
    const secondRow = component.dataTable[1];
    component.onDragStart(firstRow);
    component.onDrop(secondRow);

    // Verifica que las filas se reordenaron
    expect(component.dataTable[0].name).toBe('Jane Doe');
    expect(component.dataTable[1].name).toBe('John Doe');
  });

  it('should format cell values correctly', () => {
    // Configura los datos de entrada
    component.headerData = [{ header: 'Name', field: 'name' }];
    component.dataTable = [{ name: 'John Doe' }];
    component.formatOptions = {
      name: {
        formatFunction: (value: any) => value.name.toUpperCase(),
      },
    };
    fixture.detectChanges();

    // Verifica que el valor de la celda está formateado
    const cellValue = component.getFormattedValue(
      'name',
      component.dataTable[0]
    );
    expect(cellValue).toBe('JOHN DOE');
  });

  it('should show operation buttons based on conditions', () => {
    // Configura los datos de entrada
    component.headerData = [{ header: 'Name', field: 'name' }];
    component.dataTable = [{ name: 'John Doe' }];
    component.operation = {
      buttons: [
        {
          id: 1,
          label: 'Edit',
          action: jest.fn(),
          hideDependsFunction: (row: any) => row.name === 'John Doe',
        },
      ],
    };
    fixture.detectChanges();

    // Verifica que el botón no se muestra
    const buttons =
      fixture.nativeElement.querySelectorAll('app-button-generic');
    expect(buttons.length).toBe(0);
  });

  it('should call the action function when an operation button is clicked', () => {
    // Configura los datos de entrada
    const mockAction = jest.fn();
    component.headerData = [{ header: 'Name', field: 'name' }];
    component.dataTable = [{ name: 'John Doe' }];
    component.operation = {
      buttons: [
        {
          id: 1,
          label: 'Edit',
          action: mockAction,
        },
      ],
    };
    fixture.detectChanges();

    // Simula el clic en el botón
    component.handleOperation(
      component.operation.buttons[0],
      component.dataTable[0]
    );

    // Verifica que la función action se llamó
    expect(mockAction).toHaveBeenCalledWith(component.dataTable[0]);
  });
});
