import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Protege una ruta exigiendo que el usuario tenga uno de los roles indicados.
 * Si no está autenticado va a /signin; si no tiene el rol, a /dashboard.
 *
 * Uso: `canActivate: [roleGuard(['ADMIN', 'ASSISTANT_ADMIN'])]`
 */
export const roleGuard =
  (roles: string[]): CanActivateFn =>
  () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const token = authService.getToken();
    if (!token) {
      return router.createUrlTree(['/signin'], { queryParams: { returnUrl: window.location.pathname } });
    }

    const user = authService.currentUser();
    if (user) {
      return authService.hasAnyRole(roles) ? true : router.createUrlTree(['/dashboard']);
    }

    // Aún no cargamos el usuario: lo pedimos y reevaluamos.
    return authService.me().pipe(
      map(() => (authService.hasAnyRole(roles) ? true : router.createUrlTree(['/dashboard']))),
      catchError(() => {
        authService.logout();
        return of(router.createUrlTree(['/signin']));
      }),
    );
  };
