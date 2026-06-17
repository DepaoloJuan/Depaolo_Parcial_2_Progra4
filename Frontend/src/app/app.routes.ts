import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.esAdmin()) return true;
  router.navigate(['/publicaciones']);
  return false;
};

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/cargando/cargando').then((m) => m.Cargando),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'publicaciones',
    loadComponent: () => import('./pages/publicaciones/publicaciones').then((m) => m.Publicaciones),
  },
  {
    path: 'mi-perfil',
    loadComponent: () => import('./pages/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
  },
  {
    path: 'publicacion/:id',
    loadComponent: () =>
      import('./pages/detalle-publicacion/detalle-publicacion').then((m) => m.DetallePublicacion),
  },
  {
    path: 'dashboard',
    canActivate: [adminGuard],
    children: [
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/dashboard/usuarios/usuarios').then((m) => m.Usuarios),
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
  {
    path: '**',
    redirectTo: '',
  },
];
