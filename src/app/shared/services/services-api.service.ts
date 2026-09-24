import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConsumptionRecord, OwnerSummary } from '../models/services.models';
import { ScanInfo, ScanSaveRequest, ScanTodaySummary } from '../models/scan.models';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/api/services`;

@Injectable({ providedIn: 'root' })
export class ServicesApiService {
  constructor(private readonly http: HttpClient) {}

  listOwners(): Observable<OwnerSummary[]> {
    return this.http.get<OwnerSummary[]>(`${API_URL}/owners`);
  }

  /** Historial completo de mediciones diarias del propietario. */
  getConsumption(ownerId: string): Observable<ConsumptionRecord[]> {
    return this.http.get<ConsumptionRecord[]>(`${API_URL}/owners/${ownerId}/consumption`);
  }

  createConsumption(ownerId: string, record: Omit<ConsumptionRecord, 'id'>): Observable<ConsumptionRecord> {
    return this.http.post<ConsumptionRecord>(`${API_URL}/owners/${ownerId}/consumption`, record);
  }

  updateConsumption(id: string, record: Omit<ConsumptionRecord, 'id'>): Observable<ConsumptionRecord> {
    return this.http.put<ConsumptionRecord>(`${API_URL}/consumption/${id}`, record);
  }

  deleteConsumption(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/consumption/${id}`);
  }

  // ----- Flujo QR -----

  /** Ficha de la propiedad escaneada (propietario + lecturas). */
  getScan(qrCode: string): Observable<ScanInfo> {
    return this.http.get<ScanInfo>(`${API_URL}/scan/${qrCode}`);
  }

  /** Guarda (o corrige) la medición de hoy con las lecturas de los medidores. */
  saveScan(qrCode: string, body: ScanSaveRequest): Observable<ConsumptionRecord> {
    return this.http.post<ConsumptionRecord>(`${API_URL}/scan/${qrCode}/consumption`, body);
  }

  /** Avance del recorrido: propiedades medidas y pendientes de hoy. */
  getToday(): Observable<ScanTodaySummary> {
    return this.http.get<ScanTodaySummary>(`${API_URL}/today`);
  }
}
