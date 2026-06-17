import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
//detecta clicks fuera de un elemento y emite un evento
@Directive({
  selector: '[appClickFuera]',
  standalone: true,
})
export class ClickFueraDirective {
  @Output() appClickFuera = new EventEmitter<void>();

  constructor(private el: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  onClick(target: EventTarget | null): void {
    if (!this.el.nativeElement.contains(target as Node)) {
      this.appClickFuera.emit();
    }
  }
}
