import { Component, inject, ViewChild } from '@angular/core';
import { InvoicesSenderFormComponent } from '../invoices-sender-form/invoices-sender-form.component';
import { ContainInvoicesComponent } from '../table-invoices/contain-invoices/contain-invoices.component';
import { InvoicesDestinationFormComponent } from '../invoices-destination-form/invoices-destination-form.component';
import { StepInterface } from '../../../shared/interfaces/stepper';
import { DataInvoicesConstant } from '../constants/data-invoices';
import { ToastrService } from 'ngx-toastr';
import { ThemeService } from '../../../core/services/theme.service';
import { CreateInvoicePdfService } from '../services/create-invoice-pdf.service';
import { InvoicesStore } from '../../../store/app.component.store';
import { StepperModule } from 'primeng/stepper';
import { StepperContextComponent } from '../../../shared/components/stepper-context/stepper-context.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-stepper-invoices-generate-pdf',
  standalone: true,
  imports: [
    StepperModule,
    InvoicesSenderFormComponent,
    ContainInvoicesComponent,
    InvoicesDestinationFormComponent,
    StepperContextComponent,
    ButtonModule,
  ],
  templateUrl: './stepper-invoices-generate-pdf.component.html',
  styleUrl: './stepper-invoices-generate-pdf.component.scss',
})
export class StepperInvoicesGeneratePdfComponent {
  data = 1;
  readonly store = inject(InvoicesStore);
  nameStepOne = 'Remitente Factura';
  nameStepTwo = 'Tabla Factura';
  nameStepThree = 'Destinario - Generar Factura';
  stepper: StepInterface[] = [
    {
      css: 'flex flex-column md:flex-row md:justify-content-between gap-2',
      buttons: [
        {
          id: 1,
          label: 'Limpiar Todo',
          icon: 'pi pi-times',
          severity: 'warn',
          iconPos: 'right',
          onClick: () => this.cleanDataStep(),
        },
        {
          id: 2,
          label: 'Siguiente',
          icon: 'pi pi-arrow-right',
          iconPos: 'right',
          onClick: () => {
            this.data = 2;
          },
        },
      ],
    },
    {
      css: 'flex flex-column md:flex-row md:justify-content-between gap-2',
      buttons: [
        {
          id: 3,
          label: 'Atrás',
          severity: 'secondary',
          icon: 'pi pi-arrow-left',
          onClick: () => {
            this.data = 1;
          },
        },
        {
          id: 4,
          label: 'Siguiente',
          icon: 'pi pi-arrow-right',
          iconPos: 'right',
          onClick: () => {
            this.data = 3;
          },
        },
      ],
    },
    {
      css: 'flex flex-column md:flex-row md:justify-content-between gap-2',
      buttons: [
        {
          id: 5,
          label: 'Atrás',
          severity: 'secondary',
          icon: 'pi pi-arrow-left',
          onClick: () => {
            this.data = 2;
          },
        },
        {
          id: 6,
          label: 'Generar Factura',
          icon: 'pi pi-file-pdf',
          iconPos: 'right',
          onClick: () => this.notAllowedShowPdf(),
        },
      ],
    },
  ];
  @ViewChild('step1')
  step1!: InvoicesSenderFormComponent;
  @ViewChild('step3')
  step3!: InvoicesDestinationFormComponent;
  activeStep: number = 1;
  toastr: ToastrService = inject(ToastrService);
  themeService: ThemeService = inject(ThemeService);
  createInvoicePdfService: CreateInvoicePdfService = inject(
    CreateInvoicePdfService
  );

  notAllowedShowPdf() {
    this.askHaveDataTableCreate();
    const isValidFirstForm = this.store.getIsValidFirstForm();
    const isValidSecondForm = this.store.getIsValidSecondForm();
    const messages = 'Deben ser válidos los formularios del paso 1.';
    if (
      !isValidFirstForm ||
      (!isValidSecondForm &&
        !this.step3.formDestinationGenericComponent.formValid())
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
      if (this.step3.formDestinationGenericComponent.formValid())
        second =
          this.step3.formDestinationGenericComponent.getDataFormComplete();
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
    this.step1.changeData(this.store.getFirstForm());
  }

  ngOnDestroy() {
    this.store.resetTableInvoices();
    this.store.resetInvoices();
  }
}
