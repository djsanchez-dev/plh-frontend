import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CondominiumForm,
  CondominiumService,
  CondominiumStatus,
  CondominiumSummary,
} from '../../../shared/services/condominium.service';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-condominiums',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-condominiums.component.html',
})
export class AdminCondominiumsComponent implements OnInit {
  condominiums: CondominiumSummary[] = [];
  filteredCondominiums: CondominiumSummary[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';

  formOpen = false;
  editingId: string | null = null;
  saving = false;
  formError = '';
  fieldErrors: Record<string, string> = {};

  form: CondominiumForm = this.emptyForm();

  constructor(
    private readonly condominiumService: CondominiumService,
    private readonly authService: AuthService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCondominiums();
  }

  get canWrite(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'ASSISTANT_ADMIN';
  }

  get hasFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }

  get fieldErrorList(): { field: string; message: string }[] {
    return Object.entries(this.fieldErrors).map(([field, message]) => ({ field, message }));
  }

  loadCondominiums(): void {
    this.loading = true;
    this.errorMessage = '';

    this.condominiumService.listCondominiums().subscribe({
      next: (items) => {
        this.condominiums = [...items];
        this.applyFilter();
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo cargar la lista de condominios.';
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredCondominiums = this.condominiums.filter((item) => {
      if (!term) {
        return true;
      }
      return (
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        item.city.toLowerCase().includes(term) ||
        item.country.toLowerCase().includes(term)
      );
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.formError = '';
    this.fieldErrors = {};
    this.form = this.emptyForm();
    this.formOpen = true;
  }

  openEdit(item: CondominiumSummary): void {
    this.editingId = item.id;
    this.formError = '';
    this.fieldErrors = {};
    this.form = {
      code: item.code,
      name: item.name,
      country: item.country,
      city: item.city,
      address: item.address,
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      status: item.status ?? 'ACTIVE',
    };
    this.formOpen = true;
  }

  closeForm(): void {
    this.formOpen = false;
    this.editingId = null;
    this.formError = '';
    this.fieldErrors = {};
    this.form = this.emptyForm();
  }

  save(): void {
    this.formError = '';
    this.fieldErrors = {};
    this.saving = true;

    const editing = this.editingId;
    const request$ = editing
      ? this.condominiumService.updateCondominium(editing, this.form)
      : this.condominiumService.createCondominium(this.form);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.closeForm();
        this.loadCondominiums();
        this.toast.success(editing ? 'Condominio actualizado.' : 'Condominio creado.');
      },
      error: (error) => {
        this.saving = false;
        this.fieldErrors = error.error?.errors ?? {};
        this.formError = this.hasFieldErrors
          ? ''
          : (error.error?.message ?? 'No se pudo guardar el condominio.');
      },
    });
  }

  delete(item: CondominiumSummary): void {
    if (!window.confirm(`¿Eliminar el condominio "${item.name}"?`)) {
      return;
    }

    this.condominiumService.deleteCondominium(item.id).subscribe({
      next: () => {
        this.loadCondominiums();
        this.toast.success('Condominio eliminado.');
      },
      error: (error) =>
        this.toast.error(error.error?.message ?? 'No se pudo eliminar: tiene puntos o datos relacionados.'),
    });
  }

  statusLabel(status?: CondominiumStatus): string {
    const map: Record<CondominiumStatus, string> = {
      ACTIVE: 'Activo',
      MAINTENANCE: 'Mantenimiento',
      INACTIVE: 'Inactivo',
    };
    return status ? map[status] : 'Activo';
  }

  private emptyForm(): CondominiumForm {
    return {
      code: '',
      name: '',
      country: '',
      city: '',
      address: '',
      latitude: null,
      longitude: null,
      status: 'ACTIVE',
    };
  }
}
