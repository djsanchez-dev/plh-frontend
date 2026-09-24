import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Employee, EmployeeForm, EmployeeService } from '../../../shared/services/employee.service';

@Component({
  selector: 'app-admin-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-employees.component.html',
})
export class AdminEmployeesComponent implements OnInit {
  employees: Employee[] = [];
  loading = false;
  errorMessage = '';
  formOpen = false;
  editingId: string | null = null;
  form: EmployeeForm = this.emptyForm();

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.errorMessage = '';
    this.employeeService.list().subscribe({
      next: (employees) => {
        this.employees = [...employees];
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo cargar la lista de empleados.';
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.formOpen = true;
  }

  openEdit(employee: Employee): void {
    this.editingId = employee.id;
    this.form = {
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email ?? '',
      employeeType: employee.employeeType,
      documentType: employee.documentType ?? '',
      documentNumber: employee.documentNumber ?? '',
      phone: employee.phone ?? '',
      address: employee.address ?? '',
      active: employee.active,
    };
    this.formOpen = true;
  }

  closeForm(): void {
    this.formOpen = false;
    this.editingId = null;
    this.form = this.emptyForm();
  }

  save(): void {
    if (!this.form.firstName.trim() || !this.form.lastName.trim() || !this.form.employeeType) {
      this.errorMessage = 'Nombre, apellido y tipo de empleado son obligatorios.';
      return;
    }

    const payload = {
      ...this.form,
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      email: this.form.email.trim(),
      documentType: this.form.documentType.trim(),
      documentNumber: this.form.documentNumber.trim(),
      phone: this.form.phone.trim(),
      address: this.form.address.trim(),
      active: this.form.active,
    };

    const request$ = this.editingId
      ? this.employeeService.update(this.editingId, payload)
      : this.employeeService.create(payload);

    request$.subscribe({
      next: () => {
        this.closeForm();
        this.loadEmployees();
      },
      error: () => {
        this.errorMessage = 'No se pudo guardar el empleado.';
      },
    });
  }

  deleteEmployee(employee: Employee): void {
    if (!window.confirm(`¿Eliminar a ${employee.fullName || `${employee.firstName} ${employee.lastName}`}?`)) {
      return;
    }

    this.employeeService.delete(employee.id).subscribe({
      next: () => this.loadEmployees(),
      error: () => {
        this.errorMessage = 'No se pudo eliminar el empleado.';
      },
    });
  }

  private emptyForm(): EmployeeForm {
    return {
      firstName: '',
      lastName: '',
      email: '',
      employeeType: 'MAINTENANCE',
      documentType: '',
      documentNumber: '',
      phone: '',
      address: '',
      active: true,
    };
  }
}
