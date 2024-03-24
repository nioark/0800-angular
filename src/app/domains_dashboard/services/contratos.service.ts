import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Contrato } from '../models/contrato';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class ContratosService {
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  fetch(): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(`${environment.apiUrlDomains}/contratos`);
  }
}
