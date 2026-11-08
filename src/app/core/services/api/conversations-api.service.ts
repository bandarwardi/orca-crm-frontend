import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConversationsApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/conversations`;

  search(filters?: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/search`, filters || {});
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(dto: any): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }

  sendMessage(conversationId: string, dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${conversationId}/messages`, dto);
  }

  assign(conversationId: string, userId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${conversationId}/assign`, { user_id: userId });
  }
}
