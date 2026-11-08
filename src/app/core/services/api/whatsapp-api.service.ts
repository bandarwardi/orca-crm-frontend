import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface WhatsAppAccount {
  id: string;
  tenant_id?: string;
  name: string;
  phone_number: string;
  phone_number_id: string;
  waba_id?: string;
  access_token: string;
  app_secret?: string;
  is_default: boolean;
  status: 'active' | 'inactive' | 'unverified';
  created_at?: string;
  updated_at?: string;
}

export interface CreateWhatsAppAccountDto {
  name: string;
  phone_number: string;
  phone_number_id: string;
  waba_id?: string;
  access_token: string;
  app_secret?: string;
  is_default?: boolean;
  status?: 'active' | 'inactive' | 'unverified';
}

export interface UpdateWhatsAppAccountDto {
  name?: string;
  phone_number?: string;
  phone_number_id?: string;
  waba_id?: string;
  access_token?: string;
  app_secret?: string;
  is_default?: boolean;
  status?: 'active' | 'inactive' | 'unverified';
}

export interface TestConnectionDto {
  phone_number_id: string;
  access_token: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: {
    verified_name?: string;
    display_phone_number?: string;
    quality_rating?: string;
    id?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class WhatsAppApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/whatsapp`;

  getAccounts(): Observable<{ data: WhatsAppAccount[]; total: number }> {
    return this.http.get<{ data: WhatsAppAccount[]; total: number }>(`${this.apiUrl}/accounts`);
  }

  createAccount(dto: CreateWhatsAppAccountDto): Observable<WhatsAppAccount> {
    return this.http.post<WhatsAppAccount>(`${this.apiUrl}/accounts`, dto);
  }

  updateAccount(id: string, dto: UpdateWhatsAppAccountDto): Observable<WhatsAppAccount> {
    return this.http.put<WhatsAppAccount>(`${this.apiUrl}/accounts/${id}`, dto);
  }

  deleteAccount(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/accounts/${id}`);
  }

  testConnection(dto: TestConnectionDto): Observable<TestConnectionResponse> {
    return this.http.post<TestConnectionResponse>(`${this.apiUrl}/accounts/test-connection`, dto);
  }
}
