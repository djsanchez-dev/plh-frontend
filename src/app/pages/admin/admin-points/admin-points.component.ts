import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CondominiumPointSummary,
  CondominiumService,
  CondominiumSummary,
  PointForm,
  PointStatus,
  PointType,
} from '../../../shared/services/condominium.service';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

const POINT_TYPE_LABELS: Record<PointType, string> = {
  ADMIN: 'Administrativo',
  RESIDENTIAL: 'Residencial',
  COMMON_AREA: 'Área común',
  PARKING: 'Estacionamiento',
  STORAGE: 'Almacenamiento',
  GATE: 'Acceso / Portón',
  POOL: 'Piscina',
  SERVICE: 'Servicios',
};

@Component({
  selector: 'app-admin-points',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-points.component.html',
})
export class AdminPointsComponent implements OnInit {
  points: CondominiumPointSummary[] = [];
  filteredPoints: CondominiumPointSummary[] = [];
  condominiums: CondominiumSummary[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';

  formOpen = false;
  editingId: string | null = null;
  saving = false;
  formError = '';
  fieldErrors: Record<string, string> = {};

  form: PointForm = this.emptyForm();

  readonly pointTypes = Object.entries(POINT_TYPE_LABELS) as [PointType, string][];

  constructor(
    private readonly condominiumService: CondominiumService,
    private readonly authService: AuthService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadPoints();
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

  loadPoints(): void {
    this.loading = true;
    this.errorMessage = '';

    this.condominiumService.listPoints().subscribe({
      next: (items) => {
        this.points = [...items];
        this.applyFilter();
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo cargar la lista de puntos del condominio.';
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
    });
  }

  loadCondominiums(): void {
    this.condominiumService.listCondominiums().subscribe({
      next: (items) => {
        this.condominiums = items;
        this.cdr.markForCheck();
      },
      error: () => {
        this.condominiums = [];
      },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredPoints = this.points.filter((point) => {
      if (!term) {
        return true;
      }
      return (
        point.name.toLowerCase().includes(term) ||
        point.code.toLowerCase().includes(term) ||
        (point.condominiumName ?? '').toLowerCase().includes(term) ||
        this.typeLabel(point.pointType).toLowerCase().includes(term)
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

  openEdit(point: CondominiumPointSummary): void {
    this.editingId = point.id;
    this.formError = '';
    this.fieldErrors = {};
    this.form = {
      condominiumId: point.condominiumId,
      code: point.code,
      name: point.name,
      pointType: point.pointType,
      address: point.address ?? '',
      status: point.status ?? 'ACTIVE',
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
      ? this.condominiumService.updatePoint(editing, this.form)
      : this.condominiumService.createPoint(this.form);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.closeForm();
        this.loadPoints();
        this.toast.success(editing ? 'Punto actualizado.' : 'Punto creado.');
      },
      error: (error) => {
        this.saving = false;
        this.fieldErrors = error.error?.errors ?? {};
        this.formError = this.hasFieldErrors
          ? ''
          : (error.error?.message ?? 'No se pudo guardar el punto.');
      },
    });
  }

  delete(point: CondominiumPointSummary): void {
    if (!window.confirm(`¿Eliminar el punto "${point.name}"?`)) {
      return;
    }

    this.condominiumService.deletePoint(point.id).subscribe({
      next: () => {
        this.loadPoints();
        this.toast.success('Punto eliminado.');
      },
      error: (error) =>
        this.toast.error(error.error?.message ?? 'No se pudo eliminar el punto.'),
    });
  }

  typeLabel(type: PointType): string {
    return POINT_TYPE_LABELS[type] ?? type;
  }

  statusLabel(status?: PointStatus): string {
    const map: Record<PointStatus, string> = {
      ACTIVE: 'Activo',
      MAINTENANCE: 'Mantenimiento',
      INACTIVE: 'Inactivo',
    };
    return status ? map[status] : 'Activo';
  }

  condominiumName(id: string): string {
    return this.condominiums.find((item) => item.id === id)?.name ?? '—';
  }

  private emptyForm(): PointForm {
    return {
      condominiumId: '',
      code: '',
      name: '',
      pointType: 'RESIDENTIAL',
      address: '',
      status: 'ACTIVE',
    };
  }
}
