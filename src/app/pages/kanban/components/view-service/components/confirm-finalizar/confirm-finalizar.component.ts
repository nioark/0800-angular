import { Component, EventEmitter, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { PocketCollectionsService } from '../../../../../../services/pocket-collections.service';
import { AuthService } from '../../../../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-finalizar',
  standalone: true,
  imports: [MatDialogClose, FormsModule, CommonModule],
  templateUrl: './confirm-finalizar.component.html',
  styleUrl: './confirm-finalizar.component.scss',
})
export class ConfirmFinalizarComponent {
  horasNumber: number = 12;
  minutoNumber: number = 0;

  duracao: any;

  relatorios: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private pocket: PocketCollectionsService,
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
        this.relatorios = data;
        console.log(this.relatorios);
        this.relatorios.forEach((relatorio: any) => {
          if (relatorio.interacao_start != '') {
            relatorio.hora_start = this.getTimeFromDate(
              relatorio.interacao_start,
            );
          }

          if (relatorio.interacao_end != '') {
            relatorio.hora_end = this.getTimeFromDate(relatorio.interacao_end);
          }
        });
      });
  }

  updateRelatorio(relatorio: any, start_time: string, end_time: string) {
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

    relatorio['interacao_start'] = date_start.toISOString();
    relatorio['interacao_end'] = date_end.toISOString();

    if (relatorio.id != '') {
      this.pocket.pb.collection('relatorios').update(relatorio.id, {
        interacao_start: date_start,
        interacao_end: date_end,
      });
    } else {
      console.log('Criando relatorio...');
      this.pocket.pb.collection('relatorios').create({
        relatorio: '',
        interacao_start: date_start,
        interacao_end: date_end,
        user: this.authSrv.getID(),
        chamado: this.data.id,
      });
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
    this.relatorios.push({
      id: '',
      interacao_start: '',
      interacao_end: '',
      hora_start: '',
      hora_end: '',
    });
  }

  removeRelatorioHours(relatorio: any) {
    relatorio.hora_start = '';
    relatorio.hora_end = '';
    relatorio.interacao_end = '';
    relatorio.interacao_start = '';
    relatorio.hide = true;
  }

  finalizarChamado() {
    let totalSeconds = 0;

    this.relatorios.forEach((relatorio: any) => {
      console.log(relatorio);
      if (relatorio.hora_start && relatorio.hora_end) {
        let start_hora = relatorio.hora_start.split(':');
        let horas_start = parseInt(start_hora[0]);
        let minutos_start = parseInt(start_hora[1]);

        let end_hora = relatorio.hora_end.split(':');
        let horas_end = parseInt(end_hora[0]);
        let minutos_end = parseInt(end_hora[1]);

        let segundos_start = horas_start * 3600 + minutos_start * 60;
        let segundos_end = horas_end * 3600 + minutos_end * 60;
        let segundos = segundos_end - segundos_start;
        totalSeconds += segundos;

        this.updateRelatorio(
          relatorio,
          relatorio.hora_start,
          relatorio.hora_end,
        );
      }
    });

    this.pocket.addUserFinalizado(
      this.data.id,
      this.authSrv.getID(),
      totalSeconds,
    );

    console.log(this.relatorios);
  }
}
