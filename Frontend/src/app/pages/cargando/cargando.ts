import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

    // Si no hay token guardado, mandamos directo al login sin llamar al backend
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Si hay token, lo validamos contra el backend
    this.authService.autorizar().subscribe({
      next: (usuario) => {
        // Token válido — navegamos a publicaciones
        this.router.navigate(['/publicaciones']);
      },
      error: () => {
        // Token inválido o vencido — limpiamos y mandamos al login
        this.authService.logout();
        this.router.navigate(['/login']);
      },
    });
  }
}
