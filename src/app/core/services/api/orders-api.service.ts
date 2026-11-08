import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(dto: any): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }

  update(id: string, dto: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, dto);
  }

  addDevice(orderId: string, dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${orderId}/devices`, dto);
  }

  removeDevice(orderId: string, deviceId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${orderId}/devices/${deviceId}`);
  }
}
