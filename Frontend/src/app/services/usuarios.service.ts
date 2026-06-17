import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  crear(datos: FormData): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, datos);
  }

  deshabilitar(id: string): Observable<Usuario> {
    return this.http.delete<Usuario>(`${this.apiUrl}/${id}`);
  }

  rehabilitar(id: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/${id}/rehabilitar`, {});
  }
}
