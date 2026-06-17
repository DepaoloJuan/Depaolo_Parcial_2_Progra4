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

  private sesionEffect = effect(() => {
    const usuario = this.authService.usuarioActual();
    if (usuario) {
      this.authService.iniciarContador();
    } else {
      this.authService.detenerContador();
    }
  });

  constructor() {
    window.addEventListener('sesion-por-vencer', this.mostrarModal);
  }

  ngOnDestroy(): void {
    window.removeEventListener('sesion-por-vencer', this.mostrarModal);
  }

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
        this.authService.iniciarContador();
        this.ocultarModal();
      },
      error: () => {
        this.authService.logout();
      },
    });
  }

  cerrarModal(): void {
    this.ocultarModal();
    this.authService.logout();
  }

  private ocultarModal(): void {
    const modal = document.getElementById('modalSesion');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap?.Modal.getOrCreateInstance(modal);
      bootstrapModal?.hide();
    }
  }
}
