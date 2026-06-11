import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { TarjetaPublicacion } from '../../components/tarjeta-publicacion/tarjeta-publicacion';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { Publicacion } from '../../models/publicacion.model';

@Component({
  selector: 'app-mi-perfil',
  imports: [Navbar, TarjetaPublicacion, DatePipe],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  private authService = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);

  usuarioActual = this.authService.usuarioActual;
  publicaciones = signal<Publicacion[]>([]);
  cargando = signal(false);

  ngOnInit(): void {
    const usuario = this.usuarioActual();
    if (usuario) {
      this.cargarPublicaciones(usuario.id);
    }
  }

  private cargarPublicaciones(usuarioId: string): void {
    this.cargando.set(true);
    this.publicacionesService.listar(0, 3, 'fecha', usuarioId).subscribe({
      next: (resp) => {
        this.publicaciones.set(resp.data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  onPublicacionEliminada(id: string): void {
    this.publicaciones.update((prev) => prev.filter((p) => p.id !== id));
  }

  onLikeActualizado(): void {
    const usuario = this.usuarioActual();
    if (usuario) this.cargarPublicaciones(usuario.id);
  }
}
