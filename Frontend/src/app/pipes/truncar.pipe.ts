import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe propia que recorta un string al límite de caracteres indicado
 * y agrega "…" al final si fue truncado.
 * Útil para mostrar descripciones largas en tablas o listas compactas.
 *
 * Uso en template: {{ usuario.descripcion | truncar:50 }}
 * El parámetro límite es opcional; por defecto son 80 caracteres.
 */
@Pipe({ name: 'truncar', standalone: true })
export class TruncarPipe implements PipeTransform {
  transform(value: string | null | undefined, limite: number = 80): string {
    if (!value) return '';
    return value.length <= limite ? value : value.slice(0, limite) + '…';
  }
}
