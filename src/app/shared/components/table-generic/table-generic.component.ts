import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ButtonOperation, FormatOptions } from '../../interfaces/buttons';

@Component({
  selector: 'app-table-generic',
  standalone: true,
  imports: [ButtonModule, TableModule],
  templateUrl: './table-generic.component.html',
  styleUrl: './table-generic.component.scss',
})
export class TableGenericComponent<T extends object> {
  listPagination = [5, 10, 20];
  @Input() headerData!: T;
  @Input() dataTable!: T[];
  @Input() operation: ButtonOperation<T>[] = [];
  @Input() formatOptions?: FormatOptions<T>;
  getHeaderKeys(headerData: T): (keyof T)[] {
    return Object.keys(headerData) as (keyof T)[];
  }
  getHeaderValue(headerData: T) {
    return Object.values(headerData);
  }
  getHeaderEntries(headerData: T) {
    return Object.entries(headerData);
  }
  handleOperation(op: ButtonOperation<T>, file: T) {
    op.action(file);
  }
  isDisabled(op: ButtonOperation<T>, item: T): boolean {
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
}
