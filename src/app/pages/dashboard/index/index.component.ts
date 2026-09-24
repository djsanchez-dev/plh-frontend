import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, finalize, timeout } from 'rxjs';
import { MonthlyTargetComponent } from '../../../shared/components/ecommerce/monthly-target/monthly-target.component';
import { ReservoirReading } from '../../../shared/models/reservoir.models';
import { DashboardMovement, DashboardSummary } from '../../../shared/models/dashboard.models';
import { DashboardService } from '../../../shared/services/dashboard.service';

const EMPLOYEE_TYPE_LABELS: Record<string, string> = {
  CLEANING: 'Limpieza',
  MAINTENANCE: 'Mantenimiento',
  GARDENING: 'Jardinería',
  CCTV_OPERATOR: 'Operador CCTV',
  SECURITY_GUARD: 'Seguridad',
  ASSISTANT_ADMIN: 'Asistente admin',
};

const CATEGORY_LABELS: Record<string, string> = {
  ASSET: 'Activos',
  MATERIAL: 'Materiales',
  TOOL: 'Herramientas',
};

const MOVEMENT_LABELS: Record<string, string> = {
  LOAN: 'Préstamo',
  RETURN: 'Devolución',
  CONSUMPTION: 'Consumo',
  ADJUSTMENT: 'Ajuste',
};

@Component({
  selector: 'app-dashboard-index',
  imports: [CommonModule, MonthlyTargetComponent],
  templateUrl: './index.component.html',
})
export class DashboardIndexComponent implements OnInit {
  private readonly reservoirUrl = 'https://6ab1e32e5b9b60f39d343197.mockapi.io/api/reservorio/reservorio';
  private readonly reservoirHeightMeters = 5;
  private readonly reservoirCircumferenceMeters = 23.78;

  reservoir: ReservoirReading = {
    device_id: 'RES-001',
    nivel_cm: 0,
    porcentaje: 0,
    estado: 'CARGANDO',
  };

  reservoirLoading = true;
  reservoirError = '';

  summary: DashboardSummary | null = null;
  summaryLoading = true;
  summaryError = '';

  constructor(
    private readonly http: HttpClient,
    private readonly dashboardService: DashboardService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadReservoir();
    this.loadSummary();
  }

  private loadReservoir(): void {
    this.http.get<ReservoirReading | ReservoirReading[]>(this.reservoirUrl).pipe(
      timeout(10000),
      catchError(() => {
        this.reservoirError = 'No se pudo cargar la lectura del reservorio.';
        return EMPTY;
      }),
      finalize(() => {
        this.reservoirLoading = false;
        this.changeDetectorRef.detectChanges();
      }),
    ).subscribe((response) => {
      const reading = Array.isArray(response) ? response[0] : response;
      if (!reading) {
        this.reservoirError = 'La API no devolvió lecturas del reservorio.';
        return;
      }

      this.reservoir = {
        device_id: reading.device_id,
        nivel_cm: Number(reading.nivel_cm),
        porcentaje: Number(reading.porcentaje),
        estado: reading.estado,
      };
      this.changeDetectorRef.detectChanges();
    });
  }

  private loadSummary(): void {
    this.dashboardService.getSummary().pipe(
      catchError(() => {
        this.summaryError = 'No se pudo cargar el resumen del sistema.';
        return EMPTY;
      }),
      finalize(() => {
        this.summaryLoading = false;
        this.changeDetectorRef.detectChanges();
      }),
    ).subscribe((summary) => {
      this.summary = summary;
      this.changeDetectorRef.detectChanges();
    });
  }

  // ---------- Getters de presentación ----------

  get staffEntries(): { label: string; count: number }[] {
    if (!this.summary) {
      return [];
    }
    return Object.entries(this.summary.staff.byType)
      .map(([type, count]) => ({ label: EMPLOYEE_TYPE_LABELS[type] ?? type, count }))
      .sort((a, b) => b.count - a.count);
  }

  get categoryEntries(): { label: string; count: number }[] {
    if (!this.summary) {
      return [];
    }
    return Object.entries(this.summary.inventory.byCategory).map(([category, count]) => ({
      label: CATEGORY_LABELS[category] ?? category,
      count,
    }));
  }

  get waterChange(): number | null {
    if (!this.summary || this.summary.consumption.previousMonthWater <= 0) {
      return null;
    }
    const { currentMonthWater, previousMonthWater } = this.summary.consumption;
    return ((currentMonthWater - previousMonthWater) / previousMonthWater) * 100;
  }

  get kwhChange(): number | null {
    if (!this.summary || this.summary.consumption.previousMonthKwh <= 0) {
      return null;
    }
    const { currentMonthKwh, previousMonthKwh } = this.summary.consumption;
    return ((currentMonthKwh - previousMonthKwh) / previousMonthKwh) * 100;
  }

  movementLabel(type: string): string {
    return MOVEMENT_LABELS[type] ?? type;
  }

  // ---------- Reservorio (sin cambios) ----------

  get reservoirCapacityLiters(): number {
    return Math.PI * Math.pow(this.reservoirCircumferenceMeters / (2 * Math.PI), 2)
      * this.reservoirHeightMeters * 1000;
  }

  get occupiedLiters(): number {
    return this.reservoirCapacityLiters * (this.reservoir.porcentaje / 100);
  }

  get remainingLiters(): number {
    return Math.max(this.reservoirCapacityLiters - this.occupiedLiters, 0);
  }

  get reservoirCapacityCubicMeters(): number {
    return this.reservoirCapacityLiters / 1000;
  }

  formatLiters(value: number): string {
    return `${Math.round(value).toLocaleString('es-PE')} litros`;
  }

  formatCubicMeters(value: number): string {
    return `${value.toFixed(2)} m³`;
  }
}
