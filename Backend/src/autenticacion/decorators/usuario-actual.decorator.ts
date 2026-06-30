import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador de parámetro que extrae el usuario autenticado de req.user.
 * req.user es poblado por JwtStrategy.validate() después de verificar el token.
 *
 * Uso sin key: @UsuarioActual() user — devuelve el objeto completo { usuarioId, nombreUsuario, perfil }
 * Uso con key:  @UsuarioActual('usuarioId') id — devuelve solo esa propiedad del objeto
 *
 * Esto reemplaza el patrón @Query('usuarioId') / @Body('usuarioId'), que permitía
 * que cualquier cliente con un token válido falsificara su identidad enviando
 * un usuarioId arbitrario en el query string o el body.
 */
export const UsuarioActual = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest();
    return data ? user?.[data] : user;
  },
);
