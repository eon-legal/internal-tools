import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../../data-access/auth/auth.service';
import { Session } from '@supabase/supabase-js';
import { signal } from '@angular/core';

// ── Helpers ──────────────────────────────────────────────────────────────────

const fakeSession: Partial<Session> = {
  access_token: 'test-jwt-token',
  refresh_token: 'test-refresh-token',
  user: { id: 'user-1', email: 'test@example.com' } as any,
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  let currentSessionSignal: ReturnType<typeof signal<Session | null>>;

  beforeEach(() => {
    currentSessionSignal = signal<Session | null>(null);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            currentSession: currentSessionSignal,
          },
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  // ── Token attachment ─────────────────────────────────────────────────────

  it('should attach Authorization header when session exists', () => {
    currentSessionSignal.set(fakeSession as Session);

    httpClient.get('/api/data').subscribe();

    const req = httpTesting.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
    req.flush({});
  });

  it('should NOT attach Authorization header when no session exists', () => {
    currentSessionSignal.set(null);

    httpClient.get('/api/data').subscribe();

    const req = httpTesting.expectOne('/api/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  // ── Excluded URLs ────────────────────────────────────────────────────────

  it('should skip Supabase Auth endpoints (/auth/v1/)', () => {
    currentSessionSignal.set(fakeSession as Session);

    httpClient.get('https://project.supabase.co/auth/v1/token').subscribe();

    const req = httpTesting.expectOne('https://project.supabase.co/auth/v1/token');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should skip local asset requests (/assets/)', () => {
    currentSessionSignal.set(fakeSession as Session);

    httpClient.get('/assets/i18n/en.json').subscribe();

    const req = httpTesting.expectOne('/assets/i18n/en.json');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  // ── Non-excluded URLs ────────────────────────────────────────────────────

  it('should attach token to Supabase REST API endpoints', () => {
    currentSessionSignal.set(fakeSession as Session);

    httpClient.get('https://project.supabase.co/rest/v1/invoices').subscribe();

    const req = httpTesting.expectOne('https://project.supabase.co/rest/v1/invoices');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
    req.flush({});
  });

  it('should attach token to custom backend API endpoints', () => {
    currentSessionSignal.set(fakeSession as Session);

    httpClient.post('/api/invoices', { amount: 100 }).subscribe();

    const req = httpTesting.expectOne('/api/invoices');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
    req.flush({});
  });

  it('should not modify other existing headers', () => {
    currentSessionSignal.set(fakeSession as Session);

    httpClient
      .get('/api/data', { headers: { 'X-Custom': 'value' } })
      .subscribe();

    const req = httpTesting.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
    expect(req.request.headers.get('X-Custom')).toBe('value');
    req.flush({});
  });
});

