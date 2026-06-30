import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.estaLogueado()) return true;
  router.navigate(['/login']);
  return false;
};

const noAuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.estaLogueado()) return true;
  router.navigate(['/publicaciones']);
  return false;
};

const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.esAdmin()) return true;
  router.navigate(['/publicaciones']);
  return false;
};

/**
 * Configuración de rutas de la aplicación.
 * Todas las páginas usan lazy loading (loadComponent) para que Angular genere
 * un chunk separado por ruta y reduzca el bundle inicial.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/cargando/cargando').then((m) => m.Cargando),
  },
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'publicaciones',
        loadComponent: () =>
          import('./pages/publicaciones/publicaciones').then((m) => m.Publicaciones),
      },
      {
        path: 'mi-perfil',
        loadComponent: () => import('./pages/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
      },
      {
        path: 'publicacion/:id',
        loadComponent: () =>
          import('./pages/detalle-publicacion/detalle-publicacion').then(
            (m) => m.DetallePublicacion,
          ),
      },
      {
        path: 'dashboard',
        canActivate: [adminGuard],
        children: [
          {
            path: 'usuarios',
            loadComponent: () =>
              import('./pages/dashboard/usuarios/usuarios').then((m) => m.Usuarios),
          },
          {
            path: 'estadisticas',
            loadComponent: () =>
              import('./pages/dashboard/estadisticas/estadisticas').then((m) => m.Estadisticas),
          },
          {
            path: '',
            redirectTo: 'usuarios',
            pathMatch: 'full',
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
