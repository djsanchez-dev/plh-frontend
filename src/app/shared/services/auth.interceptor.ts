import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const url = request.url.toLowerCase();
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const isBackendRequest =
    url.includes(`${environment.apiUrl}/api`) ||
    url.startsWith('/api/') ||
    url.startsWith('api/');
  const shouldSkipAuth =
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/actuator/health') ||
    request.method.toUpperCase() === 'OPTIONS';

  if (!isBackendRequest || !token || shouldSkipAuth) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  ).pipe(
    catchError((error: HttpErrorResponse) => {
      // Sesión inválida o expirada (p. ej. tras reiniciar el backend): cerrar la
      // sesión y volver al login en lugar de dejar peticiones fallando sin token.
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/signin']);
      }
      return throwError(() => error);
    }),
  );
};
