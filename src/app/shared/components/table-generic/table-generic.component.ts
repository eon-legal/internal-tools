import { Component, Input } from '@angular/core';
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

@Component({
  selector: 'app-table-generic',
  standalone: true,
  imports: [CommonModule, ButtonGenericComponent, TableModule, ButtonModule],
  templateUrl: './table-generic.component.html',
  styleUrl: './table-generic.component.scss',
})
export class TableGenericComponent<T extends object> {
  listPagination = [5, 10, 20];
  @Input() headerData!: HeaderTable<T>[];
  @Input() dataTable!: T[];
  @Input() operation: ButtonGenericInterface;
  @Input() formatOptions?: FormatOptions<T>;
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
