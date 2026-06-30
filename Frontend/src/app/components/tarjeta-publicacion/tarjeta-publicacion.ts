import { Component, Input, Output, EventEmitter, inject, computed, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Publicacion } from '../../models/publicacion.model';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { DatePipe, SlicePipe } from '@angular/common';

/**
 * Componente de tarjeta de publicación.
 * Muestra los datos de una publicación y gestiona likes y eliminación de forma local,
 * sin recargar la lista completa del padre cuando sea posible.
 */
@Component({
  selector: 'app-tarjeta-publicacion',
  imports: [DatePipe, SlicePipe],
  templateUrl: './tarjeta-publicacion.html',
  styleUrl: './tarjeta-publicacion.css',
})
export class TarjetaPublicacion implements OnInit {
  @Input() publicacion!: Publicacion;

  /** Emite el id de la publicación eliminada para que el padre la quite del array. */
  @Output() publicacionEliminada = new EventEmitter<string>();

  /** Emite el id de la publicación cuando cambia el estado de like. */
  @Output() likeActualizado = new EventEmitter<string>();

  private authService = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);
  private router = inject(Router);

  usuarioActual = this.authService.usuarioActual;

  /**
   * Signal local con el array de IDs de usuarios que dieron like.
   * Se inicializa en ngOnInit con los datos del @Input y se actualiza
   * optimistamente al dar/quitar like, sin esperar respuesta del servidor.
   */
  likes = signal<string[]>([]);

  ngOnInit(): void {
    this.likes.set(this.publicacion.likes);
  }

  /**
   * Computed: devuelve true si el usuario logueado ya dio like a esta publicación.
   * Se recalcula automáticamente cada vez que cambian `likes` o `usuarioActual`.
   */
  yaLikeo = computed(() => {
    const usuario = this.usuarioActual();
    if (!usuario) return false;
    return this.likes().includes(usuario.id);
  });

  /**
   * Computed: devuelve true si el usuario puede eliminar esta publicación.
   */
  puedeEliminar = computed(() => {
    const usuario = this.usuarioActual();
    if (!usuario) return false;
    return usuario.id === this.publicacion.usuario.id;
  });

  /**
   * Alterna el like de la publicación.
   * La actualización del array `likes` se hace ANTES de la respuesta del servidor
   * (actualización optimista) para dar feedback inmediato al usuario.
   * Si el request falla, el error se loguea pero el estado local ya cambió.
   */
  toggleLike(): void {
    const usuario = this.usuarioActual();
    if (!usuario) return;

    const accion = this.yaLikeo()
      ? this.publicacionesService.quitarLike(this.publicacion.id)
      : this.publicacionesService.darLike(this.publicacion.id);

    accion.subscribe({
      next: () => {
        if (this.yaLikeo()) {
          // Quitar like: filtra el id del usuario del array
          this.likes.update((prev) => prev.filter((id) => id !== usuario.id));
        } else {
          // Agregar like: añade el id del usuario al array
          this.likes.update((prev) => [...prev, usuario.id]);
        }
        this.likeActualizado.emit(this.publicacion.id);
      },
      error: (err) => console.error(err),
    });
  }

  verDetalle(): void {
    this.router.navigate(['/publicacion', this.publicacion.id]);
  }

  eliminar(): void {
    const usuario = this.usuarioActual();
    if (!usuario) return;

    this.publicacionesService
      .eliminar(this.publicacion.id)
      .subscribe({
        next: () => this.publicacionEliminada.emit(this.publicacion.id),
        error: (err) => console.error(err),
      });
  }
}
