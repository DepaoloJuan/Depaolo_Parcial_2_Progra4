import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

// Guard para rutas protegidas: redirige al login si no hay sesión activa
const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.estaLogueado()) return true;
  router.navigate(['/login']);
  return false;
};

// Guard para rutas públicas (login/registro): redirige a publicaciones si ya hay sesión
// Evita que un usuario logueado navegue a /login y pierda su sesión
const noAuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.estaLogueado()) return true;
  router.navigate(['/publicaciones']);
  return false;
};

export const routes: Routes = [
  {
    // pathMatch: 'full' es necesario para que '' no matchee como prefijo de todas las rutas
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
    // Ruta padre sin componente — el authGuard se aplica una sola vez a todas las rutas hijas
    // Las hijas se renderizan en el <router-outlet> del ancestro más cercano (app.html)
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
    redirectTo: '', // cualquier ruta desconocida va a la pantalla de cargando
  },
];
