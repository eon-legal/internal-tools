import {
  AfterViewInit,
  Component,
  effect,
  inject,
  signal,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { InvoiceCombinedFormComponent } from '../invoice-combined-form/invoice-combined-form.component';
import { InvoiceDestinationSelectorComponent } from '../invoice-destination-selector/invoice-destination-selector.component';
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
import { DataInvoicesTable } from '../../interfaces/data-invoices-table';
import { TranslateService } from '@ngx-translate/core';
import { InvoicesDataService } from '../../../../data-access/invoices/invoices-data.service';
import { ClientsDataService } from '../../../../data-access/clients/clients-data.service';
import { AddresseesDataService } from '../../../../data-access/addressees/addressees-data.service';
import { generateNextInvoiceNumberFromArray } from '../../../../domain/invoices/invoice-number-generator';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { getClientDisplayName } from '../../interfaces/database-models';

/** Dictionary of components for each step */
const stepComponents: { [key: number]: any } = {
  1: InvoiceCombinedFormComponent, // Step 1: Combined sender form and invoice table
  2: InvoiceDestinationSelectorComponent, // Step 2: Destination selector
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

  /** Injected services */
  private readonly translate = inject(TranslateService);
  readonly store = inject(InvoicesStore);
  toastr: ToastrService = inject(ToastrService);
  createInvoicePdfService: CreateInvoicePdfService = inject(CreateInvoicePdfService);
  private readonly invoicesDataService = inject(InvoicesDataService);
  private readonly clientsDataService = inject(ClientsDataService);
  private readonly addresseesDataService = inject(AddresseesDataService);
  private readonly router = inject(Router);

  /** Signal to track if invoice is being saved */
  isSaving = signal(false);

  /** Array of all buttons for the stepper */
  private allButtons: ButtonConfig[] = [
    {
      id: 1,
      label: this.translate.instant('invoices.stepper.buttons.clear_all'),
      icon: 'pi pi-times',
      severity: 'warn',
      iconPos: 'right',
      action: () => this.cleanDataStep(), // Action to clear all data
      hideDependsFunction: (step: number) => step === 1, // Only visible in step 1
    },
    {
      id: 2,
      label: this.translate.instant('common.buttons.next'),
      icon: 'pi pi-arrow-right',
      iconPos: 'right',
      action: () => {
        const step1 = this.componentRefs[1] as InvoiceCombinedFormComponent;
        const valid = step1.isValid();
        if (valid) this.data.set(2); // Move to step 2
        else step1.markAllAsTouched();
      },
      hideDependsFunction: (step: number) => step === 1, // Only visible in step 1
    },
    {
      id: 3,
      label: this.translate.instant('common.buttons.back'),
      severity: 'secondary',
      icon: 'pi pi-arrow-left',
      action: () => {
        this.data.set(1); // Move back to step 1
      },
      hideDependsFunction: (step: number) => step === 2, // Only visible in step 2
    },
    {
      id: 4,
      label: this.translate.instant('invoices.stepper.buttons.generate_invoice'),
      icon: 'pi pi-file-pdf',
      iconPos: 'right',
      action: () => this.notAllowedShowPdf(), // Action to generate the PDF
      hideDependsFunction: (step: number) => step === 2, // Only visible in step 2
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
  nameStepOne = this.translate.instant('invoices.stepper.steps.invoice_data');
  nameStepTwo = this.translate.instant('invoices.stepper.steps.select_destination');

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
      stepComponents[this.data()] || InvoiceCombinedFormComponent;

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
    const step1 = this.componentRefs[1] as InvoiceCombinedFormComponent;
    step1.senderFormComponent?.changeData(this.store.getFirstForm()); // Update the sender form with reset data
    step1.senderFormComponent?.formSenderGenericComponent?.getForm?.markAsUntouched();
  }

  /**
   * Validates the form, saves to Supabase, and generates the PDF if valid.
   */
  async notAllowedShowPdf() {
    this.askHaveDataTableCreate(); // Ensure the table has data

    // Check if step 2 is active and the component is defined
    if (this.data() !== 2 || !this.componentRefs[2]) {
      return;
    }

    const step2 = this.componentRefs[2] as InvoiceDestinationSelectorComponent;
    const isValidFirstForm = this.store.getIsValidFirstForm(); // Check if step 1 form is valid
    const messages = this.translate.instant('invoices.validation.step1_invalid');
    step2.markAllAsTouched();

    // Show error if forms are invalid
    if (!isValidFirstForm || !step2.isValid()) {
      this.store.updateAllMarkFieldForm(true); // Mark all fields as touched
      this.toastr.error(
        !isValidFirstForm
          ? messages
          : this.translate.instant('invoices.validation.step2_invalid'),
        this.translate.instant('common.labels.error')
      );
      return;
    }

    // Get data from the forms and table
    const first = this.store.getFirstForm();
    const table = this.store.getTableContain();

    // Get selected destination
    const selectedDestination = step2.getSelectedDestination();
    if (!selectedDestination) {
      this.toastr.error(
        this.translate.instant('invoices.validation.destination_required'),
        this.translate.instant('common.labels.error')
      );
      return;
    }

    // Extract client ID from the selected destination value
    const clientId = selectedDestination.value.startsWith('client_')
      ? selectedDestination.value.replace('client_', '')
      : undefined;

    try {
      this.isSaving.set(true);

      // Fetch destination data based on selection
      let destinationData;
      if (selectedDestination.value.startsWith('client_')) {
        const client = await firstValueFrom(
          this.clientsDataService.getClientById(clientId!)
        );
        destinationData = {
          nameDestination: getClientDisplayName(client),
          accountDestination: '', // Clients don't have bank account info
          addressDestination: client.address || '',
          nameBank: '', // Clients don't have bank info
          addressBank: '', // Clients don't have bank info
          nif: client.nif || '',
        };
      } else {
        const addresseeId = selectedDestination.value.replace('addressee_', '');
        const addressee = await firstValueFrom(
          this.addresseesDataService.getAddresseeById(addresseeId)
        );
        destinationData = {
          nameDestination: addressee.name_destination || '',
          accountDestination: addressee.account_destination || '',
          addressDestination: addressee.address_destination || '',
          nameBank: addressee.name_bank || '',
          addressBank: addressee.address_bank || '',
          nif: addressee.nif || '',
        };
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      // Calculate totals from table
      const { subtotal, ivaAmount, totalAmount } = this.calculateTotals(table);

      // Prepare invoice items (exclude IVA and TOTAL rows)
      const invoiceItems = table
        .filter(item =>
          item.perCentIva !== DataInvoicesConstant.IVA &&
          item.perCentIva !== DataInvoicesConstant.TOTAL
        )
        .map(item => ({
          id: item.id,
          description: item.description,
          qtt: typeof item.qtt === 'number' ? item.qtt : (typeof item.qtt === 'string' ? parseFloat(item.qtt) : undefined),
          price: typeof item.price === 'number' ? item.price : (typeof item.price === 'string' ? parseFloat(item.price) : undefined),
          total: typeof item.total === 'number' ? item.total : parseFloat(String(item.total)),
          sTotal: typeof item.sTotal === 'number' ? item.sTotal : parseFloat(String(item.sTotal)),
          perCentIva: typeof item.perCentIva === 'number' ? item.perCentIva :
                      (typeof item.perCentIva === 'object' && 'value' in item.perCentIva ? item.perCentIva.value :
                       parseFloat(String(item.perCentIva)))
        }));

      // Create invoice object
      const invoiceData = {
        invoice_number: invoiceNumber,
        invoice_date: this.getInvoiceDate(first),
        client_id: clientId, // Save client reference if selected
        sender_name: first.name,
        sender_identification_type: first.identificationType,
        sender_identification: first.identification,
        destination_name: destinationData.nameDestination,
        destination_account: destinationData.accountDestination,
        destination_address: destinationData.addressDestination,
        destination_bank_name: destinationData.nameBank,
        destination_bank_address: destinationData.addressBank,
        destination_nif: destinationData.nif,
        invoice_items: invoiceItems,
        subtotal,
        iva_amount: ivaAmount,
        total_amount: totalAmount,
        paid: false
      };

      // Save to Supabase
      const savedInvoice = await firstValueFrom(
        this.invoicesDataService.createInvoice(invoiceData)
      );

      this.toastr.success(
        this.translate.instant('invoices.messages.invoice_created', { number: invoiceNumber }),
        this.translate.instant('common.labels.success')
      );

      // Generate the PDF
      this.createInvoicePdfService.newGeneratePDFInvoices(
        [first.name, first.identification],
        destinationData,
        first,
        table
      );

      // Reset form and navigate to invoice list
      this.store.resetInvoices();
      this.store.resetTableInvoices();

      // Navigate to invoice history after a short delay
      setTimeout(() => {
        this.router.navigate(['/invoices']);
      }, 1000);

    } catch (error) {
      console.error('Error saving invoice:', error);
      this.toastr.error(
        this.translate.instant('invoices.messages.save_error'),
        this.translate.instant('common.labels.error')
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  /**
   * Generates the next invoice number based on existing invoices
   */
  private async generateInvoiceNumber(): Promise<string> {
    try {
      const allInvoices = await firstValueFrom(
        this.invoicesDataService.getInvoices()
      );
      return generateNextInvoiceNumberFromArray(allInvoices);
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to default if error
      return generateNextInvoiceNumberFromArray([]);
    }
  }

  /**
   * Gets the invoice date from the first form
   */
  private getInvoiceDate(first: any): string {
    if (first.date) {
      return new Date(first.date).toISOString();
    }
    // Default to current date
    return new Date().toISOString();
  }

  /**
   * Calculates subtotal, IVA, and total from table data
   */
  private calculateTotals(table: DataInvoicesTable[]): {
    subtotal: number;
    ivaAmount: number;
    totalAmount: number;
  } {
    const ivaRow = table.find(item => item.perCentIva === DataInvoicesConstant.IVA);
    const totalRow = table.find(item => item.perCentIva === DataInvoicesConstant.TOTAL);

    // Calculate subtotal from regular items
    const subtotal = table
      .filter(item =>
        item.perCentIva !== DataInvoicesConstant.IVA &&
        item.perCentIva !== DataInvoicesConstant.TOTAL
      )
      .reduce((sum, item) => sum + (Number(item.total) || 0), 0);

    const ivaAmount = ivaRow ? Number(ivaRow.total) || 0 : 0;
    const totalAmount = totalRow ? Number(totalRow.total) || 0 : subtotal + ivaAmount;

    return { subtotal, ivaAmount, totalAmount };
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
