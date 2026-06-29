import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Le decimos que el token viene en el header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Si el token está vencido, que lo rechace (no lo ignore)
      ignoreExpiration: false,
      // La clave secreta para verificar la firma del token
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // Este método se ejecuta DESPUÉS de que Passport verificó que el token es válido
  // payload es el contenido que metimos adentro del token cuando lo generamos
  async validate(payload: {
    sub: string;
    nombreUsuario: string;
    perfil: string;
  }) {
    // Lo que retornamos acá queda disponible como req.user en los controllers
    return {
      usuarioId: payload.sub,
      nombreUsuario: payload.nombreUsuario,
      perfil: payload.perfil,
    };
  }
}
