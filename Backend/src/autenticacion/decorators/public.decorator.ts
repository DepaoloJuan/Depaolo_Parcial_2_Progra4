import { SetMetadata } from '@nestjs/common';

// Clave con la que el JwtAuthGuard va a buscar el metadata en cada ruta
export const ES_PUBLICA_KEY = 'esPublica';

// @Publica() marca una ruta para que el JwtAuthGuard la deje pasar sin token
// Se usa en login, registro, autorizar y refrescar — las únicas rutas que no requieren estar logueado
export const Publica = () => SetMetadata(ES_PUBLICA_KEY, true);
