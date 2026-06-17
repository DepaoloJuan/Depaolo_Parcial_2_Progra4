import { Component, Input, Output, EventEmitter, inject, computed, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Publicacion } from '../../models/publicacion.model';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';

@Component({
  selector: 'app-tarjeta-publicacion',
  imports: [DatePipe],
  templateUrl: './tarjeta-publicacion.html',
  styleUrl: './tarjeta-publicacion.css',
})
export class TarjetaPublicacion implements OnInit {
  @Input() publicacion!: Publicacion;
  @Output() publicacionEliminada = new EventEmitter<string>();
  @Output() likeActualizado = new EventEmitter<string>();

  private authService = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);
  private router = inject(Router);

  usuarioActual = this.authService.usuarioActual;

  likes = signal<string[]>([]);

  ngOnInit(): void {
    this.likes.set(this.publicacion.likes);
  }

  yaLikeo = computed(() => {
    const usuario = this.usuarioActual();
    if (!usuario) return false;
    return this.likes().includes(usuario.id);
  });

  puedeEliminar = computed(() => {
    const usuario = this.usuarioActual();
    if (!usuario) return false;
    return (
      usuario.id === this.publicacion.usuario.id ||
      usuario.perfil === 'administrador'
    );
  });

  toggleLike(): void {
    const usuario = this.usuarioActual();
    if (!usuario) return;

    const accion = this.yaLikeo()
      ? this.publicacionesService.quitarLike(this.publicacion.id, usuario.id)
      : this.publicacionesService.darLike(this.publicacion.id, usuario.id);

    accion.subscribe({
      next: () => {
        if (this.yaLikeo()) {
          this.likes.update(prev => prev.filter(id => id !== usuario.id));
        } else {
          this.likes.update(prev => [...prev, usuario.id]);
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
      .eliminar(this.publicacion.id, usuario.id, usuario.perfil)
      .subscribe({
        next: () => this.publicacionEliminada.emit(this.publicacion.id),
        error: (err) => console.error(err),
      });
  }
}
