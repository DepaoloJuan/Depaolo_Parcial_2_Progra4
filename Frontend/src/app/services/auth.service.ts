import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment';

// Tipamos la respuesta del backend que ahora devuelve token + usuario
interface RespuestaAuth {
  token: string;
  usuario: Usuario;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly USUARIO_KEY = 'usuario';
  private readonly TOKEN_KEY = 'token'; // ← nuevo

  private _usuarioActual = signal<Usuario | null>(this.cargarUsuarioStorage());
  usuarioActual = this._usuarioActual.asReadonly();

  registro(datos: FormData): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${environment.apiUrl}/autenticacion/registro`, datos)
      .pipe(
        tap((respuesta) => {
          // Guardamos token y usuario al registrarse — el usuario ya queda logueado
          this.guardarSesion(respuesta.token, respuesta.usuario);
          this.router.navigate(['/publicaciones']);
        }),
      );
  }

  login(identificador: string, contrasenia: string): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${environment.apiUrl}/autenticacion/login`, {
        identificador,
        contrasenia,
      })
      .pipe(
        tap((respuesta) => {
          this.guardarSesion(respuesta.token, respuesta.usuario);
          this.router.navigate(['/publicaciones']);
        }),
      );
  }

  actualizarPerfil(id: string, datos: FormData): Observable<Usuario> {
    return this.http.put<Usuario>(`${environment.apiUrl}/usuarios/${id}`, datos).pipe(
      tap((usuario) => {
        localStorage.setItem(this.USUARIO_KEY, JSON.stringify(usuario));
        this._usuarioActual.set(usuario);
      }),
    );
  }

  // Valida el token contra el backend — lo usará el spinner al arrancar la app
  autorizar(): Observable<Usuario> {
    const token = this.getToken();
    return this.http.post<Usuario>(`${environment.apiUrl}/autenticacion/autorizar`, { token });
  }

  // Pide un token nuevo al backend — lo usará el modal de sesión
  refrescar(): Observable<RespuestaAuth> {
    const token = this.getToken();
    return this.http.post<RespuestaAuth>(`${environment.apiUrl}/autenticacion/refrescar`, {
      token,
    });
  }

  logout(): void {
    localStorage.removeItem(this.USUARIO_KEY);
    localStorage.removeItem(this.TOKEN_KEY); // ← nuevo
    this._usuarioActual.set(null);
    this.router.navigate(['/login']);
  }

  // El interceptor lo llama para agregar el token en cada request
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  estaLogueado(): boolean {
    return this._usuarioActual() !== null;
  }

  esAdmin(): boolean {
    return this._usuarioActual()?.perfil === 'administrador';
  }

  // Centraliza el guardado de sesión — un solo lugar para token + usuario
  private guardarSesion(token: string, usuario: Usuario): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USUARIO_KEY, JSON.stringify(usuario));
    this._usuarioActual.set(usuario);
  }

  private cargarUsuarioStorage(): Usuario | null {
    const usuario = localStorage.getItem(this.USUARIO_KEY);
    return usuario ? JSON.parse(usuario) : null;
  }
}
