import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexStroke, ApexXAxis, ApexGrid, ApexTooltip, ApexDataLabels, ApexLegend } from 'ng-apexcharts';
import { catchError, of, switchMap } from 'rxjs';
import { ServicesApiService } from '../../shared/services/services-api.service';
import { AuthService } from '../../shared/services/auth.service';
import { ConsumptionRecord, OwnerSummary } from '../../shared/models/services.models';

@Component({
  selector: 'app-services',
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './services.component.html',
})
export class ServicesComponent implements OnInit {
  owners: OwnerSummary[] = [];
  selectedOwner: OwnerSummary | null = null;
  records: ConsumptionRecord[] = [];
  loadingOwners = true;
  loadingRecords = false;
  /** Propietario sin directiva: solo consulta su propio consumo (sin selector ni escritura). */
  selfView = false;
  /** Puede registrar/editar mediciones: ADMIN, ASISTENTE ADMIN o EMPLEADO. */
  canWrite = false;
  saving = false;
  errorMessage = '';
  formOpen = false;
  editingRecord: ConsumptionRecord | null = null;
  form = this.emptyForm();

  // Agua (litros) y luz (kWh) son medidas distintas: un gráfico por métrica,
  // cada uno con su propio eje y formato (agua en área, luz en barras diarias).
  readonly waterChart: ApexChart = {
    type: 'area',
    height: 280,
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
  };
  readonly powerChart: ApexChart = {
    type: 'bar',
    height: 280,
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
  };
  readonly waterColors = ['#2E90FA'];
  readonly powerColors = ['#F79009'];
  readonly waterStroke: ApexStroke = { curve: 'smooth', width: 2 };
  readonly powerStroke: ApexStroke = { curve: 'straight', width: 0 };
  readonly hideLegend: ApexLegend = { show: false };
  readonly grid: ApexGrid = { borderColor: '#E4E7EC' };
  readonly dataLabels: ApexDataLabels = { enabled: false };
  readonly tooltip: ApexTooltip = { shared: true, intersect: false };
  waterSeries: ApexAxisChartSeries = [];
  powerSeries: ApexAxisChartSeries = [];
  /** Métrica visible en el gráfico (el espacio es reducido: un gráfico a la vez). */
  chartTab: 'water' | 'power' = 'water';
  xaxis: ApexXAxis = { categories: [], labels: { style: { colors: '#667085' } } };

  constructor(
    private readonly servicesApi: ServicesApiService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.authService.logout();
      this.router.navigate(['/signin']);
      return;
    }

    this.authService.me().pipe(
      switchMap((user) => {
        this.selfView = user.role === 'OWNER' && !user.boardMember;
        this.canWrite = ['ADMIN', 'ASSISTANT_ADMIN', 'EMPLOYEE'].includes(user.role);
        return this.servicesApi.listOwners();
      }),
      catchError((error) => {
        if (error?.status === 401) {
          // El interceptor ya cerró la sesión y redirige al login.
          this.errorMessage = 'Tu sesión expiró. Inicia sesión nuevamente.';
          return of([] as OwnerSummary[]);
        }

        if (error?.status === 403) {
          this.errorMessage = 'No tienes permisos para consultar el consumo de servicios.';
          return of([] as OwnerSummary[]);
        }

        this.errorMessage = 'No se pudo cargar la lista de propietarios.';
        return of([] as OwnerSummary[]);
      }),
    ).subscribe((owners) => {
      this.owners = [...owners];
      this.loadingOwners = false;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      if (this.owners.length) {
        this.selectOwner(this.owners[0]);
      }
    });
  }

  selectOwner(owner: OwnerSummary): void {
    this.selectedOwner = owner;
    this.loadConsumption();
  }

  openCreate(): void {
    this.editingRecord = null;
    this.form = this.emptyForm();
    this.formOpen = true;
  }

  openEdit(record: ConsumptionRecord): void {
    this.editingRecord = record;
    this.form = {
      periodStart: record.periodStart,
      period: record.period,
      waterLiters: record.waterLiters,
      electricityKwh: record.electricityKwh,
    };
    this.formOpen = true;
  }

  closeForm(): void {
    this.formOpen = false;
    this.editingRecord = null;
  }

  saveConsumption(): void {
    if (!this.selectedOwner || !this.form.periodStart || this.saving) return;

    this.saving = true;
    this.errorMessage = '';

    const request = {
      periodStart: this.form.periodStart,
      period: this.form.period,
      waterLiters: Number(this.form.waterLiters),
      electricityKwh: Number(this.form.electricityKwh),
    };

    const operation = this.editingRecord
      ? this.servicesApi.updateConsumption(this.editingRecord.id, request)
      : this.servicesApi.createConsumption(this.selectedOwner.id, request);

    operation.subscribe({
      next: () => {
        this.closeForm();
        this.loadConsumption();
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage =
          error?.status === 401
            ? 'Tu sesión expiró. Inicia sesión nuevamente para guardar la medición.'
            : 'No se pudo guardar el consumo. Verifica los datos e inténtalo de nuevo.';
      },
      complete: () => {
        this.saving = false;
      },
    });
  }

  deleteConsumption(record: ConsumptionRecord): void {
    if (!window.confirm('¿Eliminar este registro de consumo?')) return;

    this.servicesApi.deleteConsumption(record.id).subscribe({
      next: () => this.loadConsumption(),
      error: () => {
        this.errorMessage = 'No se pudo eliminar el consumo. Inténtalo nuevamente.';
      },
    });
  }

  private loadConsumption(): void {
    if (!this.selectedOwner) return;
    this.loadingRecords = true;
    this.errorMessage = '';
    this.servicesApi.getConsumption(this.selectedOwner.id).pipe(
      catchError(() => {
        this.errorMessage = 'No se pudo cargar el historial de consumo.';
        return of([] as ConsumptionRecord[]);
      }),
    ).subscribe((records) => {
      this.records = [...records];
      this.updateChart(records);
      this.loadingRecords = false;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  private updateChart(records: ConsumptionRecord[]): void {
    this.xaxis = {
      ...this.xaxis,
      categories: records.map((record) => this.formatDate(record.periodStart)),
    };
    this.waterSeries = [
      { name: 'Agua (L)', data: records.map((record) => record.waterLiters) },
    ];
    this.powerSeries = [
      { name: 'Luz (kWh)', data: records.map((record) => record.electricityKwh) },
    ];
  }

  get totalWater(): number {
    return this.records.reduce((sum, record) => sum + record.waterLiters, 0);
  }

  get totalKwh(): number {
    return this.records.reduce((sum, record) => sum + record.electricityKwh, 0);
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(new Date(`${value}T00:00:00`));
  }

  ownerName(owner: OwnerSummary): string {
    return `${owner.firstName} ${owner.lastName}`.trim();
  }

  private emptyForm(): Omit<ConsumptionRecord, 'id'> {
    return {
      periodStart: this.todayString(),
      period: 'DAY',
      waterLiters: 0,
      electricityKwh: 0,
    };
  }

  private todayString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
