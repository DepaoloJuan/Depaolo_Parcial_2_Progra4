import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * Directiva propia que resalta el elemento host al pasar el cursor por encima,
 * aplicando un color de fondo con transición suave.
 * Al salir el cursor, el color de fondo se restaura al valor original.
 *
 * El color se puede personalizar vía @Input; por defecto es un azul muy claro.
 *
 * Uso en template:
 *   <tr appResaltar>                     → color por defecto (#eef4fb)
 *   <tr [appResaltar]="'#fff3cd'">       → color personalizado
 */
@Directive({ selector: '[appResaltar]', standalone: true })
export class ResaltarDirective {
  @Input() appResaltar: string = '#eef4fb';

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('mouseenter') onEnter(): void {
    this.el.nativeElement.style.backgroundColor = this.appResaltar;
    this.el.nativeElement.style.transition = 'background-color 0.15s ease';
    this.el.nativeElement.style.cursor = 'default';
  }

  @HostListener('mouseleave') onLeave(): void {
    this.el.nativeElement.style.backgroundColor = '';
  }
}
