import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe propia que formatea una fecha al estilo "15 de enero de 2025".
 * Usa getUTCDate/getUTCMonth para evitar desfases de zona horaria cuando
 * la API devuelve fechas en formato ISO (ej: "2025-01-15T00:00:00.000Z").
 *
 * Uso en template: {{ usuario.createdAt | fecha }}
 */
@Pipe({ name: 'fecha', standalone: true })
export class FechaPipe implements PipeTransform {
  private meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];

  transform(value: string | Date | null | undefined): string {
    if (!value) return '';
    const fecha = new Date(value);
    if (isNaN(fecha.getTime())) return '';
    return `${fecha.getUTCDate()} de ${this.meses[fecha.getUTCMonth()]} de ${fecha.getUTCFullYear()}`;
  }
}
