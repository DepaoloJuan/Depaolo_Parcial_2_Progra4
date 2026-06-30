import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ES_PUBLICA_KEY } from '../decorators/public.decorator';

// Guard global: se ejecuta en CADA request antes de llegar al controller
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Reflector.getAllAndOverride busca el metadata primero en el método, luego en el controller
    // Esto permite que @Publica() en el controller cubra todos sus métodos
    const esPublica = this.reflector.getAllAndOverride<boolean>(ES_PUBLICA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta tiene @Publica(), la dejamos pasar sin verificar token
    if (esPublica) return true;

    // Para el resto, delegamos a Passport que invoca JwtStrategy.validate()
    return super.canActivate(context);
  }
}
