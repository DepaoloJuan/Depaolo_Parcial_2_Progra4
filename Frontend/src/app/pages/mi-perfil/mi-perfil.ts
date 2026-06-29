import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { TarjetaPublicacion } from '../../components/tarjeta-publicacion/tarjeta-publicacion';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { Publicacion } from '../../models/publicacion.model';

@Component({
  selector: 'app-mi-perfil',
  imports: [Navbar, TarjetaPublicacion, DatePipe, ReactiveFormsModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  private authService = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);
  private fb = inject(FormBuilder);

  usuarioActual = this.authService.usuarioActual;
  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);
  paginaActual = signal(1);
  readonly limit = 3;
  cargando = signal(false);

  totalPaginas = computed(() => Math.ceil(this.total() / this.limit));
  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));
  guardando = signal(false);
  errorEditar = signal<string | null>(null);
  exitoEditar = signal(false);
  imagenSeleccionada = signal<File | null>(null);
  previsualizacion = signal<string | null>(null);

  formularioEditar: FormGroup = this.buildForm();
  mostrarFormulario = signal(false);
  formularioPublicacion: FormGroup = this.buildFormPublicacion();
  imagenPublicacion = signal<File | null>(null);
  creando = signal(false);
  errorCrear = signal<string | null>(null);

  ngOnInit(): void {
    const usuario = this.usuarioActual();
    if (usuario) {
      this.cargarPublicaciones(usuario.id);
      this.formularioEditar = this.buildForm();
    }
  }

  private buildForm(): FormGroup {
    const usuario = this.usuarioActual();
    return this.fb.group({
      nombre: [usuario?.nombre ?? ''],
      apellido: [usuario?.apellido ?? ''],
      descripcion: [usuario?.descripcion ?? ''],
      fechaNacimiento: [usuario?.fechaNacimiento?.substring(0, 10) ?? ''],
    });
  }

  private cargarPublicaciones(usuarioId: string): void {
    this.cargando.set(true);
    const offset = (this.paginaActual() - 1) * this.limit;
    this.publicacionesService.listar(offset, this.limit, 'fecha', usuarioId).subscribe({
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
    const usuario = this.usuarioActual();
    if (usuario) this.cargarPublicaciones(usuario.id);
  }

  paginaAnterior(): void {
    if (this.paginaActual() > 1) this.irAPagina(this.paginaActual() - 1);
  }

  paginaSiguiente(): void {
    if (this.paginaActual() < this.totalPaginas()) this.irAPagina(this.paginaActual() + 1);
  }

  onImagenSeleccionada(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    if (!input.files?.length) return;
    const archivo = input.files[0];
    this.imagenSeleccionada.set(archivo);
    const reader = new FileReader();
    reader.onload = (e) => this.previsualizacion.set(e.target?.result as string);
    reader.readAsDataURL(archivo);
  }

  onGuardarPerfil(): void {
    const usuario = this.usuarioActual();
    if (!usuario) return;

    this.guardando.set(true);
    this.errorEditar.set(null);

    const formData = new FormData();
    const valores = this.formularioEditar.value;
    if (valores.nombre) formData.append('nombre', valores.nombre);
    if (valores.apellido) formData.append('apellido', valores.apellido);
    if (valores.descripcion) formData.append('descripcion', valores.descripcion);
    if (valores.fechaNacimiento) formData.append('fechaNacimiento', valores.fechaNacimiento);
    if (this.imagenSeleccionada()) {
      formData.append('fotoPerfil', this.imagenSeleccionada()!);
    }

    this.authService.actualizarPerfil(usuario.id, formData).subscribe({
      next: () => {
        this.guardando.set(false);
        this.imagenSeleccionada.set(null);
        this.previsualizacion.set(null);
        this.exitoEditar.set(true);
        setTimeout(() => {
          this.exitoEditar.set(false);
          const modal = document.getElementById('modalEditarPerfil');
          if (modal) {
            const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
            bootstrapModal?.hide();
          }
        }, 2000);
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorEditar.set(err.error?.message ?? 'Error al guardar');
      },
    });
  }

  private buildFormPublicacion(): FormGroup {
    return this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  onImagenPublicacionSeleccionada(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    if (input.files?.length) {
      this.imagenPublicacion.set(input.files[0]);
    }
  }

  onCrearPublicacion(): void {
    if (this.formularioPublicacion.invalid) return;
    const usuario = this.usuarioActual();
    if (!usuario) return;

    this.creando.set(true);
    this.errorCrear.set(null);

    const formData = new FormData();
    formData.append('titulo', this.formularioPublicacion.value.titulo);
    formData.append('descripcion', this.formularioPublicacion.value.descripcion);
    formData.append('usuarioId', usuario.id);
    if (this.imagenPublicacion()) {
      formData.append('imagen', this.imagenPublicacion()!);
    }

    this.publicacionesService.crear(formData).subscribe({
      next: () => {
        this.creando.set(false);
        this.formularioPublicacion.reset();
        this.imagenPublicacion.set(null);
        this.mostrarFormulario.set(false);
        this.paginaActual.set(1);
        this.cargarPublicaciones(usuario.id);
      },
      error: (err) => {
        this.creando.set(false);
        this.errorCrear.set(err.error?.message ?? 'Error al publicar');
      },
    });
  }

  onPublicacionEliminada(_id: string): void {
    const usuario = this.usuarioActual();
    if (!usuario) return;
    if (this.publicaciones().length === 1 && this.paginaActual() > 1) {
      this.paginaActual.update((v) => v - 1);
    }
    this.cargarPublicaciones(usuario.id);
  }

  onLikeActualizado(): void {
    const usuario = this.usuarioActual();
    if (usuario) this.cargarPublicaciones(usuario.id);
  }
}
