export interface HeadeTable<T> {
  field: Extract<keyof T, string>;
  header: string;
}
