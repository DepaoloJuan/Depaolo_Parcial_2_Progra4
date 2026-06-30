import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Publicacion, RespuestaPublicaciones } from '../models/publicacion.model';
import { environment } from '../../environments/environment';

/**
 * Servicio HTTP para el módulo de publicaciones.
 * Encapsula todas las llamadas a la API REST de publicaciones.
 * usuarioId nunca se manda en body/query para operaciones protegidas —
 * el backend lo extrae del token JWT via @UsuarioActual.
 */
@Injectable({
  providedIn: 'root',
})
export class PublicacionesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/publicaciones`;

  /**
   * Obtiene publicaciones paginadas y ordenadas.
   * HttpParams construye el query string de forma segura (codifica los valores).
   * @param usuarioId Si se provee, filtra las publicaciones de ese usuario (mi-perfil).
   */
  listar(
    offset: number = 0,
    limit: number = 10,
    ordenarPor: 'fecha' | 'likes' = 'fecha',
    usuarioId?: string,
  ): Observable<RespuestaPublicaciones> {
    let params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit)
      .set('ordenarPor', ordenarPor);

    if (usuarioId) {
      params = params.set('usuarioId', usuarioId);
    }

    return this.http.get<RespuestaPublicaciones>(this.apiUrl, { params });
  }

  /** Crea una publicación. FormData permite enviar imagen + texto en un solo request. */
  crear(formData: FormData): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.apiUrl, formData);
  }

  /** Elimina lógicamente una publicación. El backend autoriza via token JWT. */
  eliminar(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`);
  }

  /** Agrega un like. El backend identifica al usuario via token JWT. */
  darLike(publicacionId: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/${publicacionId}/likes`, {});
  }

  /**
   * Quita un like. El backend identifica al usuario via token JWT.
   * El body vacío es necesario porque HttpClient requiere un body en DELETE con `body`.
   */
  quitarLike(publicacionId: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${publicacionId}/likes`);
  }

  obtenerPorId(id: string): Observable<Publicacion> {
    return this.http.get<Publicacion>(`${this.apiUrl}/${id}`);
  }
}
