import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import { Custos, CustosAvg } from '../models/analytics';
import { AnimationPlayer } from '@angular/animations';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  fetchCustos(): Observable<Custos> {
    return this.http.get<Custos>(`${environment.apiUrlDomains}/custos`);
    // return this.http.get<Custos>(`http://192.168.101.117:3571/custos`)
  }

  getCustosAvg(): Observable<CustosAvg> {
    return this.http.get<CustosAvg>(`${environment.apiUrlDomains}/custos/get`);
  }

  setCustos(
    server1: string,
    server2: string,
    cwp1: string,
    cwp2: string,
  ): Observable<any> {
    const formData = new FormData();
    formData.append('server1', server1);
    formData.append('server2', server2);
    formData.append('cwp1', cwp1);
    formData.append('cwp2', cwp2);
    return this.http.post(`${environment.apiUrlDomains}/custos/set`, formData);
    // return this.http.post(`http://192.168.101.117:3571/custos/set`, formData)
  }

  getDashboard(): Observable<any> {
    return this.http.get(`${environment.apiUrlDomains}/getgraficos`);
  }
}
