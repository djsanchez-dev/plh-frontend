import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  InventoryCategory,
  InventoryItem,
  InventoryItemForm,
  InventoryMovement,
  InventoryMovementForm,
  InventoryMovementType,
} from '../../shared/models/inventory.models';
import { AuthService } from '../../shared/services/auth.service';
import { Employee, EmployeeService } from '../../shared/services/employee.service';
import { InventoryService } from '../../shared/services/inventory.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
})
export class InventoryComponent implements OnInit {
  items: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  movementHistory: Record<string, InventoryMovement[]> = {};
  activeLoansByItem: Record<string, InventoryMovement> = {};
  searchTerm = '';
  categoryFilter: 'ALL' | InventoryCategory = 'ALL';
  loading = true;
  errorMessage = '';
  employees: Employee[] = [];
  formOpen = false;
  movementOpen = false;
  returnModalOpen = false;
  historyOpen = false;
  editing: InventoryItem | null = null;
  movementItem: InventoryItem | null = null;
  returnItem: InventoryItem | null = null;
  returnMovement: InventoryMovement | null = null;
  historyItem: InventoryItem | null = null;
  returnReceivedBy = '';
  selectedResponsibleEmployeeId = '';
  movementType: InventoryMovementType = 'LOAN';

  form: InventoryItemForm = {
    code: '',
    name: '',
    category: 'MATERIAL',
    quantity: 0,
    minStock: 0,
    unit: 'un',
    location: '',
    notes: '',
  };
  formError = '';
  fieldErrors: Record<string, string> = {};

  movementForm: InventoryMovementForm = {
    type: 'LOAN',
    quantity: 1,
    responsiblePerson: '',
    destinationArea: '',
    notes: '',
    movementAt: new Date().toISOString().slice(0, 16),
    receivedBy: '',
  };

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly employeeService: EmployeeService,
    private readonly authService: AuthService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadItems();
    this.loadEmployees();
    this.syncCurrentUser();
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';

    this.inventoryService.list().subscribe({
      next: (items) => {
        this.items = [...items];
        this.applyFilter();
        this.loadActiveLoans();
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el inventario.';
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
    });
  }

  loadEmployees(): void {
    this.employeeService.list().subscribe({
      next: (employees) => {
        this.employees = [...employees.filter((employee) => employee.active)].sort((a, b) => a.fullName.localeCompare(b.fullName));
        if (!this.selectedResponsibleEmployeeId && this.employees[0]) {
          this.selectedResponsibleEmployeeId = this.employees[0].id;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.employees = [];
      },
    });
  }

  syncCurrentUser(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.returnReceivedBy = currentUser.fullName;
      return;
    }

    this.authService.me().subscribe({
      next: (user) => {
        this.returnReceivedBy = user.fullName;
      },
      error: () => {
        this.returnReceivedBy = 'Usuario actual';
      },
    });
  }

  getCurrentUserName(): string {
    return this.authService.currentUser()?.fullName || this.returnReceivedBy || 'Usuario actual';
  }

  getEmployeeById(employeeId: string): Employee | undefined {
    return this.employees.find((employee) => employee.id === employeeId);
  }

  // Carga los préstamos activos en una sola petición (evita N+1 por artículo).
  loadActiveLoans(): void {
    this.inventoryService.listActiveLoans().subscribe({
      next: (movements) => {
        const map: Record<string, InventoryMovement> = {};
        for (const movement of movements) {
          if (movement.itemId && !map[movement.itemId]) {
            map[movement.itemId] = movement;
          }
        }
        this.activeLoansByItem = map;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.activeLoansByItem = {};
      },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredItems = this.items.filter((item) => {
      const matchesCategory = this.categoryFilter === 'ALL' || item.category === this.categoryFilter;
      const matchesSearch = !term
        || item.name.toLowerCase().includes(term)
        || item.code.toLowerCase().includes(term)
        || (item.location ?? '').toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }

  openCreate(): void {
    this.editing = null;
    this.formError = '';
    this.fieldErrors = {};
    this.form = {
      code: '',
      name: '',
      category: 'MATERIAL',
      quantity: 0,
      minStock: 0,
      unit: 'un',
      location: '',
      notes: '',
    };
    this.formOpen = true;
  }

  openEdit(item: InventoryItem): void {
    this.editing = item;
    this.formError = '';
    this.fieldErrors = {};
    this.form = {
      code: item.code,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minStock: item.minStock ?? 0,
      unit: item.unit ?? '',
      location: item.location ?? '',
      notes: item.notes ?? '',
    };
    this.formOpen = true;
  }

  closeForm(): void {
    this.formOpen = false;
    this.editing = null;
    this.formError = '';
    this.fieldErrors = {};
  }

  get hasFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }

  get fieldErrorList(): string[] {
    return Object.values(this.fieldErrors);
  }

  save(): void {
    this.formError = '';
    this.fieldErrors = {};
    if (!this.form.code.trim() || !this.form.name.trim()) {
      this.formError = 'Código y nombre son obligatorios.';
      return;
    }

    const payload: InventoryItemForm = {
      code: this.form.code.trim(),
      name: this.form.name.trim(),
      category: this.form.category,
      quantity: Number(this.form.quantity) || 0,
      minStock: Number(this.form.minStock) || 0,
      unit: this.form.unit.trim(),
      location: this.form.location.trim(),
      notes: this.form.notes.trim(),
    };

    const editing = this.editing;
    const request = editing
      ? this.inventoryService.update(editing.id, payload)
      : this.inventoryService.create(payload);

    request.subscribe({
      next: () => {
        this.closeForm();
        this.loadItems();
        this.toast.success(editing ? 'Artículo actualizado.' : 'Artículo creado.');
      },
      error: (error) => {
        this.fieldErrors = error.error?.errors ?? {};
        this.formError = this.hasFieldErrors
          ? ''
          : (error.error?.message ?? 'No se pudo guardar el registro de inventario.');
      },
    });
  }

  deleteItem(item: InventoryItem): void {
    if (!confirm(`¿Eliminar ${item.name}? Se borrará también su historial de movimientos.`)) return;

    this.inventoryService.delete(item.id).subscribe({
      next: () => {
        this.loadItems();
        this.toast.success('Artículo eliminado junto con su historial.');
      },
      error: (error) => {
        this.toast.error(error.error?.message ?? 'No se pudo eliminar el artículo.');
      },
    });
  }

  openMovement(item: InventoryItem, type: InventoryMovementType): void {
    if (!this.canPerformMovement(item.id, type)) {
      if (this.hasActiveLoan(item.id)) {
        this.errorMessage = 'Este artículo ya tiene un préstamo activo. Debes registrarle la devolución antes de realizar otra acción.';
      } else {
        this.errorMessage = 'No se puede registrar este movimiento porque el artículo no tiene stock disponible.';
      }
      return;
    }

    this.movementItem = item;
    this.movementType = type;
    this.selectedResponsibleEmployeeId = this.employees[0]?.id ?? '';
    const defaultResponsible = this.getEmployeeById(this.selectedResponsibleEmployeeId)?.fullName ?? '';
    this.movementForm = {
      type,
      quantity: 1,
      responsiblePerson: defaultResponsible,
      destinationArea: '',
      notes: '',
      movementAt: new Date().toISOString().slice(0, 16),
      receivedBy: '',
    };
    this.movementOpen = true;
  }

  closeMovement(): void {
    this.movementOpen = false;
    this.movementItem = null;
    this.movementType = 'LOAN';
  }

  submitMovement(): void {
    if (!this.movementItem) {
      return;
    }

    const selectedEmployee = this.getEmployeeById(this.selectedResponsibleEmployeeId);
    const responsiblePerson = selectedEmployee?.fullName || this.movementForm.responsiblePerson.trim();

    const payload: InventoryMovementForm = {
      ...this.movementForm,
      type: this.movementType,
      quantity: Number(this.movementForm.quantity) || 0,
      responsiblePerson,
      destinationArea: this.movementForm.destinationArea.trim(),
      notes: this.movementForm.notes.trim(),
      movementAt: this.movementForm.movementAt || new Date().toISOString().slice(0, 16),
      receivedBy: this.movementForm.receivedBy.trim(),
    };

    if (!payload.responsiblePerson || payload.quantity <= 0) {
      this.errorMessage = 'Debe seleccionar un responsable y una cantidad válida.';
      return;
    }

    if (!this.canPerformMovement(this.movementItem.id, this.movementType)) {
      this.errorMessage = 'No es posible registrar este movimiento con el estado actual del artículo.';
      return;
    }

    this.inventoryService.createMovement(this.movementItem.id, payload).subscribe({
      next: () => {
        this.closeMovement();
        this.loadItems();
      },
      error: () => {
        this.errorMessage = 'No se pudo registrar el movimiento de inventario.';
      },
    });
  }

  getOpenLoanMovement(itemId: string): InventoryMovement | null {
    return this.activeLoansByItem[itemId] ?? null;
  }

  hasActiveLoan(itemId: string): boolean {
    return this.getOpenLoanMovement(itemId) !== null;
  }

  canPerformMovement(itemId: string, type: InventoryMovementType): boolean {
    const item = this.items.find((currentItem) => currentItem.id === itemId);
    if (!item || item.quantity <= 0) {
      return false;
    }

    if (item.category === 'MATERIAL') {
      return type === 'CONSUMPTION';
    }

    if (this.hasActiveLoan(itemId)) {
      return type === 'RETURN';
    }

    return type === 'LOAN' || type === 'CONSUMPTION';
  }

  canLoanItem(itemId: string): boolean {
    return this.canPerformMovement(itemId, 'LOAN');
  }

  canConsumeItem(itemId: string): boolean {
    return this.canPerformMovement(itemId, 'CONSUMPTION');
  }

  canReturnItem(itemId: string): boolean {
    const item = this.items.find((currentItem) => currentItem.id === itemId);
    if (!item || item.category === 'MATERIAL') {
      return false;
    }

    return this.canPerformMovement(itemId, 'RETURN');
  }

  getItemState(item: InventoryItem): { label: string; tone: string; hint: string } {
    if (item.category === 'MATERIAL') {
      if (item.quantity <= 0) {
        return {
          label: 'Sin stock',
          tone: 'bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300',
          hint: 'No hay unidades disponibles para consumo.',
        };
      }

      return {
        label: 'Disponible',
        tone: 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300',
        hint: 'Este material solo admite consumo y no préstamo.',
      };
    }

    if (this.hasActiveLoan(item.id)) {
      return {
        label: 'Prestado',
        tone: 'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300',
        hint: 'Debe registrarse la devolución antes de continuar.',
      };
    }

    if (item.quantity <= 0) {
      return {
        label: 'Sin stock',
        tone: 'bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300',
        hint: 'No hay unidades disponibles para préstamo o consumo.',
      };
    }

    return {
      label: 'Disponible',
      tone: 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300',
      hint: 'Hay stock disponible para movimiento.',
    };
  }

  openReturnModal(item: InventoryItem, movement: InventoryMovement): void {
    if (movement.type !== 'LOAN' || movement.returnedAt) {
      return;
    }

    this.returnItem = item;
    this.returnMovement = movement;
    this.returnReceivedBy = this.getCurrentUserName();
    this.returnModalOpen = true;
  }

  closeReturnModal(): void {
    this.returnModalOpen = false;
    this.returnItem = null;
    this.returnMovement = null;
    this.returnReceivedBy = '';
  }

  submitReturn(): void {
    if (!this.returnItem || !this.returnMovement) {
      return;
    }

    const receivedBy = this.returnReceivedBy.trim();
    if (!receivedBy) {
      this.errorMessage = 'La persona que recibió el artículo es obligatoria.';
      return;
    }

    this.inventoryService.registerReturn(this.returnItem.id, this.returnMovement.id, receivedBy).subscribe({
      next: () => {
        this.closeReturnModal();
        this.loadItems();
      },
      error: () => {
        this.errorMessage = 'No se pudo registrar la devolución.';
      },
    });
  }

  getCategoryLabel(category: InventoryCategory): string {
    const map = {
      ASSET: 'Activo',
      MATERIAL: 'Material',
      TOOL: 'Herramienta',
    } as const;
    return map[category];
  }

  categoryCount(category: InventoryCategory): number {
    return this.items.filter((item) => item.category === category).length;
  }

  openHistory(item: InventoryItem): void {
    this.historyItem = item;
    this.historyOpen = true;

    // Carga el historial solo cuando se pide, un artículo a la vez.
    this.inventoryService.listMovements(item.id).subscribe({
      next: (movements) => {
        this.movementHistory[item.id] = movements;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.movementHistory[item.id] = [];
      },
    });
  }

  closeHistory(): void {
    this.historyOpen = false;
    this.historyItem = null;
  }

  getMovementLabel(type: InventoryMovementType): string {
    const map: Record<InventoryMovementType, string> = {
      LOAN: 'Préstamo',
      RETURN: 'Retorno',
      CONSUMPTION: 'Consumo',
      ADJUSTMENT: 'Ajuste',
    };
    return map[type];
  }
}
