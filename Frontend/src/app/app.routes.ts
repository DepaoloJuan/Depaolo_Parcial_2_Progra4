import { Routes } from '@angular/router';

/**
 * Configuración de rutas de la aplicación.
 * Todas las páginas usan lazy loading (loadComponent) para que Angular genere
 * un chunk separado por ruta y reduzca el bundle inicial.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'publicaciones',
    pathMatch: 'full',
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
    // Ruta comodín: cualquier URL desconocida redirige al feed principal
    path: '**',
    redirectTo: 'publicaciones',
  },
];
