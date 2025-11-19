/**
 * Global HTTP Error Interceptor
 * 
 * Responsibilities:
 * - Centralized error handling for all HTTP requests
 * - User-friendly error notifications via ToastrService
 * - Error logging for debugging and monitoring
 * - Consistent error response handling
 * 
 * Side Effects:
 * - Displays toast notifications for HTTP errors
 * - Logs errors to console (can be extended to external logging service)
 * 
 * Invariants:
 * - All HTTP errors pass through this interceptor
 * - Network errors are handled gracefully
 * - User receives feedback for all error scenarios
 */

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);
  const translate = inject(TranslateService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = translate.instant('common.messages.unexpected_error');

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `${translate.instant('common.messages.connection_error')}`;
        console.error('Client-side error:', error.error);
      } else {
        // Backend error
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${JSON.stringify(error.error)}`
        );

        // Customize error messages based on status code
        switch (error.status) {
          case 0:
            errorMessage = translate.instant('common.messages.connection_error');
            break;
          case 400:
            errorMessage = error.error?.message || translate.instant('common.messages.invalid_request');
            break;
          case 401:
            errorMessage = translate.instant('common.messages.unauthorized');
            break;
          case 403:
            errorMessage = translate.instant('common.messages.forbidden');
            break;
          case 404:
            errorMessage = translate.instant('common.messages.not_found');
            break;
          case 500:
            errorMessage = translate.instant('common.messages.server_error');
            break;
          case 503:
            errorMessage = translate.instant('common.messages.service_unavailable');
            break;
          default:
            errorMessage = error.error?.message || `${translate.instant('common.messages.server_error')}: ${error.status}`;
        }
      }

      // Display error notification to user
      toastr.error(errorMessage, translate.instant('common.labels.error'), {
        timeOut: 5000,
        closeButton: true,
        progressBar: true,
      });

      // Re-throw the error so components can handle it if needed
      return throwError(() => error);
    })
  );
};

