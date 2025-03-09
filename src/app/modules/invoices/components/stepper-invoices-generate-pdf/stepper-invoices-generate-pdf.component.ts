import {
  AfterViewInit,
  Component,
  inject,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { InvoicesSenderFormComponent } from '../invoices-sender-form/invoices-sender-form.component';
import { ContainInvoicesComponent } from '../table-invoices/contain-invoices/contain-invoices.component';
import { InvoicesDestinationFormComponent } from '../invoices-destination-form/invoices-destination-form.component';
import { ToastrService } from 'ngx-toastr';
import { CreateInvoicePdfService } from '../services/create-invoice-pdf.service';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { StepperContextComponent } from '../../../../shared/components/stepper-context/stepper-context.component';
import { InvoicesStore } from '../../../../store/app.component.store';
import { ThemeService } from '../../../../core/services/theme.service';
import { DataInvoicesConstant } from '../../constants/data-invoices';
import {
  ButtonConfig,
  ButtonGenericInterface,
} from '../../../../shared/interfaces/buttons';

// Diccionario de componentes
const stepComponents: { [key: number]: any } = {
  1: InvoicesSenderFormComponent,
  2: ContainInvoicesComponent,
  3: InvoicesDestinationFormComponent,
};

@Component({
  selector: 'app-stepper-invoices-generate-pdf',
  standalone: true,
  imports: [CommonModule, StepperModule, StepperContextComponent, ButtonModule],
  templateUrl: './stepper-invoices-generate-pdf.component.html',
  styleUrl: './stepper-invoices-generate-pdf.component.scss',
})
export class StepperInvoicesGeneratePdfComponent implements AfterViewInit {
  @ViewChild('dynamicComponent', { read: ViewContainerRef, static: false })
  container!: ViewContainerRef;
  private _data = 1; // Paso activo
  get data(): number {
    return this._data;
  }
  set data(value: number) {
    this._data = value;
    this.updateCurrentComponent(); // Actualizar el componente cuando cambia el paso
  }
  readonly store = inject(InvoicesStore);
  nameStepOne = 'Remitente Factura';
  nameStepTwo = 'Tabla Factura';
  nameStepThree = 'Destinario - Generar Factura';
  indexOne: ButtonConfig[] = [
    {
      id: 1,
      label: 'Limpiar Todo',
      icon: 'pi pi-times',
      severity: 'warn',
      iconPos: 'right',
      action: () => this.cleanDataStep(),
    },
    {
      id: 2,
      label: 'Siguiente',
      icon: 'pi pi-arrow-right',
      iconPos: 'right',
      action: () => {
        this.data = 2;
      },
    },
  ];

  stepper: ButtonGenericInterface = {
    css: 'flex flex-column md:flex-row md:justify-content-between gap-2',
    buttons: this.indexOne,
  };

  indexTwo: ButtonConfig[] = [
    {
      id: 3,
      label: 'Atrás',
      severity: 'secondary',
      icon: 'pi pi-arrow-left',
      action: () => {
        this.data = 1;
      },
    },
    {
      id: 4,
      label: 'Siguiente',
      icon: 'pi pi-arrow-right',
      iconPos: 'right',
      action: () => {
        this.data = 3;
      },
    },
  ];


  indexThree: ButtonConfig[] = [
    {
      id: 5,
      label: 'Atrás',
      severity: 'secondary',
      icon: 'pi pi-arrow-left',
      action: () => {
        this.data = 2;
      },
    },
    {
      id: 6,
      label: 'Generar Factura',
      icon: 'pi pi-file-pdf',
      iconPos: 'right',
      action: () => this.notAllowedShowPdf(),
    },
  ];

  
  componentRefs: { [key: number]: any } = {};

  activeStep: number = 1;
  toastr: ToastrService = inject(ToastrService);
  themeService: ThemeService = inject(ThemeService);
  createInvoicePdfService: CreateInvoicePdfService = inject(
    CreateInvoicePdfService
  );

  private updateCurrentComponent() {
    this.container.clear(); // Limpiar el contenedor antes de renderizar

    // Obtener el componente correspondiente al paso actual
    const component = stepComponents[this.data] || InvoicesSenderFormComponent;

    // Crear el componente dinámicamente
    const componentRef = this.container.createComponent(component);

    // Almacenar la referencia del componente
    this.componentRefs[this.data] = componentRef.instance;
    switch (this.data) {
      case 1:
        this.stepper.buttons = this.indexOne;
        break;
      case 2:
        this.stepper.buttons = this.indexTwo;
        break;
      case 3:
        this.stepper.buttons = this.indexThree;
        break;
    }
  }

  ngAfterViewInit() {
    this.updateCurrentComponent(); // Renderizar el componente inicial al cargar la página
  }
  notAllowedShowPdf() {
    this.askHaveDataTableCreate();
    // Verificar si step3 está definido
    if (this.data !== 3 || !this.componentRefs[3]) {
      return;
    }

    const step3 = this.componentRefs[3] as InvoicesDestinationFormComponent;

    const isValidFirstForm = this.store.getIsValidFirstForm();
    const isValidSecondForm = this.store.getIsValidSecondForm();
    const messages = 'Deben ser válidos los formularios del paso 1.';

    if (!isValidFirstForm || (!isValidSecondForm && !step3.isValidForm())) {
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
      if (step3.isValidForm())
        second = step3.formDestinationGenericComponent.getDataFormComplete();
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
    const step1 = this.componentRefs[1] as InvoicesSenderFormComponent;
    step1.changeData(this.store.getFirstForm());
  }

  ngOnDestroy() {
    this.store.resetTableInvoices();
    this.store.resetInvoices();
  }
}
