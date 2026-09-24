import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ServicesApiService } from '../../shared/services/services-api.service';
import { ScanTodayItem, ScanTodaySummary, isValidQrCode } from '../../shared/models/scan.models';

/**
 * Escáner QR + avance del recorrido diario.
 * La cámara usa la API BarcodeDetector (Chrome/Android); si no existe,
 * se ofrece la escritura manual del código.
 */
@Component({
  selector: 'app-scan',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './scan.component.html',
})
export class ScanComponent implements OnInit, OnDestroy {
  today: ScanTodaySummary | null = null;
  loading = true;
  errorMessage = '';

  manualCode = '';

  cameraSupported = typeof window !== 'undefined' && 'BarcodeDetector' in window;
  cameraActive = false;
  cameraError = '';

  @ViewChild('videoEl') videoEl?: ElementRef<HTMLVideoElement>;

  private stream: MediaStream | null = null;
  private detector: { detect: (video: HTMLVideoElement) => Promise<{ rawValue: string }[]> } | null = null;
  private scanTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly servicesApi: ServicesApiService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadToday();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  loadToday(): void {
    this.loading = true;
    this.errorMessage = '';
    this.servicesApi.getToday().subscribe({
      next: (today) => {
        this.today = today;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo cargar el avance de hoy.';
        this.cdr.markForCheck();
      },
    });
  }

  get progress(): number {
    if (!this.today || !this.today.total) {
      return 0;
    }
    return Math.round((this.today.measured / this.today.total) * 100);
  }

  get pending(): ScanTodayItem[] {
    return this.today?.items.filter((item) => !item.measured) ?? [];
  }

  openCapture(code: string): void {
    if (isValidQrCode(code)) {
      this.router.navigate(['/m', code.toLowerCase()]);
    }
  }

  openManual(): void {
    const code = this.manualCode.trim();
    if (!isValidQrCode(code)) {
      this.errorMessage = 'El código no es válido. Escanea el QR o pega el código completo.';
      return;
    }
    this.errorMessage = '';
    this.openCapture(code);
  }

  async startCamera(): Promise<void> {
    if (!this.cameraSupported || this.cameraActive) {
      return;
    }
    this.cameraError = '';
    try {
      const BarcodeDetectorCtor = (window as unknown as {
        BarcodeDetector: new (options: { formats: string[] }) => {
          detect: (video: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
        };
      }).BarcodeDetector;
      this.detector = new BarcodeDetectorCtor({ formats: ['qr_code'] });
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      const video = this.videoEl?.nativeElement;
      if (!video) {
        this.stopCamera();
        return;
      }
      video.srcObject = this.stream;
      await video.play();
      this.cameraActive = true;
      this.scanTimer = setInterval(() => this.detectFrame(), 400);
      this.cdr.markForCheck();
    } catch {
      this.cameraError = 'No se pudo abrir la cámara. Revisa los permisos del navegador.';
      this.cameraActive = false;
      this.stopCamera();
    }
  }

  stopCamera(): void {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    const video = this.videoEl?.nativeElement;
    if (video) {
      video.srcObject = null;
    }
    this.cameraActive = false;
  }

  private async detectFrame(): Promise<void> {
    const video = this.videoEl?.nativeElement;
    if (!video || !this.detector || video.readyState < 2) {
      return;
    }
    try {
      const codes = await this.detector.detect(video);
      if (codes.length) {
        // El QR puede contener la URL completa (/m/{uuid}): extraemos el código.
        const match = codes[0].rawValue?.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        if (match) {
          const code = match[0].toLowerCase();
          this.stopCamera();
          this.openCapture(code);
        }
      }
    } catch {
      // Frame no listo o sin QR: se sigue intentando.
    }
  }
}
