import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EstadisticasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/estadisticas`;

  publicacionesPorUsuario(desde: string, hasta: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/publicaciones-por-usuario?desde=${desde}&hasta=${hasta}`,
    );
  }

  comentariosPorTiempo(desde: string, hasta: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/comentarios-por-tiempo?desde=${desde}&hasta=${hasta}`,
    );
  }

  comentariosPorPublicacion(desde: string, hasta: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/comentarios-por-publicacion?desde=${desde}&hasta=${hasta}`,
    );
  }
}
