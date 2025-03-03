import { Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InvoicesSenderFormComponent } from '../invoices-sender-form/invoices-sender-form.component';
import { InvoicesDestinationFormComponent } from '../invoices-destination-form/invoices-destination-form.component';
import { InvoicesStore } from '../../../store/app.component.store';
import { ContainInvoicesComponent } from '../table-invoices/contain-invoices/contain-invoices.component';
import { MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { ToastrService } from 'ngx-toastr';
import { DataInvoicesConstant } from '../constants/data-invoices';
import { ThemeService } from '../../../core/services/theme.service';
import { CreateInvoicePdfService } from '../services/create-invoice-pdf.service';
import { StepperModule } from 'primeng/stepper';

@Component({
  selector: 'app-invoices-type-one',
  standalone: true,
  imports: [
    InvoicesSenderFormComponent,
    InvoicesDestinationFormComponent,
    ContainInvoicesComponent,
    StepperModule,
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
  themeService: ThemeService = inject(ThemeService);
  createInvoicePdfService: CreateInvoicePdfService = inject(
    CreateInvoicePdfService
  );

  nameStepOne = 'Remitente Factura';
  nameStepTwo = 'Tabla Factura';
  nameStepThree = 'Destinario - Generar Factura';

  notAllowedShowPdf() {
    this.askHaveDataTableCreate();
    const isValidFirstForm = this.store.getIsValidFirstForm();
    const isValidSecondForm = this.store.getIsValidSecondForm();
    const messages = 'Deben ser válidos los formularios del paso 1.';
    if (
      !isValidFirstForm ||
      (!isValidSecondForm &&
        !this.invoicesDestinationFormComponent.formDestinationGenericComponent.formValid())
    ) {
      this.store.updateAllMarkFieldForm(true);
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
      this.createInvoicePdfService.newGeneratePDFInvoices(
        [first.name, first.national ? first.address : first.passport],
        second,
        first,
        table
      );
    }
  }

  askHaveDataTableCreate() {
    let rowTable = this.store.getTableContain();
    if (!rowTable.length) {
      rowTable.push({
        id: '',
        description: '',
        sTotal: '',
        perCentIva: DataInvoicesConstant.IVA,
        total: 0,
      });
      rowTable.push({
        id: '',
        description: '',
        sTotal: '',
        perCentIva: DataInvoicesConstant.TOTAL,
        total: 0,
      });
      this.store.updateTable(rowTable);
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
