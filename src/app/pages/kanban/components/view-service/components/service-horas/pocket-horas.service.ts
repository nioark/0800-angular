import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { environment } from '../../../../../../environment';
import {
  Observable,
  Subject,
  forkJoin,
  from,
  map,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { PocketChamadosService } from '../../../../../../services/pocket-chamados.service';

@Injectable({
  providedIn: 'root',
})
export class PocketHorasService {
  pb = new PocketBase(environment.apiUrl);

  constructor(private pocketChamadoSrv: PocketChamadosService) {}

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

  getTimeFromDate(date: string): string {
    let dateDate: Date = new Date(date);
    let timestring = dateDate
      .toLocaleTimeString('pt-br')
      .split(' ')[0]
      .split(':')
      .slice(0, 2)
      .join(':');
    return timestring;
  }

  getTotalHoras(chamado_id: string): Observable<number> {
    return forkJoin({
      horasData: from(
        this.pb.collection('horas_finalizados').getFullList({
          filter: `chamado.id = "${chamado_id}"`,
          requestKey: null,
        }),
      ),
      relatoriosData: this.pb.collection('relatorios').getFullList({
        filter: `chamado = '${chamado_id}'`,
        requestKey: null,
      }),
    }).pipe(
      switchMap(({ horasData, relatoriosData }) => {
        let total = 0;

        horasData.forEach((item: any) => {
          let start_time = this.getTimeFromDate(item.interacao_start);
          let end_time = this.getTimeFromDate(item.interacao_end);
          let timeElapsed = this.timeElapsed(start_time, end_time);
          total += timeElapsed.hoursNumber;
        });

        relatoriosData.forEach((item: any) => {
          let start_time = this.getTimeFromDate(item.interacao_start);
          let end_time = this.getTimeFromDate(item.interacao_end);
          let timeElapsed = this.timeElapsed(start_time, end_time);
          total += timeElapsed.hoursNumber;
        });

        return of(total);
      }),
    );
  }

  hoursFormat(horas: number) {
    let hours = Math.floor(horas);
    let minutes = Math.floor((horas % 1) * 60);
    return `${hours}h${minutes > 9 ? minutes : '0' + minutes}`;
  }

  timeElapsed(
    startTime: string,
    endTime: string,
  ): { hoursNumber: number; hourFormat: string } {
    const start = new Date();
    start.setHours(
      Number(startTime.split(':')[0]),
      Number(startTime.split(':')[1]),
      0,
      0,
    );

    const end = new Date();
    end.setHours(
      Number(endTime.split(':')[0]),
      Number(endTime.split(':')[1]),
      0,
      0,
    );

    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      hoursNumber: diff / (1000 * 60 * 60),
      hourFormat: `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
    };
  }
}
