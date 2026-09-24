import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminPerson, AdminPersonForm, PropertyPrint } from '../models/admin.models';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/api/admin/people`;

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<AdminPerson[]> {
    return this.http.get<AdminPerson[]>(API_URL);
  }

  listOwners(): Observable<AdminPerson[]> {
    return this.http.get<AdminPerson[]>(`${API_URL}/owners`);
  }

  listEmployees(): Observable<AdminPerson[]> {
    return this.http.get<AdminPerson[]>(`${API_URL}/employees`);
  }

  listDirectives(): Observable<AdminPerson[]> {
    return this.http.get<AdminPerson[]>(`${API_URL}/directives`);
  }

  listPending(): Observable<AdminPerson[]> {
    return this.http.get<AdminPerson[]>(`${API_URL}/pending`);
  }

  /** Propiedades con su QR (impresión de etiquetas). */
  listProperties(): Observable<PropertyPrint[]> {
    return this.http.get<PropertyPrint[]>(`${environment.apiUrl}/api/properties`);
  }

  setEnabled(id: string, enabled: boolean): Observable<AdminPerson> {
    return this.http.put<AdminPerson>(`${API_URL}/${id}/enabled`, null, {
      params: { enabled: String(enabled) },
    });
  }

  resetPassword(id: string, newPassword: string): Observable<AdminPerson> {
    return this.http.put<AdminPerson>(`${API_URL}/${id}/password`, { newPassword });
  }

  create(person: AdminPersonForm): Observable<AdminPerson> {
    return this.http.post<AdminPerson>(API_URL, person);
  }

  update(id: string, person: Partial<AdminPersonForm>): Observable<AdminPerson> {
    return this.http.put<AdminPerson>(`${API_URL}/${id}`, person);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
