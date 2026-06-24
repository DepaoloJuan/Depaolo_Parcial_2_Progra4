import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Barra de navegación principal.
 * Muestra el nombre de usuario logueado y los links activos del router.
 * RouterLinkActive aplica la clase CSS "active" al link de la ruta actual.
 */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private authService = inject(AuthService);

  /** Signal de solo lectura; el template la lee para mostrar nombre de usuario y foto. */
  usuarioActual = this.authService.usuarioActual;

  logout(): void {
    this.authService.logout();
  }
}
