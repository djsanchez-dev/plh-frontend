import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InventoryCategory,
  InventoryItem,
  InventoryItemForm,
  InventoryMovement,
  InventoryMovementForm,
} from '../models/inventory.models';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/api/inventory`;

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(API_URL);
  }

  listByCategory(category: InventoryCategory): Observable<InventoryItem[]> {
    const params = new HttpParams().set('category', category);
    return this.http.get<InventoryItem[]>(`${API_URL}/category`, { params });
  }

  create(item: InventoryItemForm): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(API_URL, item);
  }

  update(id: string, item: InventoryItemForm): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${API_URL}/${id}`, item);
  }

  listMovements(itemId: string): Observable<InventoryMovement[]> {
    return this.http.get<InventoryMovement[]>(`${API_URL}/${itemId}/movements`);
  }

  listActiveLoans(): Observable<InventoryMovement[]> {
    return this.http.get<InventoryMovement[]>(`${API_URL}/movements/active-loans`);
  }

  createMovement(itemId: string, payload: InventoryMovementForm): Observable<InventoryMovement> {
    return this.http.post<InventoryMovement>(`${API_URL}/${itemId}/movements`, payload);
  }

  registerReturn(itemId: string, movementId: string, receivedBy: string): Observable<InventoryMovement> {
    const params = new HttpParams().set('receivedBy', receivedBy);
    return this.http.post<InventoryMovement>(`${API_URL}/${itemId}/movements/${movementId}/return`, null, { params });
  }


  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
