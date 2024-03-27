import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { environment } from '../../../../../../environment';
import { Observable, Subject, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PocketHorasService {
  pb = new PocketBase(environment.apiUrl);

  constructor() {}

  getHorasUsers(user_id: string, chamado_id: string): Observable<any> {
    let subject = new Subject<any>();

    this.pb
      .collection('horas_finalizados')
      .getFullList({
        filter: `chamado.id = "${chamado_id}" && user.id = "${user_id}"`,
      })
      .then((data) => {
        subject.next(data);
      });

    return subject.asObservable();
  }

  updateHoras(horas_id: string, interacao_start: Date, interacao_end: Date) {
    this.pb.collection('horas_finalizados').update(horas_id, {
      interacao_start: interacao_start,
      interacao_end: interacao_end,
    });
  }

  createHoras(
    chamado_id: string,
    user_id: string,
    interacao_start: Date,
    interacao_end: Date,
  ) {
    console.log('Pocket criando...');
    this.pb.collection('horas_finalizados').create(
      {
        chamado: chamado_id,
        user: user_id,
        interacao_start: interacao_start,
        interacao_end: interacao_end,
      },
      { requestKey: null },
    );
  }

  removeHoras(horas_id: string) {
    this.pb.collection('horas_finalizados').delete(horas_id);
  }
}
