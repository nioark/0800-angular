import { Injectable, OnInit } from '@angular/core';
import { Observable, from, map, of } from 'rxjs';
import PocketBase, { RecordModel } from 'pocketbase';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment';
import { HostListener } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  pb: PocketBase | undefined;

  constructor(
    public routerSrv: Router,
    private http: HttpClient,
  ) {
    this.pb = new PocketBase(environment.apiUrl);

    addEventListener('mousemove', (event) => {
      this.handleMouseMove(event);
    });
  }

  FetchPessoas(): Observable<any[]> {
    return this.http.get<any[]>(environment.apiUrl + '/fetchPessoas');
  }

  FinalizarChamado(
    chamado: RecordModel,
    status = 'finalizado',
  ): Observable<any> {
    const formData = new FormData();
    formData.append('chamado_id', chamado.id);
    formData.append('status', status);
    return this.http.post<any>(
      environment.apiUrl + `/finalizarChamado`,
      formData,
    );
  }

  ReabrirChamado(chamado: RecordModel): Observable<any> {
    const formData = new FormData();
    formData.append('chamado_id', chamado.id);
    return this.http.post<any>(
      environment.apiUrl + `/reabrirChamado`,
      formData,
    );
  }

  GetTime(): Observable<Date> {
    return this.http
      .get<Date>(environment.apiUrl + `/getTime`)
      .pipe(map((data) => new Date(data)));
  }

  handleMouseMove(event: any) {
    this.SendMousePos(event.x, event.y);
  }

  SendMousePos(x: number, y: number) {
    const formData = new FormData();
    formData.append('pos_x', x.toString());
    formData.append('pos_y', y.toString());
    formData.append('id', this.pb?.authStore.model!['id']);
    return this.http
      .post<any>(environment.apiUrl + `/mouseeventpos`, formData)
      .subscribe((data) => {});
  }
}
