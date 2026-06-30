import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Se ejecuta después de JwtAuthGuard — cuando llega acá, req.user ya está cargado por JwtStrategy
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Leemos los roles requeridos del metadata puesto por @Roles(...)
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta no tiene @Roles(), cualquier usuario autenticado puede acceder
    if (!rolesRequeridos) return true;

    // req.user lo cargó JwtStrategy.validate() con { usuarioId, nombreUsuario, perfil }
    const { user } = context.switchToHttp().getRequest();

    if (!user || !rolesRequeridos.includes(user.perfil)) {
      throw new ForbiddenException('No tenés permisos para acceder a este recurso');
    }

    return true;
  }
}
