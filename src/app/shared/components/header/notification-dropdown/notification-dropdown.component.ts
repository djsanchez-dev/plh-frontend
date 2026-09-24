import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { AdminUsersService } from '../../../services/admin-users.service';
import { AuthService } from '../../../services/auth.service';
import { AdminPerson } from '../../../models/admin.models';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  imports: [CommonModule, RouterModule, DropdownComponent],
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  isOpen = false;
  loading = false;
  pending: AdminPerson[] = [];
  approvingId: string | null = null;

  private readonly subscription = new Subscription();

  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly authService: AuthService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    // Solo administradores aprueban cuentas.
    if (this.canApprove) {
      this.loadPending();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get notifying(): boolean {
    return this.pending.length > 0;
  }

  get canApprove(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'ASSISTANT_ADMIN';
  }

  loadPending(): void {
    this.loading = true;
    this.subscription.add(
      this.adminUsersService.listPending().subscribe({
        next: (people) => {
          this.pending = people;
          this.loading = false;
        },
        error: () => {
          this.pending = [];
          this.loading = false;
        },
      }),
    );
  }

  approve(person: AdminPerson): void {
    this.approvingId = person.id;
    this.adminUsersService.setEnabled(person.id, true).subscribe({
      next: () => {
        this.approvingId = null;
        this.pending = this.pending.filter((p) => p.id !== person.id);
        this.toast.success(`La cuenta de ${person.fullName} fue activada.`);
      },
      error: (error) => {
        this.approvingId = null;
        this.toast.error(error.error?.message ?? 'No se pudo activar la cuenta.');
      },
    });
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.pending.length === 0 && this.canApprove) {
      this.loadPending();
    }
  }

  closeDropdown(): void {
    this.isOpen = false;
  }
}
