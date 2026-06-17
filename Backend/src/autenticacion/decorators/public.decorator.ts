import { SetMetadata } from '@nestjs/common';

// Esta clave es la que el guard va a buscar para saber si la ruta es pública
export const ES_PUBLICA_KEY = 'esPublica';

// El decorador simplemente pega el metadata 'esPublica: true' en la ruta
export const Publica = () => SetMetadata(ES_PUBLICA_KEY, true);
