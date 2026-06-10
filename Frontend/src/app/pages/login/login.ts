import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

    // delega todo al servicio
    this.authService.login(identificador, contrasenia).subscribe({
      next: () => this.cargando.set(false),
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.error?.message ?? 'Error al iniciar sesión');
      },
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control?.invalid && control?.touched);
  }
}
