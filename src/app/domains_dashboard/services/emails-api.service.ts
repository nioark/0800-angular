import { EmailData } from './../models/email';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmailApi } from '../models/email';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class EmailsApiService {
  constructor(private http: HttpClient) {}

  get(serverId: number, serviceId: number): Observable<EmailApi[]> {
    return this.http
      .get<
        EmailApi[]
      >(environment.apiUrlDomains + '/emails/' + serverId + '/' + serviceId)
      .pipe(tap());
  }

  fetch(): Observable<EmailApi[]> {
    return this.http.get<EmailApi[]>(environment.apiUrlDomains + '/emails');
  }
}
