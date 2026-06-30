import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  // Las requests HTTP son inmutables en Angular — necesitamos clonarla para modificar los headers
  const reqConToken = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req; // si no hay token, mandamos la request original sin modificar

  return next(reqConToken).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 significa que el token venció o es inválido — forzamos logout y redirigimos al login
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      // Propagamos el error para que los componentes también puedan manejarlo con su propio error handler
      return throwError(() => error);
    }),
  );
};
