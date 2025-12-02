/**
 * Client Form Component
 * 
 * Responsibilities:
 * - Render dynamic form for creating/editing clients (both individual and company types)
 * - Handle client type switching (individual vs company)
 * - Validate form fields based on client type
 * - Support modal and standalone modes
 * 
 * Dependencies:
 * - FormGenericComponent for form rendering
 * - TranslateService for i18n
 * 
 * Side Effects:
 * - Form validation changes based on client_type selection
 * - Fields show/hide based on client_type and national status
 */

import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormGenericComponent } from '../../../../shared/components/form-generic/form-generic.component';
import { FormField } from '../../../../shared/components/form-generic/interfaces/form-field';
import { TranslateService } from '@ngx-translate/core';
import { Client, ClientType } from '../../../invoices/interfaces/database-models';

interface ClientFormData {
  client_type: ClientType;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  company_registration_number?: string;
  personal_id?: string;
  address?: string;
  passport?: string;
  national: boolean;
  nif?: string;
  is_default: boolean;
}

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [FormGenericComponent],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss',
})
export class ClientFormComponent implements OnInit {
  private readonly translate = inject(TranslateService);

  @ViewChild('formClientGenericComponent')
  formClientGenericComponent!: FormGenericComponent<ClientFormData>;

  @Input() isModal = false;
  @Input() initialData?: Client;

  formConfig: FormField<ClientFormData>[] = [];

  ngOnInit(): void {
    this.buildFormConfig();
  }

  /**
   * Build form configuration based on client type
   */
  private buildFormConfig(): void {
    const clientType = this.initialData?.client_type || 'individual';
    const isIndividual = clientType === 'individual';
    const isNational = this.initialData?.national ?? true;

    this.formConfig = [
      {
        name: 'client_type',
        label: this.translate.instant('clients.form.client_type'),
        type: 'select',
        cols: 12,
        initialData: clientType,
        primeNgConfig: {
          options: [
            {
              label: this.translate.instant('clients.types.individual'),
              value: 'individual',
            },
            {
              label: this.translate.instant('clients.types.company'),
              value: 'company',
            },
          ],
        },
        validators: [
          {
            validator: Validators.required,
            message: this.translate.instant('common.validation.required'),
          },
        ],
      },
      // Individual fields
      {
        name: 'first_name',
        label: this.translate.instant('clients.form.first_name'),
        type: 'input',
        cols: 6,
        initialData: this.initialData && 'first_name' in this.initialData ? this.initialData.first_name : '',
        showComponent: isIndividual,
        validators: isIndividual
          ? [
              {
                validator: Validators.required,
                message: this.translate.instant('common.validation.required'),
              },
            ]
          : undefined,
      },
      {
        name: 'last_name',
        label: this.translate.instant('clients.form.last_name'),
        type: 'input',
        cols: 6,
        initialData: this.initialData && 'last_name' in this.initialData ? this.initialData.last_name : '',
        showComponent: isIndividual,
        validators: isIndividual
          ? [
              {
                validator: Validators.required,
                message: this.translate.instant('common.validation.required'),
              },
            ]
          : undefined,
      },
      {
        name: 'personal_id',
        label: this.translate.instant('clients.form.personal_id'),
        type: 'input',
        cols: 6,
        initialData: this.initialData && 'personal_id' in this.initialData ? this.initialData.personal_id : '',
        showComponent: isIndividual,
      },
      // Company fields
      {
        name: 'company_name',
        label: this.translate.instant('clients.form.company_name'),
        type: 'input',
        cols: 12,
        initialData: this.initialData && 'company_name' in this.initialData ? this.initialData.company_name : '',
        showComponent: !isIndividual,
        validators: !isIndividual
          ? [
              {
                validator: Validators.required,
                message: this.translate.instant('common.validation.required'),
              },
            ]
          : undefined,
      },
      {
        name: 'company_registration_number',
        label: this.translate.instant('clients.form.company_registration_number'),
        type: 'input',
        cols: 6,
        initialData: this.initialData && 'company_registration_number' in this.initialData ? this.initialData.company_registration_number : '',
        showComponent: !isIndividual,
      },
      // Common fields
      {
        name: 'nif',
        label: this.translate.instant('clients.form.nif'),
        type: 'input',
        cols: 6,
        initialData: this.initialData?.nif || '',
        validators: [
          {
            validator: Validators.required,
            message: this.translate.instant('common.validation.required'),
          },
        ],
      },
      {
        name: 'address',
        label: this.translate.instant('clients.form.address'),
        type: 'input',
        cols: 6,
        initialData: this.initialData?.address || '',
      },
      {
        name: 'national',
        label: this.translate.instant('clients.form.national'),
        type: 'toggle',
        cols: 6,
        initialData: isNational,
      },
      {
        name: 'passport',
        label: this.translate.instant('clients.form.passport'),
        type: 'input',
        cols: 6,
        initialData: this.initialData?.passport || '',
        showComponent: !isNational,
      },
      {
        name: 'is_default',
        label: this.translate.instant('clients.form.is_default'),
        type: 'toggle',
        cols: 6,
        initialData: this.initialData?.is_default || false,
      },
    ];
  }

  /**
   * Check if form is valid
   */
  isValidForm(): boolean {
    return this.formClientGenericComponent?.getForm?.valid || false;
  }

  /**
   * Get form values
   */
  getValueForm(): ClientFormData {
    return this.formClientGenericComponent?.getDataFormComplete() as ClientFormData;
  }
}

