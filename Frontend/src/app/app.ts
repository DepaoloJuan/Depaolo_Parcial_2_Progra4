import { Component, inject, OnDestroy, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  private authService = inject(AuthService);

  // effect() se re-ejecuta automáticamente cada vez que cambia usuarioActual()
  // Así el contador arranca al loguearse y se detiene al hacer logout, sin importar desde dónde
  private sesionEffect = effect(() => {
    const usuario = this.authService.usuarioActual();
    if (usuario) {
      this.authService.iniciarContador(); // arranca el timer de 10 minutos
    } else {
      this.authService.detenerContador(); // limpia el timer si el usuario se deslogueó
    }
  });

  constructor() {
    // Escuchamos el CustomEvent que dispara auth.service cuando se acaba el timer
    window.addEventListener('sesion-por-vencer', this.mostrarModal);
  }

  ngOnDestroy(): void {
    // Limpiamos el listener para evitar memory leaks si el componente se destruye
    window.removeEventListener('sesion-por-vencer', this.mostrarModal);
  }

  // Arrow function para que 'this' apunte al componente cuando lo llama el event listener
  mostrarModal = (): void => {
    const modal = document.getElementById('modalSesion');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap?.Modal.getOrCreateInstance(modal);
      bootstrapModal?.show();
    }
  };

  extenderSesion(): void {
    this.authService.refrescar().subscribe({
      next: () => {
        // Token nuevo recibido → reiniciamos el contador para tener otros 10 minutos
        this.authService.iniciarContador();
        this.ocultarModal();
      },
      error: () => {
        // Si el refresh falla (token ya vencido), cerramos sesión
        this.authService.logout();
      },
    });
  }

  cerrarModal(): void {
    this.ocultarModal();
    this.authService.logout(); // el usuario eligió no extender → cerramos sesión
  }

  private ocultarModal(): void {
    const modal = document.getElementById('modalSesion');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap?.Modal.getOrCreateInstance(modal);
      bootstrapModal?.hide();
    }
  }
}
