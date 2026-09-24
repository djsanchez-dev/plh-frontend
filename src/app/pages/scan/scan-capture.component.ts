import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ServicesApiService } from '../../shared/services/services-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ScanInfo, isValidQrCode } from '../../shared/models/scan.models';

/**
 * Vista de captura tras escanear el QR: ficha del propietario/propiedad y
 * inputs de las lecturas acumuladas de los medidores.
 * El consumo del día lo calcula el backend (lectura actual − última lectura).
 */
@Component({
  selector: 'app-scan-capture',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './scan-capture.component.html',
})
export class ScanCaptureComponent implements OnInit {
  code = '';
  info: ScanInfo | null = null;
  loading = true;
  saving = false;
  errorMessage = '';

  waterReading: number | null = null;
  electricityReading: number | null = null;

  constructor(
    private readonly servicesApi: ServicesApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('codigo') ?? '';
    if (!isValidQrCode(code)) {
      this.loading = false;
      this.errorMessage = 'El código escaneado no es válido.';
      return;
    }
    this.code = code.toLowerCase();
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.servicesApi.getScan(this.code).subscribe({
      next: (info) => {
        this.info = info;
        // Prefill con las lecturas de hoy si ya existe medición (modo edición).
        this.waterReading = info.waterReading;
        this.electricityReading = info.electricityReading;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message ?? 'No se pudo cargar la propiedad. Verifica el código.';
        this.cdr.markForCheck();
      },
    });
  }

  get isBaseline(): boolean {
    return !!this.info && this.info.previousWaterReading === null;
  }

  get todayLabel(): string {
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'long' }).format(new Date());
  }

  get waterDelta(): number | null {
    if (!this.info || this.info.previousWaterReading === null || this.waterReading === null) {
      return null;
    }
    return this.waterReading - this.info.previousWaterReading;
  }

  get electricityDelta(): number | null {
    if (!this.info || this.info.previousElectricityReading === null || this.electricityReading === null) {
      return null;
    }
    return this.electricityReading - this.info.previousElectricityReading;
  }

  get invalidReadings(): boolean {
    return (this.waterDelta !== null && this.waterDelta < 0) || (this.electricityDelta !== null && this.electricityDelta < 0);
  }

  get canSave(): boolean {
    return (
      !this.saving &&
      this.waterReading !== null &&
      this.electricityReading !== null &&
      this.waterReading >= 0 &&
      this.electricityReading >= 0 &&
      !this.invalidReadings
    );
  }

  save(): void {
    if (!this.canSave) {
      return;
    }
    this.saving = true;
    this.errorMessage = '';
    this.servicesApi
      .saveScan(this.code, {
        waterReading: Number(this.waterReading),
        electricityReading: Number(this.electricityReading),
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.toast.success('Medición registrada correctamente.');
          this.router.navigate(['/escanear']);
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage = error.error?.message ?? 'No se pudo guardar la medición.';
          this.cdr.markForCheck();
        },
      });
  }

  back(): void {
    this.router.navigate(['/escanear']);
  }
}
