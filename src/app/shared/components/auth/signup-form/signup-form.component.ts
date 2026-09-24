
import { Component } from '@angular/core';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';


@Component({
  selector: 'app-signup-form',
  imports: [
    LabelComponent,
    CheckboxComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule
],
  templateUrl: './signup-form.component.html',
  styles: ``
})
export class SignupFormComponent {

  showPassword = false;
  isChecked = false;

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly toast: ToastService,
    private readonly router: Router,
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignUp() {
    this.errorMessage = '';

    const request = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      password: this.password,
    };

    if (!request.firstName || !request.lastName || !request.email || !request.password) {
      this.errorMessage = 'Completa todos los campos.';
      return;
    }

    if (request.password.length < 8 || request.password.length > 72) {
      this.errorMessage = 'La contraseña debe tener entre 8 y 72 caracteres.';
      return;
    }

    this.isLoading = true;
    this.authService.register(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.accessToken) {
          // Primer usuario de la plataforma: bootstrap admin, entra directo.
          this.router.navigate(['/']);
          return;
        }
        this.toast.success(
          'Cuenta creada. Está pendiente de aprobación: un administrador la activará para que puedas iniciar sesión.',
        );
        this.router.navigate(['/signin']);
      },
      error: (error) => {
        this.isLoading = false;
        const details = error.error?.details;
        const detailMessage = details && typeof details === 'object'
          ? Object.values(details).join(' ')
          : '';
        this.errorMessage = detailMessage || error.error?.message || 'No se pudo crear la cuenta.';
      },
    });
  }
}
