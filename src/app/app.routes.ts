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
          import(
            './modules/images-to-pdf/components/images-to-pdf/images-to-pdf.component'
          ).then((m) => m.ImagesToPdfComponent),
        title: 'Convertidor Imágenes a PDF',
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import(
            './modules/invoices/components/stepper-invoices-generate-pdf/stepper-invoices-generate-pdf.component'
          ).then((m) => m.StepperInvoicesGeneratePdfComponent),
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
