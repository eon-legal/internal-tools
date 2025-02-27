import { AfterViewInit, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { FormGenericComponent } from '../../../shared/components/form-generic/form-generic.component';
import { Validators } from '@angular/forms';
import { FormField } from '../../../core/interfaces/form-field';
import { InvoicesStore } from '../../../app.component.store';

@Component({
  selector: 'app-invoices-sender-form',
  standalone: true,
  imports: [FormGenericComponent],
  templateUrl: './invoices-sender-form.component.html',
  styleUrl: './invoices-sender-form.component.scss'
})
export class InvoicesSenderFormComponent implements AfterViewInit, OnDestroy {
  readonly store = inject(InvoicesStore);
  @ViewChild('formSenderGenericComponent')
  formSenderGenericComponent!: FormGenericComponent;

  formConfig: FormField[] = [
    {
      name: 'numberInvoice',
      label: 'Número Factura',
      type: 'input',
      cols: 4,
      initialData: this.getFirstFormStore().numberInvoice,
      validators: [Validators.required],
    },
    {
      name: 'dateOrDateRange',
      label: 'Período',
      type: 'toggle',
      initialData: this.getFirstFormStore().dateOrDateRange,
      cols: 4,
    },
    {
      name: 'date',
      label: 'Fecha',
      type: 'calendar',
      cols: 4,
      initialData: this.getFirstFormStore().date,
      validators: [Validators.required],
      showComponent: true,
    },
    {
      name: 'rangeDates',
      label: 'Rango Fecha',
      type: 'calendar',
      initialData: this.getFirstFormStore().rangeDates,
      cols: 4,
      validators: [Validators.required],
      showComponent: false,
    },
    {
      name: 'name',
      label: 'Nombre Remitente',
      type: 'input',
      cols: 4,
      initialData: this.getFirstFormStore().name,
      validators: [Validators.required],
    },
    {
      name: 'national',
      label: 'Nacional',
      type: 'toggle',
      initialData: this.getFirstFormStore().national,
      cols: 4,
    },
    {
      name: 'address',
      label: 'Dirección Remitente',
      type: 'input',
      cols: 4,
      initialData: this.getFirstFormStore().address,
      validators: [Validators.required],
      showComponent: true,
    },
    {
      name: 'passport',
      label: 'Pasaporte Remitente',
      type: 'input',
      cols: 4,
      initialData: this.getFirstFormStore().passport,
      validators: [Validators.required],
      showComponent: false,
    },
  ];

  ngAfterViewInit() {
    // Escuchar cambios de valor
    this.setupConditionaDateRemitenteValidation();
    this.setupConditionalNationalRemitente();
    //this.formSenderGenericComponent?.doMarkField();
  }

  private setupConditionaDateRemitenteValidation() {
    this.formSenderGenericComponent
      ?.getFormControl('dateOrDateRange')
      ?.valueChanges.subscribe((value: boolean) => {
        const fieldDate = this.formSenderGenericComponent?.form?.get('date');
        const fieldRangeDate =
          this.formSenderGenericComponent?.form?.get('rangeDates');
        const positionDate = this.formConfig.findIndex(
          (v) => v.name === 'date'
        );
        const positionRange = this.formConfig.findIndex(
          (v) => v.name === 'rangeDates'
        );

        if (positionDate !== -1 && positionRange !== -1) {
          if (value) {
            this.formConfig[positionDate].showComponent = false;
            this.formConfig[positionRange].showComponent = true;
            fieldDate?.disable();
            fieldDate?.setValue('');
            fieldRangeDate?.enable();
            fieldRangeDate?.setValidators(Validators.required);
          } else {
            this.formConfig[positionDate].showComponent = true;
            this.formConfig[positionRange].showComponent = false;
            fieldRangeDate?.disable();
            fieldRangeDate?.setValue('');
            fieldDate?.enable();
            fieldDate?.setValidators(Validators.required);
          }

          fieldDate?.updateValueAndValidity();
          fieldRangeDate?.updateValueAndValidity();
        }
      });
  }
  private setupConditionalNationalRemitente() {
    this.formSenderGenericComponent
      ?.getFormControl('national')
      ?.valueChanges.subscribe((value: boolean) => {
        const fieldAddress =
          this.formSenderGenericComponent?.form?.get('address');
        const fieldPassport =
          this.formSenderGenericComponent?.form?.get('passport');
        const positionAddress = this.formConfig.findIndex(
          (v) => v.name === 'address'
        );
        const positionPassport = this.formConfig.findIndex(
          (v) => v.name === 'passport'
        );
        if (positionAddress !== -1 && positionPassport !== -1) {
          if (value) {
            this.formConfig[positionAddress].showComponent = true;
            this.formConfig[positionPassport].showComponent = false;

            fieldAddress?.disable();
            fieldAddress?.setValue('');

            fieldPassport?.enable();
            fieldPassport?.setValidators(Validators.required);

            fieldPassport?.disable();
            fieldPassport?.setValue('');

            fieldAddress?.enable();
            fieldAddress?.setValidators(Validators.required);
          } else {
            this.formConfig[positionAddress].showComponent = false;
            this.formConfig[positionPassport].showComponent = true;
            fieldAddress?.disable();
            fieldAddress?.setValue('');
            fieldPassport?.enable();
            fieldPassport?.setValidators(Validators.required);
          }
          fieldAddress?.updateValueAndValidity();
          fieldPassport?.updateValueAndValidity();
        }
      });
  }
  changeData(data: object){
    this.formSenderGenericComponent.establishDataParams(data);
  }
  ngOnDestroy(): void {
    this.store.updateFirstForm(this.formSenderGenericComponent.getDataFormComlete());
    if(this.formSenderGenericComponent.formValid()){
      this.store.updateValidFirstForm(true);
    }
    else{
      this.store.updateValidFirstForm(false);
    }
  }
  getFirstFormStore(){
   return  this.store.getFirstForm();
  }
}
