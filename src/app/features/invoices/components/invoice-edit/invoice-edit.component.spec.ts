import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { InvoiceEditComponent } from './invoice-edit.component';
import { InvoicesDataService } from '../../../../data-access/invoices/invoices-data.service';
import { ClientsDataService } from '../../../../data-access/clients/clients-data.service';
import { LanguageService } from '../../../../shared/services/language/language.service';
import { Client, Invoice } from '../../interfaces/database-models';

const baseInvoice: Invoice = {
  id: 'inv-1',
  invoice_number: 'EON-25-L001',
  invoice_date: '2025-01-01T00:00:00Z',
  client_id: 'client-1',
  invoice_items: [],
  subtotal: 100,
  iva_amount: 21,
  total_amount: 121,
  paid: false,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

const baseClient: Client = {
  id: 'client-1',
  client_type: 'individual',
  first_name: 'Jane',
  last_name: 'Doe',
  nif: '12345678A',
  national: true,
  is_default: false,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

describe('InvoiceEditComponent — TPV send payment link', () => {
  let fixture: ComponentFixture<InvoiceEditComponent>;
  let component: InvoiceEditComponent;

  let invoicesService: {
    getInvoiceById: jest.Mock;
    sendPaymentLink: jest.Mock;
    updateInvoice: jest.Mock;
  };
  let clientsService: { getClientById: jest.Mock };
  let messageService: { add: jest.Mock };

  beforeEach(async () => {
    invoicesService = {
      getInvoiceById: jest.fn().mockReturnValue(of(baseInvoice)),
      sendPaymentLink: jest.fn(),
      updateInvoice: jest.fn(),
    };
    clientsService = {
      getClientById: jest.fn().mockReturnValue(of({ ...baseClient, email: 'jane@example.com' })),
    };
    messageService = { add: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [InvoiceEditComponent],
      providers: [
        { provide: InvoicesDataService, useValue: invoicesService },
        { provide: ClientsDataService, useValue: clientsService },
        { provide: LanguageService, useValue: { getText: (k: string) => k } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'inv-1' } } } },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(InvoiceEditComponent, { set: { providers: [{ provide: MessageService, useValue: messageService }] } })
      .compileComponents();

    fixture = TestBed.createComponent(InvoiceEditComponent);
    component = fixture.componentInstance;
  });

  it('disables the send button when the invoice is already paid', () => {
    component.invoice = { ...baseInvoice, paid: true };
    component.client = { ...baseClient, email: 'jane@example.com' };
    expect(component.canSendPaymentLink()).toBe(false);
    expect(component.paymentLinkDisabledReason()).toBe('invoices.tpv.already_paid');
  });

  it('disables the send button when the client has no email', () => {
    component.invoice = baseInvoice;
    component.client = { ...baseClient, email: undefined };
    expect(component.canSendPaymentLink()).toBe(false);
    expect(component.paymentLinkDisabledReason()).toBe('invoices.tpv.no_email');
  });

  it('disables the send button when the invoice has no client', () => {
    component.invoice = { ...baseInvoice, client_id: undefined };
    component.client = null;
    expect(component.canSendPaymentLink()).toBe(false);
    expect(component.paymentLinkDisabledReason()).toBe('invoices.tpv.no_client');
  });

  it('enables the send button when invoice is unpaid and client has an email', () => {
    component.invoice = baseInvoice;
    component.client = { ...baseClient, email: 'jane@example.com' };
    expect(component.canSendPaymentLink()).toBe(true);
  });

  it('calls the service and toasts success on send', () => {
    component.invoice = baseInvoice;
    component.client = { ...baseClient, email: 'jane@example.com' };
    component.invoiceId = baseInvoice.id;
    invoicesService.sendPaymentLink.mockReturnValue(
      of({ success: true, token: 't', sent_to: 'jane@example.com' }),
    );

    component.onSendPaymentLink();

    expect(invoicesService.sendPaymentLink).toHaveBeenCalledWith('inv-1');
    expect(component.isSendingPaymentLink).toBe(false);
    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  it('toasts an error when sending fails', () => {
    component.invoice = baseInvoice;
    component.client = { ...baseClient, email: 'jane@example.com' };
    component.invoiceId = baseInvoice.id;
    invoicesService.sendPaymentLink.mockReturnValue(
      throwError(() => ({ error: { error: 'Client has no email on file' } })),
    );

    component.onSendPaymentLink();

    expect(component.isSendingPaymentLink).toBe(false);
    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
  });

  it('no-ops when guard fails', () => {
    component.invoice = { ...baseInvoice, paid: true };
    component.invoiceId = baseInvoice.id;
    component.onSendPaymentLink();
    expect(invoicesService.sendPaymentLink).not.toHaveBeenCalled();
  });
});
