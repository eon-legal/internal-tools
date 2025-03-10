import {
  AfterViewInit,
  Component,
  effect,
  inject,
  signal,
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
  // Señal para el paso activo
  data = signal(1);
  // Arreglo único de botones
  private allButtons: ButtonConfig[] = [
    {
      id: 1,
      label: 'Limpiar Todo',
      icon: 'pi pi-times',
      severity: 'warn',
      iconPos: 'right',
      action: () => this.cleanDataStep(),
      hideDependsFunction: (step: number) => step === 1, // Solo hideDependsFunction en el paso 1
    },
    {
      id: 2,
      label: 'Siguiente',
      icon: 'pi pi-arrow-right',
      iconPos: 'right',
      action: () => {
        this.data.set(2);
      },
      hideDependsFunction: (step: number) => step === 1, // Solo hideDependsFunction en el paso 1
    },
    {
      id: 3,
      label: 'Atrás',
      severity: 'secondary',
      icon: 'pi pi-arrow-left',
      action: () => {
        this.data.set(1);
      },
      hideDependsFunction: (step: number) => step === 2, // Solo hideDependsFunction en el paso 2
    },
    {
      id: 4,
      label: 'Siguiente',
      icon: 'pi pi-arrow-right',
      iconPos: 'right',
      action: () => {
        this.data.set(3);
      },
      hideDependsFunction: (step: number) => step === 2, // Solo hideDependsFunction en el paso 2
    },
    {
      id: 5,
      label: 'Atrás',
      severity: 'secondary',
      icon: 'pi pi-arrow-left',
      action: () => {
        this.data.set(2);
      },
      hideDependsFunction: (step: number) => step === 3, // Solo hideDependsFunction en el paso 3
    },
    {
      id: 6,
      label: 'Generar Factura',
      icon: 'pi pi-file-pdf',
      iconPos: 'right',
      action: () => this.notAllowedShowPdf(),
      hideDependsFunction: (step: number) => step === 3, // Solo hideDependsFunction en el paso 3
    },
  ];
  // Señal para los botones
  buttons = signal<ButtonConfig[]>(this.getVisibleButtons(this.data()));
  // Interfaz para el stepper
  stepper: ButtonGenericInterface = {
    css: 'flex flex-column md:flex-row md:justify-content-between gap-2',
    buttons: this.buttons(), // Usamos la señal de botones
  };
  // Nombres de los pasos
  nameStepOne = 'Remitente Factura';
  nameStepTwo = 'Tabla Factura';
  nameStepThree = 'Destinatario - Generar Factura';
  // Servicios inyectados
  readonly store = inject(InvoicesStore);
  toastr: ToastrService = inject(ToastrService);
  themeService: ThemeService = inject(ThemeService);
  createInvoicePdfService: CreateInvoicePdfService = inject(
    CreateInvoicePdfService
  );
  // Referencias a los componentes dinámicos
  componentRefs: { [key: number]: any } = {};

  constructor() {
    // Reaccionar a cambios en `data()` para actualizar los botones
    effect(
      () => {
        this.buttons.set(this.getVisibleButtons(this.data())); // Actualizar los botones
        this.stepper.buttons = this.buttons(); // Actualizar el stepper
        this.updateCurrentComponent(); // Actualizar el componente dinámico
      },
      { allowSignalWrites: true } // Habilitar escritura en señales
    );
  }

  // Método para renderizar el componente inicial al cargar la página
  ngAfterViewInit() {
    this.updateCurrentComponent();
  }

  // Función para obtener los botones visibles según el paso activo
  private getVisibleButtons(step: number): ButtonConfig[] {
    return this.allButtons.filter((button) => button.hideDependsFunction(step));
  }

  // Método para manejar el cambio de paso
  onStepChange(newValue: number) {
    this.data.set(newValue); // Actualizamos la señal
  }

  // Método para actualizar el componente dinámico
  private updateCurrentComponent() {
    this.container.clear(); // Limpiar el contenedor antes de renderizar

    // Obtener el componente correspondiente al paso actual
    const component =
      stepComponents[this.data()] || InvoicesSenderFormComponent;

    // Crear el componente dinámicamente
    const componentRef = this.container.createComponent(component);

    // Almacenar la referencia del componente
    this.componentRefs[this.data()] = componentRef.instance;
  }

  // Método para limpiar los datos del paso
  cleanDataStep() {
    this.store.resetInvoices();
    this.store.resetTableInvoices();
    const step1 = this.componentRefs[1] as InvoicesSenderFormComponent;
    step1.changeData(this.store.getFirstForm());
  }

  // Método para validar y generar el PDF
  notAllowedShowPdf() {
    this.askHaveDataTableCreate();

    // Verificar si step3 está definido
    if (this.data() !== 3 || !this.componentRefs[3]) {
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

  // Método para asegurarse de que haya datos en la tabla
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

  // Método para limpiar los datos al destruir el componente
  ngOnDestroy() {
    this.store.resetTableInvoices();
    this.store.resetInvoices();
  }
}
