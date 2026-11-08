import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface RingcentralConfigModel {
  id: string;
  tenant_id: string;
  server_url: string;
  client_id: string;
  has_client_secret: boolean;
  has_jwt_token: boolean;
  main_phone_number: string;
  webhook_verify_token: string;
  is_enabled: boolean;
  status: 'active' | 'inactive' | 'error';
  last_tested_at?: string;
  last_error?: string;
  webhook_url: string;
}

export interface RingcentralTestResult {
  success: boolean;
  message: string;
  data?: {
    company_name?: string;
    main_number?: string;
    status?: string;
    tier?: string;
  };
}

export interface RingcentralPhoneNumberModel {
  id: string;
  tenant_id: string;
  phone_number: string;
  label: string;
  department: string;
  usage_type?: string;
  extension_number?: string;
  features?: string[];
  is_default: boolean;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class RingcentralApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ringcentral`;

  getConfig(): Observable<RingcentralConfigModel> {
    return this.http.get<RingcentralConfigModel>(`${this.apiUrl}/config`);
  }

  updateConfig(dto: any): Observable<RingcentralConfigModel> {
    return this.http.post<RingcentralConfigModel>(`${this.apiUrl}/config`, dto);
  }

  testConnection(dto: any): Observable<RingcentralTestResult> {
    return this.http.post<RingcentralTestResult>(`${this.apiUrl}/test-connection`, dto);
  }

  subscribeWebhook(webhookUrl: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/subscribe`, { webhookUrl });
  }

  getCallLog(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/call-log`, { params });
  }

  sendSms(to: string, text: string, from?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sms`, { to, text, from });
  }

  initiateRingOut(toNumber: string, fromNumber?: string, callerId?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ring-out`, { toNumber, fromNumber, callerId });
  }

  // ==========================================
  // متعدد خطوط الهاتف (Multi-Line Phone Numbers)
  // ==========================================

  getPhoneNumbers(): Observable<RingcentralPhoneNumberModel[]> {
    return this.http.get<RingcentralPhoneNumberModel[]>(`${this.apiUrl}/phone-numbers`);
  }

  createPhoneNumber(dto: Partial<RingcentralPhoneNumberModel>): Observable<RingcentralPhoneNumberModel> {
    return this.http.post<RingcentralPhoneNumberModel>(`${this.apiUrl}/phone-numbers`, dto);
  }

  updatePhoneNumber(id: string, dto: Partial<RingcentralPhoneNumberModel>): Observable<RingcentralPhoneNumberModel> {
    return this.http.put<RingcentralPhoneNumberModel>(`${this.apiUrl}/phone-numbers/${id}`, dto);
  }

  deletePhoneNumber(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/phone-numbers/${id}`);
  }

  setDefaultPhoneNumber(id: string): Observable<RingcentralPhoneNumberModel> {
    return this.http.post<RingcentralPhoneNumberModel>(`${this.apiUrl}/phone-numbers/${id}/default`, {});
  }

  syncPhoneNumbers(): Observable<{ synced: number; numbers: RingcentralPhoneNumberModel[] }> {
    return this.http.post<{ synced: number; numbers: RingcentralPhoneNumberModel[] }>(`${this.apiUrl}/phone-numbers/sync`, {});
  }
}

