import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableModule } from 'primeng/table';
import {
  ButtonConfig,
  ButtonGenericInterface,
  FormatOptions,
} from '../../interfaces/buttons';
import { HeaderTable } from '../../interfaces/header-table';
import { CommonModule } from '@angular/common';
import { ButtonGenericComponent } from '../button-generic/button-generic.component';
import { ButtonModule } from 'primeng/button';
import { DragDropModule } from 'primeng/dragdrop';

@Component({
  selector: 'app-table-generic',
  standalone: true,
  imports: [
    CommonModule,
    ButtonGenericComponent,
    TableModule,
    ButtonModule,
    DragDropModule,
  ],
  templateUrl: './table-generic.component.html',
  styleUrl: './table-generic.component.scss',
})
export class TableGenericComponent<T extends object> {
  @Input() listPagination: number[] = [5, 10, 20];
  @Input() itemInitialPagination = 5;
  @Input() headerData!: HeaderTable<T>[];
  @Input() dataTable!: T[];
  @Input() operation: ButtonGenericInterface;
  @Input() formatOptions?: FormatOptions<T>;
  // Input para habilitar o deshabilitar el drag and drop
  @Input() enableDragDrop: boolean = false;

  // Variable para almacenar la fila que se está arrastrando
  private draggedRow: T | null = null;
  @Output() reordered = new EventEmitter<T[]>(); // Emitir el orden actual de los elementos

  // Maneja el inicio del arrastre
  onDragStart(row: T): void {
    if (this.enableDragDrop) {
      this.draggedRow = row;
    }
  }

  // Maneja el evento de soltar
  onDrop(row: T): void {
    if (this.enableDragDrop && this.draggedRow) {
      // Encuentra los índices de las filas arrastrada y soltada
      const draggedIndex = this.dataTable.indexOf(this.draggedRow);
      const dropIndex = this.dataTable.indexOf(row);

      // Intercambia las filas en el array
      this.dataTable = this.reorderArray(
        this.dataTable,
        draggedIndex,
        dropIndex
      );

      // Reinicia la fila arrastrada
      this.draggedRow = null;
      // Emitir el nuevo orden de los elementos
      this.reordered.emit(this.dataTable);
    }
  }

  // Reordena el array
  private reorderArray(array: T[], from: number, to: number): T[] {
    const newArray = [...array];
    const item = newArray.splice(from, 1)[0];
    newArray.splice(to, 0, item);
    return newArray;
  }
  handleOperation(op: ButtonConfig, file: T) {
    op.action(file);
  }
  isDisabled(op: ButtonConfig, item: T): boolean {
    return (
      op.disabled ||
      (op.disabledDependsFunction ? op.disabledDependsFunction(item) : false)
    );
  }
  getFormattedValue(key: keyof T, value: T): string {
    const config = this.formatOptions?.[key];
    return config?.formatFunction
      ? config.formatFunction(value)
      : (value[key] as string);
  }
  showButtonOpeartion(op: ButtonConfig, otro: T): boolean {
    if (
      'hideDependsFunction' in op &&
      typeof op?.hideDependsFunction === 'function'
    ) {
      return op?.hideDependsFunction(otro) ? false : true;
    }
    return true;
  }

  getButtons(op: ButtonConfig, row: T): ButtonGenericInterface {
    return {
      buttons: [
        {
          id: op.id,
          icon: op.icon,
          label: op.label,
          severity: op.severity,
          disabled: this.isDisabled(op, row),
          action: () => (this.isDisabled(op, row) ? null : op.action(row)),
        },
      ],
    };
  }
}
