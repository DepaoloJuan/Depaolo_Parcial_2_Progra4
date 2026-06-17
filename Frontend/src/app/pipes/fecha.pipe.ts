import { Pipe, PipeTransform } from '@angular/core';
//transforma una fecha ISO en "hace X minutos/horas/días"
@Pipe({
  name: 'fechaRelativa',
  standalone: true,
})
export class FechaRelativaPipe implements PipeTransform {
  transform(fecha: string | Date): string {
    const ahora = new Date();
    const fechaObj = new Date(fecha);
    const diferencia = ahora.getTime() - fechaObj.getTime();

    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);

    if (minutos < 1) return 'Justo ahora';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
    if (dias < 30) return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;
    return fechaObj.toLocaleDateString('es-AR');
  }
}
