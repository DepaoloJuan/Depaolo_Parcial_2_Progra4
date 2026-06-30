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
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
