import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mi-perfil',
  imports: [Navbar, DatePipe],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil {
  private authService = inject(AuthService);

  usuarioActual = this.authService.usuarioActual;
}
