import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment';

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
  private readonly TOKEN_KEY = 'token';

  // Signal privada — solo este servicio puede modificarla; los componentes la leen via usuarioActual
  private _usuarioActual = signal<Usuario | null>(this.cargarUsuarioStorage());
  usuarioActual = this._usuarioActual.asReadonly();

  registro(datos: FormData): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${environment.apiUrl}/autenticacion/registro`, datos)
      .pipe(
        tap((respuesta) => {
          this.guardarSesion(respuesta.token, respuesta.usuario);
          this.router.navigate(['/publicaciones']);
        }),
      );
  }

  login(identificador: string, contrasenia: string): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${environment.apiUrl}/autenticacion/login`, { identificador, contrasenia })
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
        // Sincronizamos localStorage y la signal para que todos los componentes se actualicen
        localStorage.setItem(this.USUARIO_KEY, JSON.stringify(usuario));
        this._usuarioActual.set(usuario);
      }),
    );
  }

  // El interceptor agrega el token automáticamente — no hace falta pasarlo manualmente acá
  autorizar(): Observable<Usuario> {
    const token = this.getToken();
    return this.http.post<Usuario>(`${environment.apiUrl}/autenticacion/autorizar`, { token });
  }

  refrescar(): Observable<RespuestaAuth> {
    const token = this.getToken();
    return this.http
      .post<RespuestaAuth>(`${environment.apiUrl}/autenticacion/refrescar`, { token })
      .pipe(
        tap((respuesta) => {
          // Guardamos el nuevo token en localStorage para que el interceptor lo use en los siguientes requests
          this.guardarSesion(respuesta.token, respuesta.usuario);
        }),
      );
  }

  // --- Contador de sesión ---

  private contadorTimer: any = null;

  iniciarContador(): void {
    this.detenerContador(); // cancelamos cualquier timer anterior antes de iniciar uno nuevo

    // Disparamos el evento a los 10 minutos — el token vence a los 15, dando 5 min para decidir
    this.contadorTimer = setTimeout(() => {
      this.mostrarModalSesion();
    }, 10 * 60 * 1000);
  }

  detenerContador(): void {
    if (this.contadorTimer) {
      clearTimeout(this.contadorTimer);
      this.contadorTimer = null;
    }
  }

  private mostrarModalSesion(): void {
    // Usamos un CustomEvent para comunicarnos con app.ts sin crear dependencias directas
    window.dispatchEvent(new CustomEvent('sesion-por-vencer'));
  }

  logout(): void {
    this.detenerContador();
    localStorage.removeItem(this.USUARIO_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this._usuarioActual.set(null);
    this.router.navigate(['/login']);
  }

  // Lo llama el interceptor para inyectar el token en cada request HTTP
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  estaLogueado(): boolean {
    return this._usuarioActual() !== null;
  }

  // computed() se recalcula automáticamente cuando cambia usuarioActual
  esAdmin = computed(() => this._usuarioActual()?.perfil === 'administrador');

  // Un único lugar para guardar token + usuario — evita inconsistencias entre ambos
  private guardarSesion(token: string, usuario: Usuario): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USUARIO_KEY, JSON.stringify(usuario));
    this._usuarioActual.set(usuario);
  }

  // Se llama al inicializar el servicio (antes del primer request) para restaurar la sesión sin llamar al backend
  private cargarUsuarioStorage(): Usuario | null {
    const usuario = localStorage.getItem(this.USUARIO_KEY);
    return usuario ? JSON.parse(usuario) : null;
  }
}
