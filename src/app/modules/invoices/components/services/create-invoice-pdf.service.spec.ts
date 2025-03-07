import { TestBed } from '@angular/core/testing';

import { CreateInvoicePdfService } from './create-invoice-pdf.service';

describe('CreateInvoicePdfService', () => {
  let service: CreateInvoicePdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateInvoicePdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
