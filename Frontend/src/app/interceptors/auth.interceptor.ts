import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  // Clonamos la request y le agregamos el header Authorization si hay token
  // Clonamos porque las requests son inmutables en Angular
  const reqConToken = token
    ? req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      })
    : req;

  // Dejamos pasar la request y nos enganchamos en la response
  return next(reqConToken).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el backend devuelve 401, la sesión expiró o el token es inválido
      if (error.status === 401) {
        authService.logout(); // limpiamos localStorage
        router.navigate(['/login']);
      }
      // Propagamos el error para que el componente también pueda manejarlo si quiere
      return throwError(() => error);
    }),
  );
};
