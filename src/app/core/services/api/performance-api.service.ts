import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PerformanceApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/performance`;

  getKpis(filter?: { startDate?: string; endDate?: string; user_id?: string }): Observable<any> {
    const params: any = {};
    if (filter?.startDate) params.startDate = filter.startDate;
    if (filter?.endDate) params.endDate = filter.endDate;
    if (filter?.user_id) params.user_id = filter.user_id;
    return this.http.get(`${this.apiUrl}/kpis`, { params });
  }

  getLeaderboard(filter?: { startDate?: string; endDate?: string }): Observable<any[]> {
    const params: any = {};
    if (filter?.startDate) params.startDate = filter.startDate;
    if (filter?.endDate) params.endDate = filter.endDate;
    return this.http.get<any[]>(`${this.apiUrl}/leaderboard`, { params });
  }
}
