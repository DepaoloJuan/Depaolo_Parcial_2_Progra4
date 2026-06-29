import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ES_PUBLICA_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Primero fijamos si la ruta tiene el decorador @Publica()
    const esPublica = this.reflector.getAllAndOverride<boolean>(
      ES_PUBLICA_KEY,
      [
        context.getHandler(), // busca en el método
        context.getClass(), // busca en el controller
      ],
    );

    // Si es pública, dejamos pasar sin verificar token
    if (esPublica) return true;

    // Si no es pública, delegamos la verificación a Passport (usa JwtStrategy)
    return super.canActivate(context);
  }
}
