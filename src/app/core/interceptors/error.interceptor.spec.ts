import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../../data-access/auth/auth.service';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockToastr = {
  error: jest.fn(),
};

const mockTranslate = {
  instant: jest.fn((key: string) => key),
};

const mockAuthService = {
  signOut: jest.fn().mockResolvedValue({ success: true }),
};

const mockRouter = {
  navigate: jest.fn(),
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: ToastrService, useValue: mockToastr },
        { provide: TranslateService, useValue: mockTranslate },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  // ── 401 Auto-logout ──────────────────────────────────────────────────────

  it('should call authService.signOut and navigate to /login on 401', async () => {
    let errorCaught: HttpErrorResponse | undefined;

    httpClient.get('/api/data').subscribe({
      error: (err) => (errorCaught = err),
    });

    httpTesting
      .expectOne('/api/data')
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(mockAuthService.signOut).toHaveBeenCalled();
    expect(mockToastr.error).toHaveBeenCalled();
    expect(mockTranslate.instant).toHaveBeenCalledWith('common.messages.unauthorized');

    // Wait for signOut promise to resolve and trigger navigate
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    expect(errorCaught).toBeTruthy();
    expect(errorCaught!.status).toBe(401);
  });

  // ── Other status codes ───────────────────────────────────────────────────

  it('should show connection_error toast on status 0 (network error)', () => {
    httpClient.get('/api/data').subscribe({ error: () => {} });

    httpTesting
      .expectOne('/api/data')
      .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown' });

    expect(mockTranslate.instant).toHaveBeenCalledWith('common.messages.connection_error');
    expect(mockToastr.error).toHaveBeenCalled();
    expect(mockAuthService.signOut).not.toHaveBeenCalled();
  });

  it('should show invalid_request toast on 400', () => {
    httpClient.get('/api/data').subscribe({ error: () => {} });

    httpTesting
      .expectOne('/api/data')
      .flush({ message: 'Bad Request' }, { status: 400, statusText: 'Bad Request' });

    expect(mockToastr.error).toHaveBeenCalled();
    expect(mockAuthService.signOut).not.toHaveBeenCalled();
  });

  it('should show forbidden toast on 403', () => {
    httpClient.get('/api/data').subscribe({ error: () => {} });

    httpTesting
      .expectOne('/api/data')
      .flush({}, { status: 403, statusText: 'Forbidden' });

    expect(mockTranslate.instant).toHaveBeenCalledWith('common.messages.forbidden');
    expect(mockToastr.error).toHaveBeenCalled();
  });

  it('should show not_found toast on 404', () => {
    httpClient.get('/api/data').subscribe({ error: () => {} });

    httpTesting
      .expectOne('/api/data')
      .flush({}, { status: 404, statusText: 'Not Found' });

    expect(mockTranslate.instant).toHaveBeenCalledWith('common.messages.not_found');
    expect(mockToastr.error).toHaveBeenCalled();
  });

  it('should show server_error toast on 500', () => {
    httpClient.get('/api/data').subscribe({ error: () => {} });

    httpTesting
      .expectOne('/api/data')
      .flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(mockTranslate.instant).toHaveBeenCalledWith('common.messages.server_error');
    expect(mockToastr.error).toHaveBeenCalled();
  });

  it('should show service_unavailable toast on 503', () => {
    httpClient.get('/api/data').subscribe({ error: () => {} });

    httpTesting
      .expectOne('/api/data')
      .flush({}, { status: 503, statusText: 'Service Unavailable' });

    expect(mockTranslate.instant).toHaveBeenCalledWith('common.messages.service_unavailable');
    expect(mockToastr.error).toHaveBeenCalled();
  });

  it('should use error.error.message for default status codes when available', () => {
    httpClient.get('/api/data').subscribe({ error: () => {} });

    httpTesting
      .expectOne('/api/data')
      .flush({ message: 'Custom error message' }, { status: 422, statusText: 'Unprocessable Entity' });

    expect(mockToastr.error).toHaveBeenCalledWith(
      'Custom error message',
      expect.any(String),
      expect.objectContaining({ timeOut: 5000 }),
    );
  });

  // ── Toast configuration ──────────────────────────────────────────────────

  it('should display toast with correct options (timeOut, closeButton, progressBar)', () => {
    httpClient.get('/api/data').subscribe({ error: () => {} });

    httpTesting
      .expectOne('/api/data')
      .flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(mockToastr.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        timeOut: 5000,
        closeButton: true,
        progressBar: true,
      }),
    );
  });

  // ── Re-throw behavior ───────────────────────────────────────────────────

  it('should re-throw the error so components can handle it', () => {
    let caughtError: HttpErrorResponse | undefined;

    httpClient.get('/api/data').subscribe({
      error: (err) => (caughtError = err),
    });

    httpTesting
      .expectOne('/api/data')
      .flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(caughtError).toBeTruthy();
    expect(caughtError!.status).toBe(500);
  });

  // ── Successful requests ──────────────────────────────────────────────────

  it('should not intercept successful requests', () => {
    let result: any;

    httpClient.get('/api/data').subscribe((res) => (result = res));

    httpTesting.expectOne('/api/data').flush({ data: 'ok' });

    expect(result).toEqual({ data: 'ok' });
    expect(mockToastr.error).not.toHaveBeenCalled();
    expect(mockAuthService.signOut).not.toHaveBeenCalled();
  });
});

