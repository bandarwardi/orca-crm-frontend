import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getSummary(filter?: { user_id?: string }): Observable<any> {
    const params: any = {};
    if (filter?.user_id) params.user_id = filter.user_id;
    return this.http.get(`${this.apiUrl}/summary`, { params });
  }
}
