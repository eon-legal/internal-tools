import { MenuItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

/**
 * Get menu items with translated labels.
 * This function should be called after TranslateService is initialized.
 *
 * @param translate - TranslateService instance
 * @returns Array of menu items with translated labels
 */
export function getMenuItems(translate: TranslateService): MenuItem[] {
  return [
    {
      label: translate.instant('menu.images_to_pdf'),
      icon: 'pi pi-home',
      routerLink: ['/'],
      expanded: false,
      styleClass: '',
    },
    {
      label: translate.instant('menu.pdf_merge'),
      icon: 'pi pi-file-pdf',
      routerLink: ['/pdf-merge'],
    },
    {
      label: translate.instant('menu.invoices'),
      icon: 'pi pi-chart-bar',
      routerLink: ['/invoices'],
    },
    {
      label: translate.instant('menu.addressee'),
      icon: 'pi pi-id-card',
      routerLink: ['/addressee'],
    },
  ];
}

/**
 * @deprecated Use getMenuItems(translate) instead for i18n support
 * This constant is kept for backward compatibility
 */
export const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Imagen - PDF',
    icon: 'pi pi-home',
    routerLink: ['/'],
    expanded: false,
    styleClass: '',
  },
  {
    label: 'Mezclar PDFs',
    icon: 'pi pi-file-pdf',
    routerLink: ['/pdf-merge'],
  },
  {
    label: 'Facturas',
    icon: 'pi pi-chart-bar',
    routerLink: ['/invoices'],
  },
  {
    label: 'Destinarios',
    icon: 'pi pi-id-card',
    routerLink: ['/addressee'],
  },
];
