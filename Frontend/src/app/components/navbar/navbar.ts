import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Barra de navegación principal.
 * Muestra el nombre de usuario logueado y los links activos del router.
 * RouterLinkActive aplica la clase CSS "active" al link de la ruta actual.
 */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private authService = inject(AuthService);

  /** Signal de solo lectura; el template la lee para mostrar nombre de usuario y foto. */
  usuarioActual = this.authService.usuarioActual;
  esAdmin = this.authService.esAdmin;
  /**
   * Controla si el acordeón "Dashboard" está expandido dentro del dropdown del avatar.
   * Se maneja con un signal propio en lugar de Bootstrap collapse porque el click
   * en el botón de acordeón propagaba el evento y cerraba el dropdown; con
   * stopPropagation + signal manual el dropdown permanece abierto.
   */
  dashboardAbierto = signal(false);

  toggleDashboard(): void {
    this.dashboardAbierto.update((v) => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}
