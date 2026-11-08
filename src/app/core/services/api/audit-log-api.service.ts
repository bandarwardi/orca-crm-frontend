import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuditLogApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/audit-logs`;

  search(filters?: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/search`, filters || {});
  }
}
