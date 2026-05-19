import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InvoicesDataService } from './invoices-data.service';
import { SupabaseService } from '../supabase/supabase.service';
import { environment } from '../../../environments/environment';

// Supabase is unused by sendPaymentLink — stub the client out so the
// service constructor doesn't blow up.
const mockSupabaseService = {
  getClient: jest.fn(() => ({
    from: jest.fn(),
  })),
};

describe('InvoicesDataService', () => {
  let service: InvoicesDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        InvoicesDataService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    });

    service = TestBed.inject(InvoicesDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  describe('sendPaymentLink', () => {
    it('POSTs the invoice id to the configured edge function URL', () => {
      const invoiceId = 'invoice-uuid-123';
      const fakeResponse = { success: true, token: 'tok123', sent_to: 'client@example.com' };

      service.sendPaymentLink(invoiceId).subscribe((res) => {
        expect(res).toEqual(fakeResponse);
      });

      const req = httpMock.expectOne(environment.tpv.sendPaymentLinkFnUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ invoice_id: invoiceId });
      req.flush(fakeResponse);
    });

    it('propagates HTTP errors', (done) => {
      service.sendPaymentLink('bad-id').subscribe({
        next: () => done.fail('should not succeed'),
        error: (err) => {
          expect(err.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(environment.tpv.sendPaymentLinkFnUrl);
      req.flush({ error: 'Client has no email on file' }, { status: 400, statusText: 'Bad Request' });
    });
  });
});
