import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment';

/**
 * Servicio de autenticación.
 * Gestiona el estado de la sesión con una Signal reactiva y lo persiste en localStorage
 * para que sobreviva recargas de página.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly USUARIO_KEY = 'usuario';

  /**
   * Signal privada con el usuario logueado.
   * Se inicializa leyendo localStorage para restaurar la sesión al cargar la app.
   * Los componentes no pueden modificarla directamente; solo leen `usuarioActual`.
   */
  private _usuarioActual = signal<Usuario | null>(this.cargarUsuarioStorage());

  /** Vista de solo lectura de la signal, expuesta a los componentes. */
  usuarioActual = this._usuarioActual.asReadonly();

  /**
   * Envía los datos de registro (FormData con imagen opcional) al backend.
   * Navega a /login tras el registro exitoso para que el usuario inicie sesión.
   */
  registro(datos: FormData): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${environment.apiUrl}/autenticacion/registro`, datos)
      .pipe(
        tap(() => {
          this.router.navigate(['/login']);
        }),
      );
  }

  /**
   * Valida credenciales contra el backend y persiste la sesión.
   * tap() ejecuta efectos secundarios sin transformar el Observable:
   * guarda en localStorage, actualiza la signal y navega al feed.
   */
  login(identificador: string, contrasenia: string): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${environment.apiUrl}/autenticacion/login`, {
        identificador,
        contrasenia,
      })
      .pipe(
        tap((usuario) => {
          localStorage.setItem(this.USUARIO_KEY, JSON.stringify(usuario));
          this._usuarioActual.set(usuario);
          this.router.navigate(['/publicaciones']);
        }),
      );
  }

  /**
   * Actualiza el perfil del usuario logueado y sincroniza la signal y el localStorage
   * para que todos los componentes que leen `usuarioActual` se actualicen reactivamente.
   */
  actualizarPerfil(id: string, datos: FormData): Observable<Usuario> {
    return this.http
      .put<Usuario>(`${environment.apiUrl}/usuarios/${id}`, datos)
      .pipe(
        tap((usuario) => {
          localStorage.setItem(this.USUARIO_KEY, JSON.stringify(usuario));
          this._usuarioActual.set(usuario);
        }),
      );
  }

  /** Limpia la sesión local y redirige al login. */
  logout(): void {
    localStorage.removeItem(this.USUARIO_KEY);
    this._usuarioActual.set(null);
    this.router.navigate(['/login']);
  }

  estaLogueado(): boolean {
    return this._usuarioActual() !== null;
  }

  esAdmin(): boolean {
    return this._usuarioActual()?.perfil === 'administrador';
  }

  /**
   * Restaura el usuario desde localStorage al inicializar el servicio.
   * Permite que la sesión persista entre recargas sin hacer un request al backend.
   */
  private cargarUsuarioStorage(): Usuario | null {
    const usuario = localStorage.getItem(this.USUARIO_KEY);
    return usuario ? JSON.parse(usuario) : null;
  }
}
