import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly USUARIO_KEY = 'usuario';

  // señal con el usuario logueado — null si no hay sesión
  private _usuarioActual = signal<Usuario | null>(this.cargarUsuarioStorage());

  // exponemos la señal como readonly para que los componentes solo puedan leerla
  usuarioActual = this._usuarioActual.asReadonly();

  registro(datos: FormData): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${environment.apiUrl}/autenticacion/registro`, datos)
      .pipe(
        tap(() => {
          this.router.navigate(['/login']);
        }),
      );
  }

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
          // la navegación va en el servicio, no en el componente
          this.router.navigate(['/publicaciones']);
        }),
      );
  }

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

  private cargarUsuarioStorage(): Usuario | null {
    const usuario = localStorage.getItem(this.USUARIO_KEY);
    return usuario ? JSON.parse(usuario) : null;
  }
}
