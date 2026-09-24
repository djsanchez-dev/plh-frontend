import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Protege rutas: exige sesión activa. Si no la hay, redirige a /signin
 * recordando la ruta original (returnUrl) para volver tras iniciar sesión.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const loginUrl = router.createUrlTree(['/signin'], { queryParams: { returnUrl: state.url } });

  const token = authService.getToken();
  if (!token) {
    return loginUrl;
  }

  return authService.me().pipe(
    map(() => true),
    catchError(() => {
      authService.logout();
      return of(loginUrl);
    }),
  );
};
