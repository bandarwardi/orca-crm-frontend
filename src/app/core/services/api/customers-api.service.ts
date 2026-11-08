import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomersApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/customers`;

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

  getMapPins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/map-pins`);
  }
}
