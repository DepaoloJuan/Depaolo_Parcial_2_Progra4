import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** Shape del dato devuelto por /publicaciones-por-usuario */
export interface PublicacionPorUsuario {
  nombreUsuario: string;
  cantidad: number;
}

/** Shape del dato devuelto por /comentarios-por-tiempo */
export interface ComentarioPorTiempo {
  fecha: string;   // formato 'YYYY-MM-DD'
  cantidad: number;
}

/** Shape del dato devuelto por /comentarios-por-publicacion */
export interface ComentarioPorPublicacion {
  titulo: string;
  cantidad: number;
}

/**
 * Servicio frontend para el dashboard de estadísticas.
 * Consume los tres endpoints de agregación del backend, pasando el rango
 * de fechas como query params (?desde=YYYY-MM-DD&hasta=YYYY-MM-DD).
 * Si el backend no recibe las fechas, aplica un rango por defecto de 30 días.
 */
@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/publicaciones/estadisticas`;

  publicacionesPorUsuario(desde: string, hasta: string): Observable<PublicacionPorUsuario[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<PublicacionPorUsuario[]>(`${this.apiUrl}/publicaciones-por-usuario`, { params });
  }

  comentariosPorTiempo(desde: string, hasta: string): Observable<ComentarioPorTiempo[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<ComentarioPorTiempo[]>(`${this.apiUrl}/comentarios-por-tiempo`, { params });
  }

  comentariosPorPublicacion(desde: string, hasta: string): Observable<ComentarioPorPublicacion[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<ComentarioPorPublicacion[]>(`${this.apiUrl}/comentarios-por-publicacion`, { params });
  }
}
