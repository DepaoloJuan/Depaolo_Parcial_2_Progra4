import { Component, inject, signal, computed, OnInit } from '@angular/core';
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

  // --- Estado del listado ---
  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);
  paginaActual = signal(1);
  limit = 10;
  ordenarPor = signal<'fecha' | 'likes'>('fecha');
  cargando = signal(false);

  totalPaginas = computed(() => Math.ceil(this.total() / this.limit));
  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));

  formulario: FormGroup = this.buildForm();
  imagenSeleccionada = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
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

  cargarPublicaciones(): void {
    this.cargando.set(true);
    const offset = (this.paginaActual() - 1) * this.limit;
    this.publicacionesService.listar(offset, this.limit, this.ordenarPor()).subscribe({
      next: (resp) => {
        this.publicaciones.set(resp.data);
        this.total.set(resp.total);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  irAPagina(n: number): void {
    this.paginaActual.set(n);
    this.cargarPublicaciones();
  }

  paginaAnterior(): void {
    if (this.paginaActual() > 1) this.irAPagina(this.paginaActual() - 1);
  }

  paginaSiguiente(): void {
    if (this.paginaActual() < this.totalPaginas()) this.irAPagina(this.paginaActual() + 1);
  }

  /** Cambia el criterio de ordenamiento y recarga desde el principio. */
  cambiarOrden(orden: 'fecha' | 'likes'): void {
    this.ordenarPor.set(orden);
    this.paginaActual.set(1);
    this.cargarPublicaciones();
  }

  onImagenSeleccionada(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.imagenSeleccionada.set(file);
      this.previewUrl.set(URL.createObjectURL(file));
    }
  }

  quitarImagen(): void {
    this.imagenSeleccionada.set(null);
    this.previewUrl.set(null);
  }

  abrirSelectorImagen(): void {
    document.getElementById('fileInputPublicacion')?.click();
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
    if (this.imagenSeleccionada()) {
      formData.append('imagen', this.imagenSeleccionada()!);
    }

    this.publicacionesService.crear(formData).subscribe({
      next: () => {
        this.creando.set(false);
        this.resetFormulario();
        this.cerrarModalCrear();
        this.paginaActual.set(1);
        this.cargarPublicaciones();
      },
      error: (err) => {
        this.creando.set(false);
        this.errorCrear.set(err.error?.message ?? 'Error al crear la publicación');
      },
    });
  }

  onPublicacionEliminada(_id: string): void {
    if (this.publicaciones().length === 1 && this.paginaActual() > 1) {
      this.paginaActual.update((v) => v - 1);
    }
    this.cargarPublicaciones();
  }

  onLikeActualizado(_id: string): void {
    // No se recarga la lista: TarjetaPublicacion actualiza su propio estado local de likes
  }

  resetFormulario(): void {
    this.formulario.reset();
    this.imagenSeleccionada.set(null);
    this.previewUrl.set(null);
    this.errorCrear.set(null);
  }

  private cerrarModalCrear(): void {
    const modal = document.getElementById('modalCrearPublicacion');
    if (modal) {
      const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
      bsModal?.hide();
    }
  }

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control?.invalid && control?.touched);
  }
}
