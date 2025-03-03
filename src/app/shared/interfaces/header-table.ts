/*export interface HeaderTable<T> {
  field: Extract<keyof T, string>;
  header: string;
}*/

import { TemplateRef } from "@angular/core";

export interface HeaderTable<T> {
  field: keyof T;
  header: string;
  content?: TemplateRef<any>; // Añadir soporte para templates
}