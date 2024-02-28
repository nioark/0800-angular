import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Pipe,
  ViewChild,
} from '@angular/core';
import { Observable, Subscription, from, interval, map } from 'rxjs';
import { ServiceRelatorioComponent } from './components/service-relatorio/service-relatorio.component';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Paragraph from '@editorjs/paragraph';
import Checklist from '@editorjs/checklist';
import SimpleImage from '@editorjs/simple-image';
import LinkTool from '@editorjs/link';
import { NgOptimizedImage } from '@angular/common';

import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';

import Client, { RecordModel } from 'pocketbase';
import { AuthService } from '../../../../services/auth.service';
import { PocketCollectionsService } from '../../../../services/pocket-collections.service';
import { CommonModule } from '@angular/common';
import { ImgAuthPipe } from '../../../../img-auth.pipe';
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular';
import { Editor } from 'tinymce';
import { AddTecnicoComponent } from './components/add-tecnico/add-tecnico.component';
import { HttpClient } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ViewSelectUserComponent } from '../view-select-user/view-select-user.component';
import { ConfirmFinalizarComponent } from './components/confirm-finalizar/confirm-finalizar.component';
import { ApiService } from '../../../../services/api.service';
import { ConfirmCancelarComponent } from './components/confirm-cancelar/confirm-cancelar.component';
import { environment } from '../../../../environment';
import { ViewImageComponent } from '../view-image/view-image.component';

@Component({
  selector: 'app-view-service',
  standalone: true,
  templateUrl: './view-service.component.html',
  styleUrls: ['./view-service.component.scss'],
  imports: [
    ServiceRelatorioComponent,
    MatDialogClose,
    CommonModule,
    NgOptimizedImage,
    ImgAuthPipe,
    EditorModule,
    MatTooltipModule,
  ],
})
export class ViewServiceComponent implements OnDestroy {
  // Define observer variable
  clockObserver$: Observable<number>;

  pb: Client;

  relatorios: any = [];
  mostrarEditor: boolean = false;

  apiUrl = environment.apiUrl;

  @ViewChild('editor') editorNew: EditorComponent | undefined;

  clockIntervalSubscription: Subscription | undefined;
  saveIntervalSubscription: Subscription | undefined;
  chamadoTimersSubscription: Subscription | undefined;
  dataInjectedSubscription: Subscription | undefined;
  relatoriosSubscription: Subscription | undefined;

  data: any;
  serverTime: Date = new Date();
  timeDifference: Date = new Date();
  isAdmin: boolean = false;

  faturado: boolean = false;
  cancelado: boolean = false;
  pausado: boolean = false;
  em_espera: boolean = false;
  em_andamento: boolean = false;
  finalizado: boolean = false;

  participando: boolean = false;
  criadorParticipa: boolean = false;

  created_at: String = '';
  end_at: String = '';

  sketch: String = '';

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private dataInjected: {
      data: any;
      dataObservable: Observable<RecordModel>;
    },
    private http: HttpClient,
    public dialog: MatDialog,
    public AuthSrv: AuthService,
    public pocketSrv: PocketCollectionsService,
    private api: ApiService,
  ) {
    this.data = dataInjected.data;
    this.pb = AuthSrv.GetPocketBase();

    this.initiliazeData();

    this.relatorioSketchLogic();

    this.syncTimeWithServer();

    this.clockObserver$ = interval(1000);

    this.relatoriosSubscription = this.pocketSrv
      .getRelatoriosParsed(this.data.id)
      .subscribe((data) => {
        this.relatorios = data;
        this.relatorios.map((relatorio: any) => {
          relatorio.created = new Date(relatorio.created);
        });
        console.log(this.relatorios);
      });

    if (!this.em_espera) {
      this.runTimers();
    }
  }

  getTotalTime() : string {
    // Future Date
      const firstDate: Date = new Date(this.data.end_time);
       
      // Current Date
      const secondDate: Date = new Date(this.data.created);
       
      // Time Difference in Milliseconds
      const milliDiff: number = firstDate.getTime()
          - secondDate.getTime();
       
      // Converting time into hh:mm:ss format
       
      // Total number of seconds in the difference
      const totalSeconds = Math.floor(milliDiff / 1000);
       
      // Total number of minutes in the difference
      const totalMinutes = Math.floor(totalSeconds / 60);
       
      // Total number of hours in the difference
      const totalHours = Math.floor(totalMinutes / 60);
       
      // Getting the number of seconds left in one minute
      const remSeconds = totalSeconds % 60;
       
      // Getting the number of minutes left in one hour
      const remMinutes = totalMinutes % 60;

      let seconds = remSeconds.toString();
      if (totalSeconds < 10){
        seconds = '0' + seconds;
      }
      let minutes = remMinutes.toString();
      if (totalMinutes < 10){
        minutes = '0' + minutes; 
      }
      let hours = totalHours.toString();
      if (totalHours < 10){
        hours = '0' + hours; 
      }
       
      return `${hours}:${minutes}:${seconds}`;
  }

  relatorioSketchLogic(){
    this.saveIntervalSubscription = interval(15000).subscribe(() => {
      this.saveEditor();
    });

    this.pocketSrv.getRelatorioSketch(this.data.id).subscribe((sketchData) => {
      this.mostrarEditor = true;
      this.sketch = sketchData['sketch'];
    });
  }

  runTimers() {
    this.updateTimers();
    this.clockIntervalSubscription = this.clockObserver$.subscribe(
      (currentTime) => {
        this.updateTimers();
      },
    );

    this.chamadoTimersSubscription = this.pocketSrv
      .getChamadoTimers(this.data.id)
      .subscribe((data) => {
        console.log('Timers data update ', data);
        data.forEach((duracao: any) => {
          var duracao_total_str: any;
          var duracao_total_seconds: any;
          //Primeira vez abrindo o chamado
          if (duracao.last_end == '' && duracao.status == 'em_andamento') {
            let last_start = new Date(duracao.last_start) as any;
            let date_now = this.getCurrentServerTime() as any;

            const dates_difference = (date_now - last_start) / 1_000;
            duracao_total_seconds = dates_difference;
            duracao_total_str = new Date(duracao_total_seconds * 1000)
              .toISOString()
              .slice(11, 19);
          } else if (
            duracao.last_end != '' &&
            duracao.status == 'em_andamento'
          ) {
            let last_start = new Date(duracao.last_start) as any;
            let date_now = this.getCurrentServerTime() as any;

            duracao_total_seconds = (date_now - last_start) / 1_000;
            duracao_total_seconds += duracao.total_elapsed_time_seconds;
            duracao_total_str = new Date(duracao_total_seconds * 1000)
              .toISOString()
              .slice(11, 19);
          } else if (duracao.status == 'em_pausa') {
            duracao_total_seconds = duracao.total_elapsed_time_seconds;
            duracao_total_str = new Date(duracao_total_seconds * 1000)
              .toISOString()
              .slice(11, 19);
          }

          const findt = this.data.expand.users.find(
            (user: any) => user.id == duracao.user,
          );

          if (findt) {
            findt['duracao_total_str'] = duracao_total_str;
            findt['duracao_total_seconds'] = duracao_total_seconds;
            findt['duracao_status'] = duracao.status;
          }
        });

        this.updateTimers();
      });
  }

  initiliazeData() {
    this.isAdmin = this.AuthSrv.IsAdmin();

    this.dataInjectedSubscription = this.dataInjected.dataObservable.subscribe(
      (data) => {
        this.data = data;
      },
    );

    if (this.data.status == 'em_espera') {
      this.em_espera = true;
    }

    if (this.data.status == 'cancelado') {
      this.cancelado = true;
    }
    let created_at = new Date(this.data.created);
    this.created_at =
      created_at.toLocaleString('pt-br', { day: 'numeric', month: 'short' }) +
      ' ' +
      created_at.toLocaleTimeString('pt-br');
    if (this.data.end_time != '') {
      console.log(this.data.end_time);
      let end_at = new Date(this.data.end_time);
      this.end_at =
        end_at.toLocaleString('pt-br', { day: 'numeric', month: 'short' }) +
        ' ' +
        end_at.toLocaleTimeString('pt-br');
    }

    this.faturado = this.data.faturado;

    this.finalizado =
      this.data.status == 'finalizado' || this.data.status == 'cancelado';

    this.data.expand.users.forEach((user: any) => {
      if (user.id == this.data.expand.created_by.id) {
        this.criadorParticipa = true;
      }
    });

    this.participando = this.data.users.includes(
      this.pocketSrv.pb.authStore.model!['id'],
    );

    if (this.data.status == 'em_andamento') {
      this.em_andamento = true;
    }
  }

  syncTimeWithServer() {
    this.api.GetTime().subscribe((time) => {
      this.serverTime = time;
      let now_date = new Date();
      let time_diff = now_date.getTime() - this.serverTime.getTime();
      this.timeDifference = new Date(time_diff);
      // Calculate hours
      let hours = Math.floor(time_diff / (1000 * 60 * 60));
      // Calculate remaining milliseconds after subtracting hours
      let remainingMillisecondsAfterHours = time_diff % (1000 * 60 * 60);

      // Calculate minutes
      let minutes = Math.floor(remainingMillisecondsAfterHours / (1000 * 60));
      // Calculate remaining milliseconds after subtracting minutes
      let remainingMillisecondsAfterMinutes =
        remainingMillisecondsAfterHours % (1000 * 60);

      // Calculate seconds
      let seconds = Math.floor(remainingMillisecondsAfterMinutes / 1000);

      // Calculate milliseconds
      let milliseconds = remainingMillisecondsAfterMinutes % 1000;

      // Format the time difference string
      let timeDiffStrFormated = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(4, '0')}`;
      console.log(
        '\n',
        'Sua maquina: ',
        now_date.toLocaleTimeString(),
        '\n',
        'Servidor: ',
        this.serverTime.toLocaleTimeString(),
        '\n',
        'Diferença de tempo entre o servidor: ',
        timeDiffStrFormated,
      );
    });
  }

  editorCarregado() {
    if (this.sketch) {
      this.editorNew!.editor.setContent(this.sketch as string);
    }
  }

  updateTimers() {
    this.data.expand.users.map((user: any) => {
      if (
        user['duracao_status'] != undefined &&
        user['duracao_status'] == 'em_andamento'
      ) {
          user['duracao_total_seconds'] += 1;
          user['duracao_total_str'] = new Date(
          user['duracao_total_seconds'] * 1000,
        )
          .toISOString()
          .slice(11, 19);
      } else if (
        user['duracao_status'] != undefined &&
        user['duracao_status'] == 'em_pausa'
      ) {
          user['duracao_total_str'] = new Date(
          user['duracao_total_seconds'] * 1000,
        )
          .toISOString()
          .slice(11, 19);
      } else {
        user['duracao_total_str'] = '00:00:00';
      }

      if (user.id == this.pb.authStore.model!['id']) {
        if (
          user.duracao_status == 'em_pausa' ||
          user.duracao_total_str == '00:00:00'
        ) {
          this.pausado = true;
        } else {
          this.pausado = false;
        }
      }
    });
  }

  getCurrentServerTime(): Date {
    return new Date(new Date().getTime() - this.timeDifference.getTime());
  }

  onFecharChamado() {
    this.saveEditor();
  }

  saveEditor() {
    console.log('Saving editor...');
    if (this.editorNew != undefined) {
      const html = this.editorNew.editor.getContent();

      if (html != '') {
        this.pocketSrv.saveRelatorioSketch(this.data.id, html);
      }
    }
  }

  eraseEditor() {
    if (this.editorNew != undefined) this.editorNew.editor.setContent('');
  }

  ngOnDestroy() {
    if (this.clockIntervalSubscription)
      this.clockIntervalSubscription.unsubscribe();

    if (this.saveIntervalSubscription)
      this.saveIntervalSubscription.unsubscribe();

    if (this.chamadoTimersSubscription)
      this.chamadoTimersSubscription.unsubscribe();

    if (this.relatoriosSubscription) this.relatoriosSubscription.unsubscribe();
  }

  sendRelatorio() {
    if (this.editorNew) {
      const html = this.editorNew.editor.getContent();

      from(
        this.pb.collection('relatorios').create({
          user: this.pb.authStore.model!['id'],
          relatorio: html,
          chamado: this.data.id,
        }),
      ).subscribe((res) => {
        this.eraseEditor();
        this.pocketSrv.apagarSketch(this.data.id);
      });
    }
  }

  openAddView() {
    this.dialog
      .open(ViewSelectUserComponent, { data: this.data.users })
      .afterClosed()
      .subscribe((res) => {
        let usersSelected: any[] = [];
        res.forEach((user: any) => {
          if (user.selecionado == true) usersSelected.push(user.id);
        });

        let users = [...usersSelected];

        //Adiciona a pessoa logada se participar do chamado
        if (
          this.data.users.includes(this.pb.authStore.model!['id']) &&
          this.AuthSrv.IsAdmin() == false
        ) {
          users.push(this.pb.authStore.model!['id']);
        }

        this.pocketSrv.updateChamadoUsers(this.data.id, users);
      });
  }

  setEditor(val: boolean) {
    this.mostrarEditor = val;
  }

  resumeTimer() {
    this.pocketSrv.startUserTimer(this.data.id).subscribe((started) => {
      if (!started) {
        console.log('Não foi possivel continuar o timer: ');
      }
    });
  }

  pauseTimer() {
    this.pocketSrv.pauseUserTimer(this.data.id).subscribe((paused) => {
      if (!paused) {
        console.log('Não foi possivel parar o timer: ');
      }
    });
  }

  resumeTimerUser(userId: string) {
    this.pocketSrv.startUserTimer(this.data.id, userId).subscribe((started) => {
      if (!started) {
        console.log('Não foi possivel continuar o timer de outro usuario: ');
      }
    });
  }

  pauseTimerUser(userId: string) {
    this.pocketSrv.pauseUserTimer(this.data.id, userId).subscribe((paused) => {
      if (paused) {
        console.log('Não foi possivel parar o timer de outro usuario: ');
      }
    });
  }

  finalizarChamado() {
    this.dialog
      .open(ConfirmFinalizarComponent)
      .afterClosed()
      .subscribe((res) => {
        console.log(res);
        if (res == true) {
          this.api.FinalizarChamado(this.data).subscribe((data) => {
            console.log(data);
          });

          this.dialog.closeAll();
        }
      });
  }

  cancelarChamado() {
    this.dialog
      .open(ConfirmCancelarComponent)
      .afterClosed()
      .subscribe((res) => {
        console.log(res);
        if (res == true) {
          this.api
            .FinalizarChamado(this.data, 'cancelado')
            .subscribe((data) => {
              console.log(data);
            });

          this.dialog.closeAll();
        }
      });
  }

  marcarFaturado() {
    this.pocketSrv.marcarChamadoFaturado(this.data.id);
    this.data.faturado = true;
    this.dialog.closeAll();
  }

  openImage(url: string) {
    this.dialog.open(ViewImageComponent, { data: url });
  }
}
