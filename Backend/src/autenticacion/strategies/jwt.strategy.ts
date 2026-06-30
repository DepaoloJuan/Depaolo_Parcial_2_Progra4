import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Extraemos el token del header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // false: si el token venció, Passport lo rechaza automáticamente con 401
      ignoreExpiration: false,
      // El mismo secret que usamos en JwtModule para firmar — debe coincidir para validar la firma
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // validate() se ejecuta SOLO si Passport ya verificó que el token es válido y no está vencido
  // El payload es lo que guardamos adentro del token cuando lo generamos (sub, nombreUsuario, perfil)
  async validate(payload: { sub: string; nombreUsuario: string; perfil: string }) {
    // Lo que retornamos acá queda disponible como req.user en cualquier controller
    return {
      usuarioId: payload.sub,
      nombreUsuario: payload.nombreUsuario,
      perfil: payload.perfil,
    };
  }
}
