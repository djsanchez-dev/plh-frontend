import { Component, inject } from '@angular/core';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-theme-lg animate-fadeIn"
          [class]="
            toast.type === 'success'
              ? 'border-success-500/30 bg-success-50 dark:bg-success-500/15'
              : toast.type === 'error'
                ? 'border-red-500/30 bg-red-50 dark:bg-red-500/15'
                : 'border-brand-500/30 bg-brand-50 dark:bg-brand-500/15'
          "
        >
          @if (toast.type === 'success') {
            <svg class="mt-0.5 size-5 shrink-0 text-success-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
            </svg>
          } @else if (toast.type === 'error') {
            <svg class="mt-0.5 size-5 shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          } @else {
            <svg class="mt-0.5 size-5 shrink-0 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
          }
          <p class="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{{ toast.message }}</p>
          <button type="button" (click)="toastService.dismiss(toast.id)" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  standalone: true,
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
