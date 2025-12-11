import { Routes } from '@angular/router';
import { authGuard, noAuthGuard, registrationGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Authentication routes (no layout, no auth required)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/components/login/login.component').then(
        (m) => m.LoginComponent
      ),
    canActivate: [noAuthGuard],
    title: 'Sign In',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/components/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    canActivate: [noAuthGuard, registrationGuard],
    title: 'Register',
  },
  // Protected routes (with layout, auth required)
  {
    path: '',
    loadComponent: () =>
      import('./core/components/layout/layout.component').then(
        (m) => m.LayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/images-to-pdf/components/images-to-pdf/images-to-pdf.component'
          ).then((m) => m.ImagesToPdfComponent),
        title: 'Convertidor Imágenes a PDF',
      },
      {
        path: 'pdf-merge',
        loadComponent: () =>
          import(
            './features/pdf-merge/components/pdf-merge/pdf-merge.component'
          ).then((m) => m.PdfMergeComponent),
        title: 'Convertidor Imágenes a PDF',
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import(
            './features/invoices/components/invoice-history/invoice-history.component'
          ).then((m) => m.InvoiceHistoryComponent),
        title: 'Invoice History',
      },
      {
        path: 'invoices/create',
        loadComponent: () =>
          import(
            './features/invoices/components/stepper-invoices-generate-pdf/stepper-invoices-generate-pdf.component'
          ).then((m) => m.StepperInvoicesGeneratePdfComponent),
        title: 'Create Invoice',
      },
      {
        path: 'invoices/edit/:id',
        loadComponent: () =>
          import(
            './features/invoices/components/invoice-edit/invoice-edit.component'
          ).then((m) => m.InvoiceEditComponent),
        title: 'Edit Invoice',
      },
      {
        path: 'addressee',
        loadComponent: () =>
          import(
            './features/crud-addressee/components/crud-addressee.component'
          ).then((m) => m.CrudAddresseeComponent),
        title: 'Addressees',
      },
      {
        path: 'clients',
        loadComponent: () =>
          import(
            './features/clients/components/crud-clients/crud-clients.component'
          ).then((m) => m.CrudClientsComponent),
        title: 'Client Management',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
