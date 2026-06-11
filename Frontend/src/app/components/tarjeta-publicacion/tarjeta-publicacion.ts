import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Publicacion } from '../../models/publicacion.model';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';

@Component({
  selector: 'app-tarjeta-publicacion',
  imports: [DatePipe],
  templateUrl: './tarjeta-publicacion.html',
  styleUrl: './tarjeta-publicacion.css',
})
export class TarjetaPublicacion {
  @Input() publicacion!: Publicacion;
  @Output() publicacionEliminada = new EventEmitter<string>();
  @Output() likeActualizado = new EventEmitter<string>();

  private authService = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);

  usuarioActual = this.authService.usuarioActual;

  // computed: el usuario actual ya dio like a esta publicación?
  yaLikeo = computed(() => {
    const usuario = this.usuarioActual();
    if (!usuario) return false;
    return this.publicacion.likes.includes(usuario.id);
  });

  // computed: el usuario actual puede eliminar esta publicación?
  puedeEliminar = computed(() => {
    const usuario = this.usuarioActual();
    if (!usuario) return false;
    return usuario.id === this.publicacion.usuario.id || usuario.perfil === 'administrador';
  });

  toggleLike(): void {
    const usuario = this.usuarioActual();
    if (!usuario) return;

    const accion = this.yaLikeo()
      ? this.publicacionesService.quitarLike(this.publicacion.id, usuario.id)
      : this.publicacionesService.darLike(this.publicacion.id, usuario.id);

    accion.subscribe({
      next: () => this.likeActualizado.emit(this.publicacion.id),
      error: (err) => console.error(err),
    });
  }

  eliminar(): void {
    const usuario = this.usuarioActual();
    if (!usuario) return;

    this.publicacionesService.eliminar(this.publicacion.id, usuario.id, usuario.perfil).subscribe({
      next: () => this.publicacionEliminada.emit(this.publicacion.id),
      error: (err) => console.error(err),
    });
  }
}
