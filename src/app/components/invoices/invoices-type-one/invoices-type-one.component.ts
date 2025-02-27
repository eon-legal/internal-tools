import { Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { InvoicesSenderFormComponent } from '../invoices-sender-form/invoices-sender-form.component';
import { InvoicesDestinationFormComponent } from '../invoices-destination-form/invoices-destination-form.component';
import { StepsModule } from 'primeng/steps';
import { InvoicesStore } from '../../../app.component.store';
import { ContainInvoicesComponent } from '../table-invoices/contain-invoices/contain-invoices.component';

@Component({
  selector: 'app-invoices-type-one',
  standalone: true,
  imports: [
    InvoicesSenderFormComponent,
    InvoicesDestinationFormComponent,
    ContainInvoicesComponent,
    StepperModule,
    StepsModule,
    ButtonModule,
  ],
  templateUrl: './invoices-type-one.component.html',
  styleUrl: './invoices-type-one.component.scss',
})
export class InvoicesTypeOneComponent implements OnDestroy {
  readonly store = inject(InvoicesStore);
  @ViewChild('invoicesSenderFormComponent')
  invoicesSenderFormComponent!: InvoicesSenderFormComponent;
  @ViewChild('invoicesDestinationFormComponent')
  invoicesDestinationFormComponent!: InvoicesDestinationFormComponent;
  activeStep: number = 1;

  onActiveIndexChange(event: number) {
    this.activeStep = event;
  }

  cleanDataStep() {
    this.store.resetInvoices();
    this.store.resetTableInvoices();
    this.invoicesSenderFormComponent.changeData(this.store.getFirstForm());
  }
  generateAvoices() {}

  ngOnDestroy() {
    this.store.resetTableInvoices();
    this.store.resetInvoices();
  }
}
