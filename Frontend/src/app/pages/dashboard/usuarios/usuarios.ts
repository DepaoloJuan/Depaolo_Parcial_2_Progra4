import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Navbar } from '../../../components/navbar/navbar';
import { UsuariosService } from '../../../services/usuarios.service';
import { Usuario } from '../../../models/usuario.model';
import { ResaltarDirective } from '../../../directives/resaltar.directive';
import { AutoFocusDirective } from '../../../directives/auto-focus.directive';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [Navbar, ReactiveFormsModule, ResaltarDirective, AutoFocusDirective],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  private usuariosService = inject(UsuariosService);
  private fb = inject(FormBuilder);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  // formulario crear usuario
  mostrarFormulario = signal(false);
  creando = signal(false);
  errorCrear = signal<string | null>(null);
  imagenSeleccionada = signal<File | null>(null);

  formulario: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', Validators.required],
    contrasenia: ['', [Validators.required, Validators.minLength(8)]],
    fechaNacimiento: ['', Validators.required],
    descripcion: [''],
    perfil: ['usuario', Validators.required], // radio buttons
  });

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar usuarios');
        this.cargando.set(false);
      },
    });
  }

  onImagenSeleccionada(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    if (input.files?.length) {
      this.imagenSeleccionada.set(input.files[0]);
    }
  }

  crearUsuario(): void {
    if (this.formulario.invalid) return;
    this.creando.set(true);
    this.errorCrear.set(null);

    const formData = new FormData();
    const valores = this.formulario.value;
    Object.keys(valores).forEach((key) => {
      if (valores[key]) formData.append(key, valores[key]);
    });
    if (this.imagenSeleccionada()) {
      formData.append('fotoPerfil', this.imagenSeleccionada()!);
    }

    this.usuariosService.crear(formData).subscribe({
      next: (usuario) => {
        this.usuarios.update((prev) => [...prev, usuario]);
        this.formulario.reset({ perfil: 'usuario' });
        this.imagenSeleccionada.set(null);
        this.mostrarFormulario.set(false);
        this.creando.set(false);
      },
      error: (err) => {
        this.errorCrear.set(err.error?.message ?? 'Error al crear usuario');
        this.creando.set(false);
      },
    });
  }

  deshabilitar(id: string): void {
    this.usuariosService.deshabilitar(id).subscribe({
      next: () => {
        this.usuarios.update((prev) =>
          prev.map((u) => (u.id === id ? { ...u, activo: false } : u)),
        );
      },
      error: () => this.error.set('Error al deshabilitar usuario'),
    });
  }

  rehabilitar(id: string): void {
    this.usuariosService.rehabilitar(id).subscribe({
      next: () => {
        this.usuarios.update((prev) => prev.map((u) => (u.id === id ? { ...u, activo: true } : u)));
      },
      error: () => this.error.set('Error al rehabilitar usuario'),
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control?.invalid && control?.touched);
  }
}
