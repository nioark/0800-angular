import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../../../../../services/auth.service';
import { PocketChamadosService } from '../../../../../../services/pocket-chamados.service';
import { PocketHorasService } from '../service-horas/pocket-horas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-view-hours',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltip],
  templateUrl: './view-hours.component.html',
  styleUrl: './view-hours.component.scss',
})
export class ViewHoursComponent {
  horas: any[] = [];

  totalHours: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private data: { chamado_id: string; tecnico_id: string },
    private pocket: PocketChamadosService,
    public pocketHoras: PocketHorasService,
    private authSrv: AuthService,
  ) {
    let id = data.tecnico_id;

    this.pocket
      .getRelatoriosParsed(this.data.chamado_id, `&& user = '${id}'`)
      .subscribe((data) => {
        //Todo update with new data from relatorios
        data.forEach((relatorio: any) => {
          if (relatorio.interacao_start != '') {
            relatorio.hora_start = this.pocketHoras.getTimeFromDate(
              relatorio.interacao_start,
            );
          }

          if (relatorio.interacao_end != '') {
            relatorio.hora_end = this.pocketHoras.getTimeFromDate(
              relatorio.interacao_end,
            );
          }

          relatorio.type = 'relatorio';
          if (relatorio.interacao_start == '' || relatorio.interacao_end == '')
            return;
          this.horas.unshift(relatorio);

          this.totalHours += this.pocketHoras.timeElapsed(
            relatorio.hora_start,
            relatorio.hora_end,
          ).hoursNumber;
        });
      });

    this.pocketHoras
      .getHorasUsers(id, this.data.chamado_id)
      .subscribe((data) => {
        data.forEach((hora: any) => {
          if (hora.interacao_start != '') {
            hora.hora_start = this.pocketHoras.getTimeFromDate(
              hora.interacao_start,
            );
          }

          if (hora.interacao_end != '') {
            hora.hora_end = this.pocketHoras.getTimeFromDate(
              hora.interacao_end,
            );
          }

          hora.type = 'hora';

          this.horas.push(hora);
          this.totalHours += this.pocketHoras.timeElapsed(
            hora.hora_start,
            hora.hora_end,
          ).hoursNumber;
        });
      });
  }
}
