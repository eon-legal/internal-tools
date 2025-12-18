import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableGenericComponent } from './table-generic.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DragDropModule } from 'primeng/dragdrop';
import { ButtonGenericComponent } from '../button-generic/button-generic.component';
import { CommonModule } from '@angular/common';
import { ButtonConfig, ButtonGenericInterface } from '../button-generic/interfaces/buttons';

interface User {
  id: number;
  name: string;
  active: boolean;
  email?: string;
}

describe('TableGenericComponent', () => {
  let component: TableGenericComponent<User>;
  let fixture: ComponentFixture<TableGenericComponent<User>>;

  const mockUsers: User[] = [
    { id: 1, name: 'John Doe', active: true, email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', active: false }
  ];

  const mockHeaders = [
    { header: 'ID', field: 'id' as keyof User },
    { header: 'Name', field: 'name' as keyof User },
    { header: 'Status', field: 'active' as keyof User },
    { header: 'Email', field: 'email' as keyof User }
  ];

  const baseButton: ButtonConfig = {
    id: 1,
    label: 'Test',
    action: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        DragDropModule,
        ButtonGenericComponent,
        TableGenericComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableGenericComponent<User>);
    component = fixture.componentInstance;

    // Initialize component inputs
    component.headerData = mockHeaders;
    component.dataTable = [...mockUsers];
    component.listPagination = [5, 10, 20];
    component.itemInitialPagination = 5;
    component.operation = { buttons: [] };
    component.enableDragDrop = false;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Table rendering', () => {
    it('should render table with headers and data', async () => {
      // Wait for Angular to finish rendering
      await fixture.whenStable();
      fixture.detectChanges();

      const table = fixture.nativeElement.querySelector('p-table');
      const headerCells = fixture.nativeElement.querySelectorAll('th');
      const dataRows = fixture.nativeElement.querySelectorAll('tbody tr');

      expect(table).toBeTruthy();
      // PrimeNG tables may add extra columns, so we check for at least our headers
      expect(headerCells.length).toBeGreaterThanOrEqual(mockHeaders.length);
      expect(dataRows.length).toBe(mockUsers.length);

      // Verify the content of the first data row
      if (dataRows.length > 0) {
        const firstRowCells = dataRows[0]!.querySelectorAll('td');
        expect(firstRowCells.length).toBeGreaterThanOrEqual(mockHeaders.length);
        expect(firstRowCells[0]!.textContent).toContain(mockUsers[0]!.id.toString());
      }
    });

    it('should not render table without headers', () => {
      component.headerData = [];
      fixture.detectChanges();
      
      const table = fixture.nativeElement.querySelector('p-table');
      expect(table).toBeFalsy();
    });
  });

  describe('Drag and Drop', () => {
    beforeEach(() => {
      component.enableDragDrop = true;
      fixture.detectChanges();
    });

    it('should reorder items when drag and drop is enabled', () => {
      const originalFirst = component.dataTable[0]!;
      component.onDragStart(originalFirst);
      component.onDrop(component.dataTable[1]!);

      expect(component.dataTable[0]?.id).toBe(2);
      expect(component.dataTable[1]?.id).toBe(1);
    });

    it('should emit reordered event after drop', () => {
      jest.spyOn(component.reordered, 'emit');
      component.onDragStart(component.dataTable[0]!);
      component.onDrop(component.dataTable[1]!);

      expect(component.reordered.emit).toHaveBeenCalledWith(component.dataTable);
    });

    it('should not reorder when drag and drop is disabled', () => {
      component.enableDragDrop = false;
      const originalOrder = [...component.dataTable];

      component.onDragStart(component.dataTable[0]!);
      component.onDrop(component.dataTable[1]!);

      expect(component.dataTable).toEqual(originalOrder);
    });
  });

  describe('Cell formatting', () => {
    it('should format values using formatFunction', () => {
      component.formatOptions = {
        active: {
          formatFunction: (value: User) => value.active ? '✅ Active' : '❌ Inactive'
        },
        email: {
          formatFunction: (value: User) => value.email || 'N/A'
        }
      };

      const activeFormatted = component.getFormattedValue('active', mockUsers[0]!);
      const emailFormatted = component.getFormattedValue('email', mockUsers[1]!);

      expect(activeFormatted).toBe('✅ Active');
      expect(emailFormatted).toBe('N/A');
    });

    it('should return raw value when no formatFunction is provided', () => {
      const nameFormatted = component.getFormattedValue('name', mockUsers[0]!);
      expect(nameFormatted).toBe('John Doe');
    });
  });

  describe('Operation buttons', () => {
    beforeEach(() => {
      component.operation = { buttons: [baseButton] };
      fixture.detectChanges();
    });

    it('should call action when button is clicked', () => {
      const mockAction = jest.fn();
      const testButton: ButtonConfig = {
        ...baseButton,
        action: mockAction
      };

      component.handleOperation(testButton, mockUsers[0]!);
      expect(mockAction).toHaveBeenCalledWith(mockUsers[0]!);
    });

    it('should disable button based on condition', () => {
      const disabledButton: ButtonConfig = {
        ...baseButton,
        disabledDependsFunction: (row: unknown) => !(row as User).active
      };

      const activeUserDisabled = component.isDisabled(disabledButton, mockUsers[0]!);
      const inactiveUserDisabled = component.isDisabled(disabledButton, mockUsers[1]!);

      expect(activeUserDisabled).toBe(false);
      expect(inactiveUserDisabled).toBe(true);
    });

    it('should hide button based on condition', () => {
      const hiddenButton: ButtonConfig = {
        ...baseButton,
        hideDependsFunction: (row: unknown) => !(row as User).active
      };

      const activeUserVisible = component.showButtonOpeartion(hiddenButton, mockUsers[0]!);
      const inactiveUserVisible = component.showButtonOpeartion(hiddenButton, mockUsers[1]!);

      expect(activeUserVisible).toBe(true);
      expect(inactiveUserVisible).toBe(false);
    });

    it('should return button config with default icon when not provided', () => {
      const buttonWithoutIcon: ButtonConfig = {
        ...baseButton,
        icon: undefined
      };

      const config = component.getButtons(buttonWithoutIcon, mockUsers[0]!);
      expect(config.buttons?.[0]?.icon).toBe('pi pi-question-circle');
    });

    it('should include custom icon when provided', () => {
      const customIconButton: ButtonConfig = {
        ...baseButton,
        icon: 'pi pi-check'
      };

      const config = component.getButtons(customIconButton, mockUsers[0]!);
      expect(config.buttons?.[0]?.icon).toBe('pi pi-check');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty data table', () => {
      component.dataTable = [];
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(0);
    });

    it('should handle undefined operation buttons', () => {
      component.operation = { buttons: undefined } as any;
      fixture.detectChanges();

      expect(() => {
        component.handleOperation(baseButton, mockUsers[0]!);
      }).not.toThrow();
    });

    it('should handle missing formatOptions', () => {
      component.formatOptions = undefined;
      const value = component.getFormattedValue('name', mockUsers[0]!);
      expect(value).toBe('John Doe');
    });

    it('should handle optional fields safely', () => {
      component.formatOptions = {
        email: {
          formatFunction: (value: User) => value.email?.toUpperCase() || 'NO EMAIL'
        }
      };

      const withEmail = component.getFormattedValue('email', mockUsers[0]!);
      const withoutEmail = component.getFormattedValue('email', mockUsers[1]!);

      expect(withEmail).toBe('JOHN@EXAMPLE.COM');
      expect(withoutEmail).toBe('NO EMAIL');
    });
  });
});