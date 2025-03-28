import {
  AfterViewInit,
  Component,
  effect,
  inject,
  signal,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ContainInvoicesComponent } from '../table-invoices/contain-invoices/contain-invoices.component';
import { InvoicesDestinationFormComponent } from '../invoices-destination-form/invoices-destination-form.component';
import { ToastrService } from 'ngx-toastr';
import { CreateInvoicePdfService } from '../../services/create-invoice-pdf.service';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { StepperContextComponent } from '../../../../shared/components/stepper-context/stepper-context.component';
import { InvoicesStore } from '../../../../store/app.store';
import { DataInvoicesConstant } from '../../constants/data-invoices';
import {
  ButtonConfig,
  ButtonGenericInterface,
} from '../../../../shared/components/button-generic/interfaces/buttons';
import { InvoicesSenderFormComponent } from '../invoices-sender-form/invoices-sender-form.component';
import { DataInvoicesTable } from '../../interfaces/data-invoices-table';

/** Dictionary of components for each step */
const stepComponents: { [key: number]: any } = {
  1: InvoicesSenderFormComponent, // Step 1: Sender form
  2: ContainInvoicesComponent, // Step 2: Invoice table
  3: InvoicesDestinationFormComponent, // Step 3: Destination form
};

@Component({
  selector: 'app-stepper-invoices-generate-pdf',
  standalone: true,
  imports: [CommonModule, StepperModule, StepperContextComponent, ButtonModule],
  templateUrl: './stepper-invoices-generate-pdf.component.html',
  styleUrl: './stepper-invoices-generate-pdf.component.scss',
})
export class StepperInvoicesGeneratePdfComponent implements AfterViewInit {
  /** Reference to the container where dynamic components are rendered */
  @ViewChild('dynamicComponent', { read: ViewContainerRef, static: false })
  container!: ViewContainerRef;

  /** Signal to track the active step */
  data = signal(1);

  /** Array of all buttons for the stepper */
  private allButtons: ButtonConfig[] = [
    {
      id: 1,
      label: 'Limpiar Todo',
      icon: 'pi pi-times',
      severity: 'warn',
      iconPos: 'right',
      action: () => this.cleanDataStep(), // Action to clear all data
      hideDependsFunction: (step: number) => step === 1, // Only visible in step 1
    },
    {
      id: 2,
      label: 'Siguiente',
      icon: 'pi pi-arrow-right',
      iconPos: 'right',
      action: () => {
        this.data.set(2); // Move to step 2
      },
      hideDependsFunction: (step: number) => step === 1, // Only visible in step 1
    },
    {
      id: 3,
      label: 'Atrás',
      severity: 'secondary',
      icon: 'pi pi-arrow-left',
      action: () => {
        this.data.set(1); // Move back to step 1
      },
      hideDependsFunction: (step: number) => step === 2, // Only visible in step 2
    },
    {
      id: 4,
      label: 'Siguiente',
      icon: 'pi pi-arrow-right',
      iconPos: 'right',
      action: () => {
        this.data.set(3); // Move to step 3
      },
      hideDependsFunction: (step: number) => step === 2, // Only visible in step 2
    },
    {
      id: 5,
      label: 'Atrás',
      severity: 'secondary',
      icon: 'pi pi-arrow-left',
      action: () => {
        this.data.set(2); // Move back to step 2
      },
      hideDependsFunction: (step: number) => step === 3, // Only visible in step 3
    },
    {
      id: 6,
      label: 'Generar Factura',
      icon: 'pi pi-file-pdf',
      iconPos: 'right',
      action: () => this.notAllowedShowPdf(), // Action to generate the PDF
      hideDependsFunction: (step: number) => step === 3, // Only visible in step 3
    },
  ];

  /** Signal to track visible buttons based on the active step */
  buttons = signal<ButtonConfig[]>(this.getVisibleButtons(this.data()));

  /** Configuration for the stepper buttons */
  stepper: ButtonGenericInterface = {
    css: 'flex flex-column md:flex-row md:justify-content-between gap-2',
    buttons: this.buttons(), // Use the signal for buttons
  };

  /** Names of the steps */
  nameStepOne = 'Remitente Factura'; // Step 1: Sender form
  nameStepTwo = 'Tabla Factura'; // Step 2: Invoice table
  nameStepThree = 'Destinatario - Generar Factura'; // Step 3: Destination form

  /** Injected services */
  readonly store = inject(InvoicesStore); // Store for managing invoice data
  toastr: ToastrService = inject(ToastrService); // Toastr service for notifications
  createInvoicePdfService: CreateInvoicePdfService = inject(
    CreateInvoicePdfService
  ); // Service for generating PDFs

  /** References to dynamically created components */
  componentRefs: { [key: number]: any } = {};

  constructor() {
    // React to changes in the `data` signal to update buttons and components
    effect(
      () => {
        this.buttons.set(this.getVisibleButtons(this.data())); // Update visible buttons
        this.stepper.buttons = this.buttons(); // Update stepper buttons
        this.updateCurrentComponent(); // Update the dynamic component
      },
      { allowSignalWrites: true } // Allow signal writes within the effect
    );
  }

  /**
   * Lifecycle hook that runs after the view is initialized.
   * Renders the initial component for the active step.
   */
  ngAfterViewInit() {
    this.updateCurrentComponent();
  }

  /**
   * Filters and returns the visible buttons based on the active step.
   * @param step - The active step.
   * @returns An array of visible buttons.
   */
  public getVisibleButtons(step: number): ButtonConfig[] {
    return this.allButtons.filter(
      (button) =>
        button?.hideDependsFunction && button?.hideDependsFunction(step)
    );
  }

  /**
   * Handles step changes in the stepper.
   * @param newValue - The new step value.
   */
  onStepChange(newValue: number) {
    this.data.set(newValue); // Update the active step
  }

  /**
   * Updates the dynamic component based on the active step.
   */
  public updateCurrentComponent() {
    this.container.clear(); // Clear the container before rendering

    // Get the component corresponding to the active step
    const component =
      stepComponents[this.data()] || InvoicesSenderFormComponent;

    // Create the component dynamically
    const componentRef = this.container.createComponent(component);

    // Store the reference to the component instance
    this.componentRefs[this.data()] = componentRef.instance;
  }

  /**
   * Clears all data in the current step.
   */
  cleanDataStep() {
    this.store.resetInvoices(); // Reset invoice data
    this.store.resetTableInvoices(); // Reset table data
    const step1 = this.componentRefs[1] as InvoicesSenderFormComponent;
    step1.changeData(this.store.getFirstForm()); // Update the sender form with reset data
    step1.formSenderGenericComponent?.getGroupForm?.markAsUntouched();
  }

  /**
   * Validates the form and generates the PDF if valid.
   */
  notAllowedShowPdf() {
    this.askHaveDataTableCreate(); // Ensure the table has data

    // Check if step 3 is active and the component is defined
    if (this.data() !== 3 || !this.componentRefs[3]) {
      return;
    }

    const step3 = this.componentRefs[3] as InvoicesDestinationFormComponent;
    const isValidFirstForm = this.store.getIsValidFirstForm(); // Check if step 1 form is valid
    const isValidSecondForm = this.store.getIsValidSecondForm(); // Check if step 2 form is valid
    const messages = 'Deben ser válidos los formularios del paso 1.'; // Error message
    step3.formDestinationGenericComponent?.getGroupForm?.markAllAsTouched();
    // Show error if forms are invalid
    if (!isValidFirstForm || (!isValidSecondForm && !step3.isValidForm())) {
      this.store.updateAllMarkFieldForm(true); // Mark all fields as touched
      this.toastr.error(
        !isValidFirstForm
          ? messages
          : 'Deben ser válidos los formularios del paso 3.',
        'Error'
      );
    } else {
      // Get data from the forms and table
      const first = this.store.getFirstForm();
      let second = this.store.getSeconfForm();
      const table = this.store.getTableContain();

      // Use destination form data if valid
      if (step3.isValidForm())
        second = step3.formDestinationGenericComponent.getDataFormComplete();

      // Generate the PDF
      this.createInvoicePdfService.newGeneratePDFInvoices(
        [first.name, first.national ? first.address : first.passport],
        second,
        first,
        table
      );
    }
  }

  /**
   * Ensures the table has data by adding summary rows if empty.
   */
  askHaveDataTableCreate() {
    let rowTable: DataInvoicesTable[] = this.store.getTableContain() || [];
    if (!rowTable?.length) {
      // Add summary rows if the table is empty
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
      this.store.updateTable(rowTable); // Update the store with the new table data
    }
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Resets the store data.
   */
  ngOnDestroy() {
    this.store.resetTableInvoices(); // Reset table data
    this.store.resetInvoices(); // Reset invoice data
  }
}
