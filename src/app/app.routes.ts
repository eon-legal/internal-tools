import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/components/layout/layout.component').then(
        (m) => m.LayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/home/home.component').then(
            (m) => m.HomeComponent
          ),
        title: 'Convertidor Imágenes a PDF',
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import(
            './components/invoices/invoices-type-one/invoices-type-one.component'
          ).then((m) => m.InvoicesTypeOneComponent),
        title: 'Convertidor Imágenes a PDF',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'images-pdf',
    pathMatch: 'full',
  },
];
