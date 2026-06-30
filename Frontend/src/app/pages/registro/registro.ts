import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Validador a nivel de grupo que verifica que contrasenia y repetirContrasenia coincidan.
 * Se aplica al FormGroup completo (no a un control individual) para acceder a ambos campos.
 */
function contraseniasIguales(group: AbstractControl): ValidationErrors | null {
  const contrasenia = group.get('contrasenia')?.value;
  const repetirContrasenia = group.get('repetirContrasenia')?.value;
  return contrasenia === repetirContrasenia ? null : { noCoinciden: true };
}

/**
 * Página de registro de nuevos usuarios.
 * Incluye previsualización de la imagen de perfil antes de enviar el formulario.
 */
@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  formulario: FormGroup = this.buildForm();
  cargando = signal(false);
  error = signal<string | null>(null);
  imagenSeleccionada = signal<File | null>(null);
  previsualizacion = signal<string | null>(null);

  private buildForm(): FormGroup {
    return this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.maxLength(50)]],
        apellido: ['', [Validators.required, Validators.maxLength(50)]],
        correo: ['', [Validators.required, Validators.email]],
        nombreUsuario: [
          '',
          [Validators.required, Validators.minLength(3), Validators.maxLength(30)],
        ],
        contrasenia: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/(?=.*[A-Z])/),
            Validators.pattern(/(?=.*\d)/),
          ],
        ],
        repetirContrasenia: ['', Validators.required],
        fechaNacimiento: ['', Validators.required],
        descripcion: ['', Validators.maxLength(200)],
      },
      // El validador de grupo se ejecuta después de todos los validadores de campo
      { validators: contraseniasIguales },
    );
  }

  /**
   * Captura la imagen seleccionada por el usuario y genera una previsualización
   * usando FileReader para convertir el archivo a una URL de datos (data URL).
   */
  onImagenSeleccionada(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    if (!input.files?.length) return;

    const archivo = input.files[0];
    this.imagenSeleccionada.set(archivo);

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previsualizacion.set(e.target?.result as string);
    };
    reader.readAsDataURL(archivo);
  }

  /**
   * Construye un FormData con todos los campos del formulario y la imagen (si la hay).
   * FormData es necesario para enviar archivos binarios junto con datos de texto en
   * un solo request multipart/form-data.
   */
  onSubmit(): void {
    if (this.formulario.invalid) return;

    this.cargando.set(true);
    this.error.set(null);

    const formData = new FormData();
    const valores = this.formulario.value;

    formData.append('nombre', valores.nombre);
    formData.append('apellido', valores.apellido);
    formData.append('correo', valores.correo);
    formData.append('nombreUsuario', valores.nombreUsuario);
    formData.append('contrasenia', valores.contrasenia);
    formData.append('fechaNacimiento', valores.fechaNacimiento);
    formData.append('descripcion', valores.descripcion ?? '');
    formData.append('perfil', 'usuario');

    if (this.imagenSeleccionada()) {
      formData.append('fotoPerfil', this.imagenSeleccionada()!);
    }

    this.authService.registro(formData).subscribe({
      next: () => this.cargando.set(false),
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.error?.message ?? 'Error al registrarse');
      },
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control?.invalid && control?.touched);
  }
}
