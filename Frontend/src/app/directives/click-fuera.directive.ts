import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

/**
 * Directiva propia que emite un evento cuando el usuario hace click
 * fuera del elemento host. Útil para cerrar paneles, formularios o dropdowns
 * sin depender de Bootstrap JS.
 *
 * El cast a Node es necesario porque $event.target viene tipado como
 * EventTarget | null, pero Node.contains() requiere Node.
 *
 * Uso en template:
 *   <div appClickFuera (clickFuera)="cerrar()">...</div>
 */
@Directive({ selector: '[appClickFuera]', standalone: true })
export class ClickFueraDirective {
  @Output() clickFuera = new EventEmitter<void>();

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event.target'])
  onClick(target: EventTarget | null): void {
    if (!this.el.nativeElement.contains(target as Node)) {
      this.clickFuera.emit();
    }
  }
}
