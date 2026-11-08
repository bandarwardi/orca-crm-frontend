import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TenantResponse {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  currency: string;
  timezone: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class TenantsApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tenants`;

  getSettings(): Observable<TenantResponse> {
    return this.http.get<TenantResponse>(`${this.apiUrl}/settings`);
  }

  updateSettings(dto: any): Observable<TenantResponse> {
    return this.http.patch<TenantResponse>(`${this.apiUrl}/settings`, dto);
  }
}
