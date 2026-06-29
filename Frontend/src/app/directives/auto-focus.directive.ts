import { Directive, ElementRef, OnInit } from '@angular/core';
//hace foco automatico en un input al aparecer

@Directive({
  selector: '[appAutoFocus]',
  standalone: true,
})
export class AutoFocusDirective implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    // Pequeño delay para que el elemento esté en el DOM
    setTimeout(() => {
      this.el.nativeElement.focus();
    }, 100);
  }
}
