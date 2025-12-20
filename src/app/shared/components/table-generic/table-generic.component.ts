import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableModule } from 'primeng/table';
import {
  ButtonConfig,
  ButtonGenericInterface,
  FormatOptions,
} from '../button-generic/interfaces/buttons';
import { HeaderTable } from './interfaces/header-table';
import { CommonModule } from '@angular/common';
import { ButtonGenericComponent } from '../button-generic/button-generic.component';
import { ButtonModule } from 'primeng/button';
import { DragDropModule } from 'primeng/dragdrop';

/**
 * Componente genérico para mostrar una tabla con funcionalidades avanzadas como paginación,
 * arrastrar y soltar filas, y botones de operaciones personalizados.
 *
 * @typeparam T - Tipo de los datos que se mostrarán en la tabla.
 */
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
  /** Opciones de paginación disponibles. */
  @Input() listPagination: number[] = [5, 10, 20];

  /** Número inicial de elementos por página. */
  @Input() itemInitialPagination = 5;

  /** Encabezados de la tabla. */
  @Input() headerData!: HeaderTable<T>[];

  /** Datos que se mostrarán en la tabla. */
  @Input() dataTable!: T[];

  /** Configuración de los botones de operaciones. */
  @Input() operation!: ButtonGenericInterface;

  /** Opciones de formato para los valores de la tabla. */
  @Input() formatOptions?: FormatOptions<T>;

  /** Habilita o deshabilita la funcionalidad de arrastrar y soltar filas. */
  @Input() enableDragDrop: boolean = false;

  /** Fila que está siendo arrastrada. */
  private draggedRow: T | null = null;

  /** Evento que se emite cuando se reordenan las filas. */
  @Output() reordered = new EventEmitter<T[]>();

  /**
   * Maneja el inicio del arrastre de una fila.
   *
   * @param row - Fila que se está arrastrando.
   */
  onDragStart(row: T): void {
    if (this.enableDragDrop) {
      this.draggedRow = row;
    }
  }

  /**
   * Maneja el evento de soltar una fila en una nueva posición.
   *
   * @param row - Fila en la que se soltó la fila arrastrada.
   */
  onDrop(row: T): void {
    if (this.enableDragDrop && this.draggedRow) {
      const draggedIndex = this.dataTable.indexOf(this.draggedRow);
      const dropIndex = this.dataTable.indexOf(row);

      this.dataTable = this.reorderArray(
        this.dataTable,
        draggedIndex,
        dropIndex
      );

      this.draggedRow = null;
      this.reordered.emit(this.dataTable);
    }
  }

  /**
   * Reordena un array moviendo un elemento de una posición a otra.
   *
   * @param array - Array a reordenar.
   * @param from - Índice del elemento a mover.
   * @param to - Índice de la posición destino.
   * @returns Nuevo array reordenado.
   */
  private reorderArray(array: T[], from: number, to: number): T[] {
    const newArray = [...array];
    const item = newArray.splice(from, 1)[0];
    // Type guard to ensure item is defined before using it
    if (item !== undefined) {
      newArray.splice(to, 0, item);
    }
    return newArray;
  }

  /**
   * Ejecuta la acción asociada a un botón de operación.
   *
   * @param op - Configuración del botón.
   * @param file - Fila sobre la que se ejecuta la acción.
   */

  handleOperation(op: ButtonConfig, file: T) {
    if (op.action) {
      op.action(file);
    }
  }

  /**
   * Determina si un botón de operación debe estar deshabilitado.
   *
   * @param op - Configuración del botón.
   * @param item - Fila sobre la que se evalúa la condición.
   * @returns `true` si el botón debe estar deshabilitado, `false` en caso contrario.
   */
  isDisabled(op: ButtonConfig, item: T): boolean {
    return (
      op.disabled ||
      (op.disabledDependsFunction ? op.disabledDependsFunction(item) : false)
    );
  }

  /**
   * Obtiene el valor formateado de una celda.
   *
   * @param key - Clave de la columna.
   * @param value - Valor de la fila.
   * @returns Valor formateado como cadena.
   */
  getFormattedValue(key: keyof T, value: T): string {
    const config = this.formatOptions?.[key];
    return config?.formatFunction
      ? config.formatFunction(value)
      : (value[key] as string);
  }

  /**
   * Determina si un botón de operación debe mostrarse.
   *
   * @param op - Configuración del botón.
   * @param otro - Fila sobre la que se evalúa la condición.
   * @returns `true` si el botón debe mostrarse, `false` en caso contrario.
   */
  showButtonOpeartion(op: ButtonConfig, otro: T): boolean {
    if (
      'hideDependsFunction' in op &&
      typeof op?.hideDependsFunction === 'function'
    ) {
      return op?.hideDependsFunction(otro) ? false : true;
    }
    return true;
  }

  /**
   * Obtiene la configuración de los botones de operación para una fila específica.
   *
   * @param op - Configuración del botón.
   * @param row - Fila sobre la que se generan los botones.
   * @returns Configuración de los botones.
   */
  getButtons(op: ButtonConfig, row: T): ButtonGenericInterface {
    // Valor por defecto para icono si es undefined
    const icon = op.icon ?? 'pi pi-question-circle'; // Icono por defecto

    return {
      buttons: [
        {
          id: op.id,
          icon: icon,
          label: op.label,
          severity: op.severity,
          disabled: this.isDisabled(op, row),
          rounded: op.rounded,
          text: op.text,
          outlined: op.outlined,
          raised: op.raised,
          size: op.size,
          styleClass: op.styleClass,
          tooltip: op.tooltip,
          tooltipPosition: op.tooltipPosition,
          action: () => {
            if (!this.isDisabled(op, row) && op.action) {
              op.action(row);
            }
          },
        },
      ],
    };
  }
}
