import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Navbar } from '../../../components/navbar/navbar';
import { UsuariosService } from '../../../services/usuarios.service';
import { Usuario } from '../../../models/usuario.model';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { PrimeraMayusculaPipe } from '../../../pipes/primera-mayuscula.pipe';
import { TruncarPipe } from '../../../pipes/truncar.pipe';
import { AutoFocusDirective } from '../../../directives/auto-focus.directive';
import { ClickFueraDirective } from '../../../directives/click-fuera.directive';
import { ResaltarDirective } from '../../../directives/resaltar.directive';

/**
 * Validator personalizado: exige al menos una mayúscula y un dígito.
 * Campo vacío devuelve null para no colisionar con `required`.
 */
function contraseniaValida(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value ?? '';
  if (!val) return null;
  const tieneUpper = /[A-Z]/.test(val);
  const tieneNum = /\d/.test(val);
  return tieneUpper && tieneNum ? null : { contraseniaDébil: true };
}

@Component({
  selector: 'app-dashboard-usuarios',
  imports: [
    Navbar,
    ReactiveFormsModule,
    FechaPipe,
    PrimeraMayusculaPipe,
    TruncarPipe,
    AutoFocusDirective,
    ClickFueraDirective,
    ResaltarDirective,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
/**
 * Página de administración de usuarios del dashboard.
 * Usa las 3 pipes propias del sprint (FechaPipe, PrimeraMayusculaPipe, TruncarPipe)
 * y las 3 directivas propias (AutoFocus, ClickFuera, Resaltar).
 * Permite listar todos los usuarios, crear uno nuevo (admin o usuario) y
 * deshabilitar/rehabilitar cuentas mediante baja lógica.
 */
export class DashboardUsuarios implements OnInit {
  private usuariosService = inject(UsuariosService);
  private fb = inject(FormBuilder);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(false);
  error = signal('');
  mostrarFormulario = signal(false);
  fotoPreview = signal<string | null>(null);
  private fotoArchivo: File | null = null;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    apellido: ['', [Validators.required, Validators.maxLength(50)]],
    correo: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    contrasenia: ['', [Validators.required, Validators.minLength(8), contraseniaValida]],
    fechaNacimiento: ['', Validators.required],
    descripcion: [''],
    perfil: ['usuario', Validators.required],
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;
    this.fotoArchivo = archivo;
    const reader = new FileReader();
    reader.onload = (e) => this.fotoPreview.set(e.target?.result as string);
    reader.readAsDataURL(archivo);
  }

  /** Resetea el form al estado inicial (perfil='usuario') y muestra el panel de creación. */
  abrirFormulario(): void {
    this.form.reset({ perfil: 'usuario' });
    this.fotoPreview.set(null);
    this.fotoArchivo = null;
    this.error.set('');
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
  }

  crear(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const formData = new FormData();
    formData.append('nombre', v.nombre!);
    formData.append('apellido', v.apellido!);
    formData.append('correo', v.correo!);
    formData.append('nombreUsuario', v.nombreUsuario!);
    formData.append('contrasenia', v.contrasenia!);
    formData.append('fechaNacimiento', v.fechaNacimiento!);
    if (v.descripcion) formData.append('descripcion', v.descripcion);
    formData.append('perfil', v.perfil!);
    if (this.fotoArchivo) formData.append('fotoPerfil', this.fotoArchivo);

    this.usuariosService.crear(formData).subscribe({
      next: () => {
        this.cerrarFormulario();
        this.cargar();
      },
      error: (err) => this.error.set(err.error?.message ?? 'Error al crear usuario'),
    });
  }

  deshabilitar(id: string): void {
    this.usuariosService.deshabilitar(id).subscribe({
      next: () => this.cargar(),
      error: (err) => console.error(err),
    });
  }

  rehabilitar(id: string): void {
    this.usuariosService.rehabilitar(id).subscribe({
      next: () => this.cargar(),
      error: (err) => console.error(err),
    });
  }
}
