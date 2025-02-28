import { Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { InvoicesSenderFormComponent } from '../invoices-sender-form/invoices-sender-form.component';
import { InvoicesDestinationFormComponent } from '../invoices-destination-form/invoices-destination-form.component';
import { StepsModule } from 'primeng/steps';
import { InvoicesStore } from '../../../app.component.store';
import { ContainInvoicesComponent } from '../table-invoices/contain-invoices/contain-invoices.component';
import { MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { ToastrService } from 'ngx-toastr';
import { newGeneratePDFInvoices } from '../utils/new-pdf';

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
    MessagesModule,
  ],
  templateUrl: './invoices-type-one.component.html',
  styleUrl: './invoices-type-one.component.scss',
  providers: [MessageService],
})
export class InvoicesTypeOneComponent implements OnDestroy {
  readonly store = inject(InvoicesStore);
  @ViewChild('invoicesSenderFormComponent')
  invoicesSenderFormComponent!: InvoicesSenderFormComponent;
  @ViewChild('invoicesDestinationFormComponent')
  invoicesDestinationFormComponent!: InvoicesDestinationFormComponent;
  activeStep: number = 1;
  messageService: MessageService = inject(MessageService);
  toastr: ToastrService = inject(ToastrService);

  notAllowedShowPdf() {
    const isValidFirstForm = this.store.getIsValidFirstForm();
    const isValidSecondForm = this.store.getIsValidSecondForm();
    const messages = 'Deben ser válidos los formularios del paso 1.';
    if (
      !isValidFirstForm ||
      (!isValidSecondForm &&
        !this.invoicesDestinationFormComponent.formDestinationGenericComponent.formValid())
    ) {
      this.toastr.error(
        !isValidFirstForm
          ? messages
          : 'Deben ser válidos los formularios del paso 3.',
        'Error'
      );
    } else {
      const first = this.store.getFirstForm();
      let second = this.store.getSeconfForm();
      const table = this.store.getTableContain();
      if (
        this.invoicesDestinationFormComponent.formDestinationGenericComponent.formValid()
      )
        second =
          this.invoicesDestinationFormComponent.formDestinationGenericComponent.getDataFormComplete();
      newGeneratePDFInvoices(
        [first.name, first.national ? first.address : first.passport],
        second,
        first,
        table
      );
    }
  }

  onActiveIndexChange(event: number) {
    this.activeStep = event;
  }

  cleanDataStep() {
    this.store.resetInvoices();
    this.store.resetTableInvoices();
    this.invoicesSenderFormComponent.changeData(this.store.getFirstForm());
  }

  ngOnDestroy() {
    this.store.resetTableInvoices();
    this.store.resetInvoices();
  }
}
