import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { provideServiceWorker } from '@angular/service-worker';

/**
 * Configuración raíz de la aplicación Angular (equivalente al AppModule clásico).
 * Se usa el patrón standalone con providers funcionales en lugar de NgModules.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // eventCoalescing: agrupa múltiples eventos del DOM en un solo ciclo de detección
    // de cambios, mejorando el rendimiento en interacciones rápidas
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // withInterceptors registra los interceptores funcionales en orden
    provideHttpClient(withInterceptors([authInterceptor])), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ],
};
