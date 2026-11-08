import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UserResponse {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'sales_supervisor' | 'sales_rep' | 'tech_support';
  is_active: boolean;
  is_online: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getAll(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUrl);
  }

  create(dto: any): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUrl, dto);
  }

  update(id: string, dto: any): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}`, dto);
  }

  setStatus(id: string, isActive: boolean): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}/status`, { is_active: isActive });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
