import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentsApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payments`;

  search(dto: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/search`, dto);
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }
}
