import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type CondominiumStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
export type PointStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
export type PointType = 'ADMIN' | 'RESIDENTIAL' | 'COMMON_AREA' | 'PARKING' | 'STORAGE' | 'GATE' | 'POOL' | 'SERVICE';

export interface CondominiumSummary {
  id: string;
  code: string;
  name: string;
  country: string;
  city: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  status?: CondominiumStatus;
}

export interface CondominiumForm {
  code: string;
  name: string;
  country: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  status: CondominiumStatus;
}

export interface CondominiumPointSummary {
  id: string;
  condominiumId: string;
  condominiumName?: string;
  code: string;
  name: string;
  pointType: PointType;
  address?: string;
  status?: PointStatus;
}

export interface PointForm {
  condominiumId: string;
  code: string;
  name: string;
  pointType: PointType;
  address: string;
  status: PointStatus;
}

const API_URL = `${environment.apiUrl}/api`;

@Injectable({ providedIn: 'root' })
export class CondominiumService {
  constructor(private readonly http: HttpClient) {}

  // ---------- Condominios ----------

  listCondominiums(): Observable<CondominiumSummary[]> {
    return this.http.get<CondominiumSummary[]>(`${API_URL}/condominiums`);
  }

  createCondominium(form: CondominiumForm): Observable<CondominiumSummary> {
    return this.http.post<CondominiumSummary>(`${API_URL}/condominiums`, form);
  }

  updateCondominium(id: string, form: CondominiumForm): Observable<CondominiumSummary> {
    return this.http.put<CondominiumSummary>(`${API_URL}/condominiums/${id}`, form);
  }

  deleteCondominium(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/condominiums/${id}`);
  }

  // ---------- Puntos ----------

  listPoints(): Observable<CondominiumPointSummary[]> {
    return this.http.get<CondominiumPointSummary[]>(`${API_URL}/condominium-points`);
  }

  createPoint(form: PointForm): Observable<CondominiumPointSummary> {
    return this.http.post<CondominiumPointSummary>(`${API_URL}/condominium-points`, form);
  }

  updatePoint(id: string, form: PointForm): Observable<CondominiumPointSummary> {
    return this.http.put<CondominiumPointSummary>(`${API_URL}/condominium-points/${id}`, form);
  }

  deletePoint(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/condominium-points/${id}`);
  }
}
