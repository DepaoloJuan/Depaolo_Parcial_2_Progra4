import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

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
    provideHttpClient(),
  ],
};
