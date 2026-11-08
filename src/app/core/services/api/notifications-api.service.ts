import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationsApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  getMyNotifications(filters?: { status?: string; category?: string; user_id?: string }): Observable<any[]> {
    const params: any = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.category) params.category = filters.category;
    if (filters?.user_id) params.user_id = filters.user_id;
    return this.http.get<any[]>(`${this.apiUrl}/my-notifications`, { params });
  }

  markAsRead(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(userId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/read-all`, { user_id: userId });
  }
}
