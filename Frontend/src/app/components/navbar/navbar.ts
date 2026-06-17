import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private authService = inject(AuthService);

  // exponemos la señal del usuario para el template
  usuarioActual = this.authService.usuarioActual;
  esAdmin = this.authService.esAdmin;

  logout(): void {
    this.authService.logout();
  }
}
