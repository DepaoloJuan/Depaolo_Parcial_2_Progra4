import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Publicacion, RespuestaPublicaciones } from '../models/publicacion.model';
import { environment } from '../../environments/environment';

/**
 * Servicio HTTP para el módulo de publicaciones.
 * Encapsula todas las llamadas a la API REST de publicaciones.
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

  /**
   * Elimina lógicamente una publicación.
   * usuarioId y perfil van como query params para que el backend verifique autorización
   * (en ausencia de JWT en esta versión de la app).
   */
  eliminar(id: string, usuarioId: string, perfil: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(
      `${this.apiUrl}/${id}?usuarioId=${usuarioId}&perfil=${perfil}`,
    );
  }

  /** Agrega un like; el body lleva el usuarioId para identificar quién likeó. */
  darLike(publicacionId: string, usuarioId: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/${publicacionId}/likes`, {
      usuarioId,
    });
  }

  /**
   * Quita un like. El usuarioId va en el body del DELETE porque HTTP no define
   * un body estándar para DELETE, pero Angular HttpClient lo soporta con la opción `body`.
   */
  quitarLike(publicacionId: string, usuarioId: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${publicacionId}/likes`, {
      body: { usuarioId },
    });
  }

  obtenerPorId(id: string): Observable<Publicacion> {
    return this.http.get<Publicacion>(`${this.apiUrl}/${id}`);
  }
}
