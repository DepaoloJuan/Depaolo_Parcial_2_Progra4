import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe propia que capitaliza la primera letra del string y deja el resto en minúsculas.
 * Usada principalmente para mostrar el campo 'perfil' ("usuario" → "Usuario").
 *
 * Uso en template: {{ usuario.perfil | primeraMayuscula }}
 */
@Pipe({ name: 'primeraMayuscula', standalone: true })
export class PrimeraMayusculaPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
