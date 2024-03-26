import { Component, EventEmitter, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { PocketChamadosService } from '../../../../../../services/pocket-chamados.service';
import { AuthService } from '../../../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { PocketHorasService } from './pocket-horas.service';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-confirm-finalizar',
  standalone: true,
  imports: [MatDialogClose, FormsModule, CommonModule, MatTooltip],
  templateUrl: './confirm-finalizar.component.html',
  styleUrl: './confirm-finalizar.component.scss',
})
export class ConfirmFinalizarComponent {
  horasNumber: number = 12;
  minutoNumber: number = 0;

  duracao: any;

  horas: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private pocket: PocketChamadosService,
    private pocketHoras: PocketHorasService,
    private authSrv: AuthService,
  ) {
    let id = this.authSrv.getID();

    let user = data.expand.users.find((user: any) => user.id == id);
    let horas = user.duracao_total_seconds / 3600;
    let minutos = (user.duracao_total_seconds % 3600) / 60;

    this.horasNumber = Math.floor(horas);
    this.minutoNumber = Math.floor(minutos);

    this.pocket
      .getRelatoriosParsed(this.data.id, `&& user = '${id}'`)
      .subscribe((data) => {
        //Todo update with new data from relatorios
        data.forEach((relatorio: any) => {
          if (relatorio.interacao_start != '') {
            relatorio.hora_start = this.getTimeFromDate(
              relatorio.interacao_start,
            );
          }

          if (relatorio.interacao_end != '') {
            relatorio.hora_end = this.getTimeFromDate(relatorio.interacao_end);
          }

          relatorio.type = 'relatorio';

          this.horas.unshift(relatorio);
        });
      });

    this.pocketHoras.getHorasUsers(id, this.data.id).subscribe((data) => {
      data.forEach((hora: any) => {
        if (hora.interacao_start != '') {
          hora.hora_start = this.getTimeFromDate(hora.interacao_start);
        }

        if (hora.interacao_end != '') {
          hora.hora_end = this.getTimeFromDate(hora.interacao_end);
        }

        hora.type = 'hora';

        this.horas.push(hora);
      });
    });
  }

  updateRelatorio(hora: any, start_time: string, end_time: string) {
    var date_now = new Date();
    var date_start = new Date(
      date_now.getFullYear(),
      date_now.getMonth(),
      date_now.getDate(),
      parseInt(start_time.split(':')[0]),
      parseInt(start_time.split(':')[1]),
    );
    var date_end = new Date(
      date_now.getFullYear(),
      date_now.getMonth(),
      date_now.getDate(),
      parseInt(end_time.split(':')[0]),
      parseInt(end_time.split(':')[1]),
    );

    hora['interacao_start'] = date_start.toISOString();
    hora['interacao_end'] = date_end.toISOString();

    if (hora.id != '') {
      this.pocketHoras.updateHoras(hora.id, date_start, date_end);
      console.log('Atualizado objeto');
    } else {
      console.log('Criado objeto');
      this.pocketHoras.createHoras(
        this.data.id,
        this.authSrv.getID(),
        date_start,
        date_end,
      );
    }
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

  addHoras() {
    this.horas.push({
      id: '',
      interacao_start: '',
      interacao_end: '',
      hora_start: '',
      hora_end: '',
    });
  }

  removeHora(hora: any) {
    hora.hora_start = '';
    hora.hora_end = '';
    hora.interacao_end = '';
    hora.interacao_start = '';
    hora.hide = true;

    if (hora.id && hora.id != '') {
      this.pocketHoras.removeHoras(hora.id);
    }
  }

  finalizarChamado() {
    let totalSeconds = 0;

    this.horas.forEach((hora: any) => {
      if (hora.type == 'relatorio') return;

      console.log('Hora para finalizar: ', hora);
      if (hora.hora_start && hora.hora_end) {
        let start_hora = hora.hora_start.split(':');
        let horas_start = parseInt(start_hora[0]);
        let minutos_start = parseInt(start_hora[1]);

        let end_hora = hora.hora_end.split(':');
        let horas_end = parseInt(end_hora[0]);
        let minutos_end = parseInt(end_hora[1]);

        let segundos_start = horas_start * 3600 + minutos_start * 60;
        let segundos_end = horas_end * 3600 + minutos_end * 60;
        let segundos = segundos_end - segundos_start;
        totalSeconds += segundos;

        this.updateRelatorio(hora, hora.hora_start, hora.hora_end);
      }
    });

    this.pocket.addUserFinalizado(
      this.data.id,
      this.authSrv.getID(),
      totalSeconds,
    );

    console.log(this.horas);
  }
}
