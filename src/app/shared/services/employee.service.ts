import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type EmployeeRole = 'CLEANING' | 'MAINTENANCE' | 'GARDENING' | 'CCTV_OPERATOR' | 'SECURITY_GUARD' | 'ASSISTANT_ADMIN';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string | null;
  employeeType: EmployeeRole;
  documentType?: string | null;
  documentNumber?: string | null;
  phone?: string | null;
  address?: string | null;
  active: boolean;
}

export interface EmployeeForm {
  firstName: string;
  lastName: string;
  email: string;
  employeeType: EmployeeRole | null;
  documentType: string;
  documentNumber: string;
  phone: string;
  address: string;
  active: boolean;
}

const API_URL = `${environment.apiUrl}/api/employees`;

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<Employee[]> {
    return this.http.get<Employee[]>(API_URL);
  }

  create(payload: EmployeeForm): Observable<Employee> {
    return this.http.post<Employee>(API_URL, payload);
  }

  update(id: string, payload: Partial<EmployeeForm>): Observable<Employee> {
    return this.http.put<Employee>(`${API_URL}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
