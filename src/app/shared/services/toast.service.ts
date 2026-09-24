import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

/**
 * Servicio global de notificaciones flotantes (toasts).
 * Uso: `inject(ToastService).success('Guardado correctamente')`
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsState = signal<Toast[]>([]);
  private nextId = 1;

  readonly toasts = this.toastsState.asReadonly();

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  dismiss(id: number): void {
    this.toastsState.update((list) => list.filter((t) => t.id !== id));
  }

  private show(type: ToastType, message: string): void {
    const id = this.nextId++;
    this.toastsState.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}
