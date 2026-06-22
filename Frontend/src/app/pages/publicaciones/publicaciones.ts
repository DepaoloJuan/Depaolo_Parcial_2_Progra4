import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { TarjetaPublicacion } from '../../components/tarjeta-publicacion/tarjeta-publicacion';
import { PublicacionesService } from '../../services/publicaciones.service';
import { AuthService } from '../../services/auth.service';
import { Publicacion } from '../../models/publicacion.model';

@Component({
  selector: 'app-publicaciones',
  imports: [Navbar, TarjetaPublicacion, ReactiveFormsModule],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  private publicacionesService = inject(PublicacionesService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  usuarioActual = this.authService.usuarioActual;

  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);
  offset = signal(0);
  limit = 10;
  ordenarPor = signal<'fecha' | 'likes'>('fecha');
  cargando = signal(false);
  hayMas = signal(false);

  // formulario crear publicación
  mostrarFormulario = signal(false);
  formulario: FormGroup = this.buildForm();
  imagenSeleccionada = signal<File | null>(null);
  creando = signal(false);
  errorCrear = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarPublicaciones();
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  cargarPublicaciones(reiniciar = true): void {
    if (reiniciar) {
      this.offset.set(0);
      this.publicaciones.set([]);
    }

    this.cargando.set(true);

    this.publicacionesService.listar(this.offset(), this.limit, this.ordenarPor()).subscribe({
      next: (resp) => {
        this.publicaciones.update((prev) => [...prev, ...resp.data]);
        this.total.set(resp.total);
        this.hayMas.set(this.publicaciones().length < resp.total);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  cargarMas(): void {
    this.offset.update((v) => v + this.limit);
    this.cargarPublicaciones(false);
  }

  cambiarOrden(orden: 'fecha' | 'likes'): void {
    this.ordenarPor.set(orden);
    this.cargarPublicaciones();
  }

  onImagenSeleccionada(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    if (input.files?.length) {
      this.imagenSeleccionada.set(input.files[0]);
    }
  }

  onCrearPublicacion(): void {
    if (this.formulario.invalid) return;
    const usuario = this.usuarioActual();
    if (!usuario) return;

    this.creando.set(true);
    this.errorCrear.set(null);

    const formData = new FormData();
    formData.append('titulo', this.formulario.value.titulo);
    formData.append('descripcion', this.formulario.value.descripcion);
    formData.append('usuarioId', usuario.id);
    if (this.imagenSeleccionada()) {
      formData.append('imagen', this.imagenSeleccionada()!);
    }

    this.publicacionesService.crear(formData).subscribe({
      next: () => {
        this.creando.set(false);
        this.formulario.reset();
        this.imagenSeleccionada.set(null);
        this.mostrarFormulario.set(false);
        this.cargarPublicaciones();
      },
      error: (err) => {
        this.creando.set(false);
        this.errorCrear.set(err.error?.message ?? 'Error al crear la publicación');
      },
    });
  }

  onPublicacionEliminada(id: string): void {
    this.publicaciones.update((prev) => prev.filter((p) => p.id !== id));
    this.total.update((v) => v - 1);
  }

  onLikeActualizado(_id: string): void {
    // no recargamos — el componente tarjeta ya actualizó su estado local
  }

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control?.invalid && control?.touched);
  }
}
