import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Pantalla inicial que valida el token antes de mostrar la app
// El usuario la ve solo un instante — mientras dura la llamada a /autorizar
@Component({
  selector: 'app-cargando',
  standalone: true,
  templateUrl: './cargando.html',
  styleUrl: './cargando.css',
})
export class Cargando implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const token = this.authService.getToken();

    // Si no hay token en localStorage, no tiene sentido llamar al backend — vamos directo al login
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Llamamos al backend para validar que el token no esté vencido ni manipulado
    this.authService.autorizar().subscribe({
      next: () => {
        // Token válido → el usuario ya estaba logueado, lo mandamos a publicaciones
        this.router.navigate(['/publicaciones']);
      },
      error: () => {
        // Token inválido o vencido → limpiamos la sesión y pedimos que se loguee de nuevo
        this.authService.logout();
        this.router.navigate(['/login']);
      },
    });
  }
}
