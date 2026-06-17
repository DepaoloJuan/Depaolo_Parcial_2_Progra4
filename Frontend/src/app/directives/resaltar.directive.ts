import { Directive, ElementRef, HostListener, Input } from '@angular/core';
//resalta un elemento al hacer hover
@Directive({
  selector: '[appResaltar]',
  standalone: true,
})
export class ResaltarDirective {
  @Input() appResaltar: string = '#f0f2f5'; // color de fondo al hacer hover

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.el.nativeElement.style.backgroundColor = this.appResaltar;
    this.el.nativeElement.style.transition = 'background-color 0.2s ease';
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.el.nativeElement.style.backgroundColor = '';
  }
}
