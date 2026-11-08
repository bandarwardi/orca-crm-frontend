import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface BackendConversation {
  id: string;
  tenant_id: string;
  phone_number: string;
  customer_id: string | null;
  lead_id: string | null;
  status: string;
  last_message_at: string;
  last_message?: string;
  last_message_status?: string;
  last_message_direction?: string;
  created_at: string;
  updated_at: string;
  customer?: any;
  lead?: any;
}

export interface BackendMessage {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  content_type: string;
  content: string;
  status: string;
  created_at: string;
  whatsapp_message_id?: string;
}

@Injectable({ providedIn: 'root' })
export class InboxApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/inbox`;
  private whatsappUrl = `${environment.apiUrl}/whatsapp`;
  private ringcentralUrl = `${environment.apiUrl}/ringcentral`;

  getConversations(): Observable<{ data: BackendConversation[]; total: number }> {
    return this.http.get<{ data: BackendConversation[]; total: number }>(`${this.apiUrl}/conversations`);
  }

  startConversation(dto: {
    phone_number: string;
    contact_name?: string;
    content: string;
    content_type?: string;
    whatsapp_account_id?: string;
    template_name?: string;
    template_language?: string;
  }): Observable<{ conversation: BackendConversation; message: BackendMessage }> {
    return this.http.post<{ conversation: BackendConversation; message: BackendMessage }>(
      `${this.apiUrl}/conversations`,
      dto
    );
  }

  getMessages(conversationId: string): Observable<{ data: BackendMessage[]; total: number }> {
    return this.http.get<{ data: BackendMessage[]; total: number }>(`${this.apiUrl}/conversations/${conversationId}/messages`);
  }

  sendMessage(
    conversationId: string,
    dto: { content: string; content_type?: string; whatsapp_account_id?: string; filename?: string; caption?: string }
  ): Observable<BackendMessage> {
    return this.http.post<BackendMessage>(`${this.apiUrl}/conversations/${conversationId}/messages`, dto);
  }

  uploadMedia(file: File): Observable<{ url: string; fileName: string; fileSize: string; mimeType: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string; fileName: string; fileSize: string; mimeType: string }>(
      `${this.apiUrl}/upload`,
      formData
    );
  }

  sendTemplateMessage(
    conversationId: string,
    dto: { templateName: string; templateText: string; language?: string; whatsapp_account_id?: string }
  ): Observable<BackendMessage> {
    return this.http.post<BackendMessage>(`${this.apiUrl}/conversations/${conversationId}/messages`, {
      content: dto.templateText,
      content_type: 'template',
      whatsapp_account_id: dto.whatsapp_account_id,
    });
  }

  sendDirectWhatsapp(payload: {
    to: string;
    text?: string;
    type?: 'text' | 'template';
    templateName?: string;
    templateLanguage?: string;
  }): Observable<any> {
    return this.http.post(`${this.whatsappUrl}/send`, payload);
  }

  sendRingCentralSms(payload: { to: string; text: string; from?: string }): Observable<any> {
    return this.http.post(`${this.ringcentralUrl}/sms`, payload);
  }

  triggerRingOut(payload: { toNumber: string; fromNumber?: string; callerId?: string }): Observable<any> {
    return this.http.post(`${this.ringcentralUrl}/ring-out`, payload);
  }

  getRingCentralCallLog(query?: { dateFrom?: string; dateTo?: string; page?: number; perPage?: number }): Observable<{ records: any[]; total: number }> {
    return this.http.get<{ records: any[]; total: number }>(`${this.ringcentralUrl}/call-log`, { params: query as any });
  }
}
