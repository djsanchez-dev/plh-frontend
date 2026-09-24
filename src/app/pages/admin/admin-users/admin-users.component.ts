import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminPerson,
  AdminPersonForm,
  BOARD_POSITIONS,
  BOARD_POSITION_LABELS,
  BoardPosition,
} from '../../../shared/models/admin.models';
import { AdminUsersService } from '../../../shared/services/admin-users.service';
import { Employee, EmployeeService } from '../../../shared/services/employee.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
  people: AdminPerson[] = [];
  filteredPeople: AdminPerson[] = [];
  employees: Employee[] = [];
  loading = false;
  pageLoading = true;
  errorMessage = '';
  formOpen = false;
  editingId: string | null = null;
  searchTerm = '';
  roleFilter = 'ALL';
  formError = '';
  fieldErrors: Record<string, string> = {};

  form: AdminPersonForm = this.emptyForm();

  readonly boardPositions = BOARD_POSITIONS;
  readonly boardPositionLabels = BOARD_POSITION_LABELS;

  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly employeeService: EmployeeService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadPeople();
    this.loadEmployees();
  }

  loadPeople(): void {
    this.loading = true;
    this.errorMessage = '';
    this.adminUsersService.list().subscribe({
      next: (people) => {
        this.people = [...people];
        this.applyFilters();
        this.loading = false;
        this.pageLoading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.pageLoading = false;
        this.errorMessage = 'No se pudo cargar la lista de usuarios.';
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
    });
  }

  loadEmployees(): void {
    this.employeeService.list().subscribe({
      next: (employees) => {
        this.employees = [...employees];
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.employees = [];
      },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.formError = '';
    this.fieldErrors = {};
    this.form = this.emptyForm();
    this.formOpen = true;
  }

  bindEmployee(employee: Employee | null): void {
    if (!employee) {
      return;
    }

    this.form = {
      ...this.form,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email ?? '',
      role: 'EMPLOYEE',
      employeeType: employee.employeeType,
      documentType: employee.documentType ?? '',
      documentNumber: employee.documentNumber ?? '',
      phone: employee.phone ?? '',
      address: employee.address ?? '',
      boardMember: false,
      boardPosition: null,
      property: '',
    };
  }

  /** La directiva se forma con propietarios: el marcador solo aplica si el rol es OWNER. */
  onRoleChange(): void {
    if (this.form.role !== 'OWNER') {
      this.form.boardMember = false;
    }
    if (!this.showBoardPosition) {
      this.form.boardPosition = null;
    }
  }

  get showBoardPosition(): boolean {
    return this.form.role === 'BOARD' || (this.form.role === 'OWNER' && this.form.boardMember);
  }

  openEdit(person: AdminPerson): void {
    this.editingId = person.id;
    this.formError = '';
    this.fieldErrors = {};
    this.form = {
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      password: '',
      role: person.role,
      employeeType: person.employeeType ?? null,
      documentType: person.documentType ?? '',
      documentNumber: person.documentNumber ?? '',
      phone: person.phone ?? '',
      address: person.address ?? '',
      boardMember: person.boardMember ?? false,
      boardPosition: person.boardPosition ?? null,
      property: person.property ?? '',
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

  get hasFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }

  get fieldErrorList(): { field: string; message: string }[] {
    return Object.entries(this.fieldErrors).map(([field, message]) => ({ field, message }));
  }

  save(): void {
    this.formError = '';
    this.fieldErrors = {};
    const payload = {
      ...this.form,
      boardPosition: this.showBoardPosition ? this.form.boardPosition : null,
    };
    const editing = this.editingId;
    const request$ = editing
      ? this.adminUsersService.update(editing, payload)
      : this.adminUsersService.create(payload);

    request$.subscribe({
      next: () => {
        this.closeForm();
        this.loadPeople();
        this.toast.success(editing ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
      },
      error: (error) => {
        this.fieldErrors = error.error?.errors ?? {};
        this.formError = this.hasFieldErrors ? '' : (error.error?.message ?? 'No se pudo guardar al usuario.');
      },
    });
  }

  deletePerson(person: AdminPerson): void {
    if (!window.confirm(`¿Eliminar a ${person.fullName || `${person.firstName} ${person.lastName}`}?`)) {
      return;
    }

    this.adminUsersService.delete(person.id).subscribe({
      next: () => {
        this.loadPeople();
        this.toast.success('Usuario eliminado.');
      },
      error: (error) => this.toast.error(error.error?.message ?? 'No se pudo eliminar el usuario.'),
    });
  }

  filterRole(role: string): void {
    this.roleFilter = role;
    this.applyFilters();
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredPeople = this.people.filter((person) => {
      const matchesRole = this.roleFilter === 'ALL' || person.role === this.roleFilter;
      const matchesSearch = !term
        || person.fullName?.toLowerCase().includes(term)
        || `${person.firstName} ${person.lastName}`.toLowerCase().includes(term)
        || person.email?.toLowerCase().includes(term);
      return matchesRole && matchesSearch;
    });
  }

  private emptyForm(): AdminPersonForm {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'OWNER',
      employeeType: null,
      documentType: '',
      documentNumber: '',
      phone: '',
      address: '',
      boardMember: false,
      boardPosition: null,
      property: '',
    };
  }
}
