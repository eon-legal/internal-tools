export interface HeaderTable<T> {
  field: keyof T;
  header: string;
  customContent?: (item: T) => any; // Plantilla personalizada (opcional)
}