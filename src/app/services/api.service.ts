import { Injectable } from '@angular/core';
import { Observable, from, map, of } from 'rxjs';
import PocketBase, { RecordModel } from 'pocketbase';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  pb : PocketBase | undefined

  constructor(public routerSrv : Router, private http : HttpClient) { }

  FetchPessoas() : Observable<any[]> {
    return this.http.get<any[]>( environment.apiUrl + '/fetchPessoas')
  }

  FinalizarChamado(chamado : RecordModel, status="finalizado") : Observable<any> {
    const formData = new FormData();
    formData.append('chamado_id', chamado.id);
    formData.append('status', status);
    return this.http.post<any>(environment.apiUrl + `/finalizarChamado`, formData)

  }

  GetTime() : Observable<Date> {
    return this.http.get<Date>(environment.apiUrl + `/getTime`).pipe(
      map(data => new Date(data)))
  }
}
