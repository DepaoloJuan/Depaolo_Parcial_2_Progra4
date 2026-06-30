import { SetMetadata } from '@nestjs/common';

// Clave que usa el RolesGuard para leer los roles requeridos de una ruta
export const ROLES_KEY = 'roles';

// @Roles('administrador') en un controller/método le dice al RolesGuard qué perfil se necesita
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
