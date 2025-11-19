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
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Error de red: ${error.error.message}`;
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
            errorMessage = 'No se pudo conectar al servidor. Verifique su conexión a internet.';
            break;
          case 400:
            errorMessage = error.error?.message || 'Solicitud inválida';
            break;
          case 401:
            errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente.';
            break;
          case 403:
            errorMessage = 'No tiene permisos para realizar esta acción';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          case 503:
            errorMessage = 'Servicio no disponible. Intente nuevamente más tarde.';
            break;
          default:
            errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
        }
      }

      // Display error notification to user
      toastr.error(errorMessage, 'Error', {
        timeOut: 5000,
        closeButton: true,
        progressBar: true,
      });

      // Re-throw the error so components can handle it if needed
      return throwError(() => error);
    })
  );
};

