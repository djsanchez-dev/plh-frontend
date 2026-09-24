import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { UserResponse } from '../../shared/services/auth.models';
import { BOARD_POSITION_LABELS, BoardPosition } from '../../shared/models/admin.models';
import { ToastService } from '../../shared/services/toast.service';

interface FieldErrors {
  [field: string]: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  ASSISTANT_ADMIN: 'Asistente de administración',
  BOARD: 'Directiva',
  EMPLOYEE: 'Empleado',
  OWNER: 'Propietario',
  RESIDENT: 'Residente',
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: UserResponse | null = null;
  loading = true;

  // Datos personales
  profile = {
    firstName: '',
    lastName: '',
    documentType: '',
    documentNumber: '',
    phone: '',
    address: '',
  };
  savingProfile = false;
  profileErrors: FieldErrors = {};
  profileSuccess = '';

  // Contraseña
  password = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  savingPassword = false;
  passwordErrors: FieldErrors = {};
  passwordError = '';
  showCurrentPassword = false;
  showNewPassword = false;

  constructor(
    private readonly authService: AuthService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (user) => {
        this.user = user;
        this.profile = {
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          documentType: user.documentType ?? '',
          documentNumber: user.documentNumber ?? '',
          phone: user.phone ?? '',
          address: user.address ?? '',
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('No se pudo cargar tu perfil.');
      },
    });
  }

  get roleLabel(): string {
    if (!this.user) {
      return '';
    }
    const base = ROLE_LABELS[this.user.role] ?? this.user.role;
    const onBoard = this.user.role === 'BOARD' || !!this.user.boardMember;
    const cargo = onBoard && this.user.boardPosition
      ? BOARD_POSITION_LABELS[this.user.boardPosition as BoardPosition]
      : undefined;
    return cargo ? `${base} · ${cargo}` : base;
  }

  saveProfile(): void {
    this.profileErrors = {};
    this.profileSuccess = '';
    this.savingProfile = true;

    this.authService.updateProfile(this.profile).subscribe({
      next: (user) => {
        this.user = user;
        this.savingProfile = false;
        this.toast.success('Perfil actualizado correctamente.');
      },
      error: (error) => {
        this.savingProfile = false;
        this.profileErrors = error.error?.errors ?? {};
        const message = error.error?.message ?? 'No se pudo actualizar el perfil.';
        if (Object.keys(this.profileErrors).length === 0) {
          this.toast.error(message);
        }
      },
    });
  }

  changePassword(): void {
    this.passwordErrors = {};
    this.passwordError = '';

    if (this.password.newPassword !== this.password.confirmPassword) {
      this.passwordErrors['confirmPassword'] = 'Las contraseñas no coinciden.';
      return;
    }

    this.savingPassword = true;
    this.authService
      .changePassword({
        currentPassword: this.password.currentPassword,
        newPassword: this.password.newPassword,
      })
      .subscribe({
        next: () => {
          this.savingPassword = false;
          this.password = { currentPassword: '', newPassword: '', confirmPassword: '' };
          this.toast.success('Contraseña cambiada correctamente.');
        },
        error: (error) => {
          this.savingPassword = false;
          this.passwordErrors = error.error?.errors ?? {};
          this.passwordError = error.error?.message ?? 'No se pudo cambiar la contraseña.';
          if (Object.keys(this.passwordErrors).length > 0) {
            this.passwordError = '';
          }
        },
      });
  }
}
