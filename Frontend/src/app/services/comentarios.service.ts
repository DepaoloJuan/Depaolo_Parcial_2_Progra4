import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Comentario {
  _id: string;
  publicacionId: string;
  usuarioId: {
    _id: string;
    nombreUsuario: string;
    fotoPerfil: string;
  };
  mensaje: string;
  modificado: boolean;
  activo: boolean;
  createdAt: string;
}

export interface RespuestaComentarios {
  comentarios: Comentario[];
  total: number;
  offset: number;
  limit: number;
  hayMas: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ComentariosService {
  private http = inject(HttpClient);

  listar(publicacionId: string, offset = 0, limit = 5): Observable<RespuestaComentarios> {
    return this.http.get<RespuestaComentarios>(
      `${environment.apiUrl}/comentarios/${publicacionId}?offset=${offset}&limit=${limit}`,
    );
  }

  crear(publicacionId: string, usuarioId: string, mensaje: string): Observable<Comentario> {
    return this.http.post<Comentario>(`${environment.apiUrl}/comentarios`, {
      publicacionId,
      usuarioId,
      mensaje,
    });
  }

  actualizar(id: string, mensaje: string, usuarioId: string): Observable<Comentario> {
    return this.http.put<Comentario>(
      `${environment.apiUrl}/comentarios/${id}?usuarioId=${usuarioId}`,
      { mensaje },
    );
  }
}
