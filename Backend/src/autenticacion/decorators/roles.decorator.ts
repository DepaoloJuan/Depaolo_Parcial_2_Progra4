import { SetMetadata } from '@nestjs/common';

// Clave para identificar el metadata de roles
export const ROLES_KEY = 'roles';

// Recibe uno o más roles como parámetro y los pega en la ruta
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
