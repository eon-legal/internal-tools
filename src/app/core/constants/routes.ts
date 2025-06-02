import { MenuItem } from 'primeng/api';

export const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Imagen - PDF',
    icon: 'pi pi-home',
    routerLink: ['/'],
    expanded: false, // Estado inicial del ítem
    styleClass: '', // Clase CSS inicial
  },
  {
    label: 'PDF Merge',
    icon: 'pi pi-id-card',
    routerLink: ['/pdf-merge'],
  },
  {
    /*label: 'Reportes',
    icon: 'pi pi-chart-bar',
    expanded: false, // Estado inicial del ítem
    styleClass: '', // Clase CSS inicial
    items: [*/
    //{
    label: 'Facturas',
    icon: 'pi pi-chart-bar',
    routerLink: ['/invoices'],
    //},
    //],
  },
  {
    label: 'Destinarios',
    icon: 'pi pi-id-card',
    routerLink: ['/addressee'],
  },
];
