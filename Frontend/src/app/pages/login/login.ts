import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Página de inicio de sesión.
 * Usa Reactive Forms para validar los campos antes de hacer el request.
 * La navegación post-login la maneja AuthService (no este componente).
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  formulario: FormGroup = this.buildForm();
  cargando = signal(false);
  error = signal<string | null>(null);

  private buildForm(): FormGroup {
    return this.fb.group({
      identificador: ['', [Validators.required]],
      contrasenia: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          // Las mismas reglas que el backend para dar feedback inmediato al usuario
          Validators.pattern(/(?=.*[A-Z])/),
          Validators.pattern(/(?=.*\d)/),
        ],
      ],
    });
  }

  onSubmit(): void {
    if (this.formulario.invalid) return;

    this.cargando.set(true);
    this.error.set(null);

    const { identificador, contrasenia } = this.formulario.value;

    this.authService.login(identificador, contrasenia).subscribe({
      next: () => this.cargando.set(false),
      error: (err) => {
        this.cargando.set(false);
        // err.error.message viene del body de la respuesta de error del backend
        this.error.set(err.error?.message ?? 'Error al iniciar sesión');
      },
    });
  }

  /** Devuelve true si el campo fue tocado y es inválido (para mostrar estilos de error). */
  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control?.invalid && control?.touched);
  }
}
