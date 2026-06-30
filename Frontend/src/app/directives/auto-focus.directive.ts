import { Directive, ElementRef, OnInit } from '@angular/core';

/**
 * Directiva propia que enfoca automáticamente el elemento host al inicializarse.
 * El setTimeout con delay 0 es necesario para que el foco se aplique después de
 * que Angular termine el ciclo de renderizado actual (especialmente en modales
 * o secciones que se muestran con @if).
 *
 * Uso en template: <input appAutoFocus />
 */
@Directive({ selector: '[appAutoFocus]', standalone: true })
export class AutoFocusDirective implements OnInit {
  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    setTimeout(() => this.el.nativeElement.focus(), 0);
  }
}
