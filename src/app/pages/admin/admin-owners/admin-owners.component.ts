import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminUsersService } from '../../../shared/services/admin-users.service';
import { AdminPerson, BOARD_POSITION_LABELS, BoardPosition } from '../../../shared/models/admin.models';

@Component({
  selector: 'app-admin-owners',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-owners.component.html',
})
export class AdminOwnersComponent implements OnInit {
  owners: AdminPerson[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadOwners();
  }

  loadOwners(): void {
    this.loading = true;
    this.errorMessage = '';
    this.adminUsersService.listOwners().subscribe({
      next: (owners) => {
        this.owners = [...owners];
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo cargar la lista de propietarios.';
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
    });
  }

  positionLabel(position?: BoardPosition | null): string {
    return position ? BOARD_POSITION_LABELS[position] : '—';
  }

  printing = false;

  /** Genera e imprime la hoja de etiquetas QR (una por propiedad). */
  async printQrs(): Promise<void> {
    if (this.printing) {
      return;
    }
    this.printing = true;
    this.errorMessage = '';
    try {
      const properties = await firstValueFrom(this.adminUsersService.listProperties());
      if (!properties.length) {
        this.errorMessage = 'No hay propiedades registradas. Crea un propietario con su lote primero.';
        return;
      }
      const QR = await import('qrcode');
      const origin = window.location.origin;
      const cards: string[] = [];
      for (const property of properties) {
        const dataUrl = await QR.toDataURL(`${origin}/m/${property.qrCode}`, { margin: 1, width: 260 });
        cards.push(`<div class="qr-card">
          <img src="${dataUrl}" alt="QR" />
          <div class="lot">${this.escapeHtml(property.lot || 'Propiedad')}</div>
          <div class="owner">${this.escapeHtml(property.ownerName)}</div>
          <div class="brand">Playa Honda · Escanea para registrar lecturas</div>
        </div>`);
      }
      const win = window.open('', '_blank');
      if (!win) {
        this.errorMessage = 'Permite las ventanas emergentes para imprimir los QR.';
        return;
      }
      win.document.write(`<!doctype html>
<html><head><meta charset="utf-8" /><title>QR Propiedades · Playa Honda</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; margin: 16px; color: #111827; }
  .qr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; }
  .qr-card { border: 1px dashed #9ca3af; border-radius: 12px; padding: 12px; text-align: center; break-inside: avoid; }
  .qr-card img { width: 140px; height: 140px; }
  .lot { font-weight: 700; font-size: 14px; margin-top: 6px; }
  .owner { font-size: 12px; color: #4b5563; }
  .brand { font-size: 10px; color: #9ca3af; margin-top: 4px; }
  @media print { body { margin: 0; } }
</style></head>
<body><div class="qr-grid">${cards.join('')}</div></body></html>`);
      win.document.close();
      setTimeout(() => {
        win.focus();
        win.print();
      }, 400);
    } catch {
      this.errorMessage = 'No se pudieron generar los códigos QR.';
    } finally {
      this.printing = false;
    }
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => {
      switch (char) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        default: return '&#39;';
      }
    });
  }
}
