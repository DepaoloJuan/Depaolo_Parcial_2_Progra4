import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ComentariosService, Comentario } from '../../services/comentarios.service';
import { AuthService } from '../../services/auth.service';
import { Publicacion } from '../../models/publicacion.model';

@Component({
  selector: 'app-detalle-publicacion',
  standalone: true,
  imports: [Navbar, DatePipe, ReactiveFormsModule],
  templateUrl: './detalle-publicacion.html',
  styleUrl: './detalle-publicacion.css',
})
export class DetallePublicacion implements OnInit {
  private route = inject(ActivatedRoute);
  private publicacionesService = inject(PublicacionesService);
  private comentariosService = inject(ComentariosService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private location = inject(Location);

  usuarioActual = this.authService.usuarioActual;

  publicacion = signal<Publicacion | null>(null);
  likes = signal<string[]>([]);
  comentarios = signal<Comentario[]>([]);
  total = signal(0);
  offset = signal(0);
  limit = 5;
  hayMas = signal(false);
  cargando = signal(false);

  yaLikeo = computed(() => {
    const usuario = this.usuarioActual();
    if (!usuario) return false;
    return this.likes().includes(usuario.id);
  });

  cantidadLikes = computed(() => this.likes().length);

  // formulario nuevo comentario
  formulario: FormGroup = this.fb.group({
    mensaje: ['', [Validators.required, Validators.maxLength(500)]],
  });
  enviando = signal(false);

  // edición de comentario
  comentarioEditandoId = signal<string | null>(null);
  formularioEdicion: FormGroup = this.fb.group({
    mensaje: ['', [Validators.required, Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarPublicacion(id);
      this.cargarComentarios(id);
    }
  }

  private cargarPublicacion(id: string): void {
    this.publicacionesService.obtenerPorId(id).subscribe({
      next: (pub) => {
        this.publicacion.set(pub);
        this.likes.set(pub.likes);
      },
      error: (err) => console.error(err),
    });
  }

  cargarComentarios(publicacionId: string, reiniciar = true): void {
    if (reiniciar) {
      this.offset.set(0);
      this.comentarios.set([]);
    }
    this.cargando.set(true);

    this.comentariosService.listar(publicacionId, this.offset(), this.limit).subscribe({
      next: (resp) => {
        this.comentarios.update((prev) => [...prev, ...resp.comentarios]);
        this.total.set(resp.total);
        this.hayMas.set(resp.hayMas);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  cargarMas(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.offset.update((v) => v + this.limit);
    this.cargarComentarios(id, false);
  }

  enviarComentario(): void {
    if (this.formulario.invalid) return;
    const usuario = this.usuarioActual();
    const pub = this.publicacion();
    if (!usuario || !pub) return;

    this.enviando.set(true);
    this.comentariosService.crear(pub.id, usuario.id, this.formulario.value.mensaje).subscribe({
      next: (comentarioCreado) => {
        const usuario = this.usuarioActual()!;

        const comentarioConUsuario: Comentario = {
          ...comentarioCreado,
          usuarioId: {
            _id: usuario.id,
            nombreUsuario: usuario.nombreUsuario,
            fotoPerfil: usuario.fotoPerfil ?? '',
          },
        };

        this.comentarios.update((prev) => [comentarioConUsuario, ...prev]);
        this.total.update((v) => v + 1);
        this.formulario.reset();
        this.enviando.set(false);
      },
      error: () => this.enviando.set(false),
    });
  }

  iniciarEdicion(comentario: Comentario): void {
    this.comentarioEditandoId.set(comentario._id);
    this.formularioEdicion.setValue({ mensaje: comentario.mensaje });
  }

  cancelarEdicion(): void {
    this.comentarioEditandoId.set(null);
    this.formularioEdicion.reset();
  }

  guardarEdicion(comentarioId: string): void {
    if (this.formularioEdicion.invalid) return;
    const usuario = this.usuarioActual();
    if (!usuario) return;

    this.comentariosService
      .actualizar(comentarioId, this.formularioEdicion.value.mensaje, usuario.id)
      .subscribe({
        next: (actualizado) => {
          this.comentarios.update((prev) =>
            prev.map((c) => {
              if (c._id !== comentarioId) return c;
              return {
                ...c,
                mensaje: actualizado.mensaje,
                modificado: actualizado.modificado,
              };
            })
          );
          this.cancelarEdicion();
        },
        error: (err) => console.error(err),
      });
  }

  esMiComentario(comentario: Comentario): boolean {
    const usuario = this.usuarioActual();
    if (!usuario) return false;
    return comentario.usuarioId._id === usuario.id;
  }

  volver(): void {
    this.location.back();
  }

  toggleLike(): void {
    const usuario = this.usuarioActual();
    const pub = this.publicacion();
    if (!usuario || !pub) return;

    const accion = this.yaLikeo()
      ? this.publicacionesService.quitarLike(pub.id, usuario.id)
      : this.publicacionesService.darLike(pub.id, usuario.id);

    accion.subscribe({
      next: () => {
        if (this.yaLikeo()) {
          this.likes.update(prev => prev.filter(id => id !== usuario.id));
        } else {
          this.likes.update(prev => [...prev, usuario.id]);
        }
      },
    });
  }
}
