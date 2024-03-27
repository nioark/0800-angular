import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Pipe,
  ViewChild,
} from '@angular/core';
import { Observable, Subscription, find, from, interval, map } from 'rxjs';
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
import { PocketChamadosService } from '../../../../services/pocket-chamados.service';
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
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { SanitizeHtmlPipe } from '../../../../sanitize-html.pipe';
import { MediaComponent } from '../../../../shared/media/media.component';
import { ViewHoursComponent } from './components/view-hours/view-hours.component';

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
    MatInputModule,
    FormsModule,
    SanitizeHtmlPipe,
    MediaComponent,
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

  @ViewChild('editorDescricao') editorDescricao: EditorComponent | undefined;
  mostrarEditorDescricao: boolean = false;

  clockIntervalSubscription: Subscription | undefined;
  saveIntervalSubscription: Subscription | undefined;
  chamadoTimersSubscription: Subscription | undefined;
  dataInjectedSubscription: Subscription | undefined;
  relatoriosSubscription: Subscription | undefined;
  usersFinalizadosSubscription: Subscription | undefined;

  data: any;
  serverTime: Date = new Date();
  timeDifference: Date = new Date();
  duracoes = [];
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

  total_worked_time: number = 0;

  relatorio_hora_inicio: any;
  relatorio_hora_fim: any;

  usersFinalized: any = [];

  userFinalized: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private dataInjected: {
      data: any;
      dataObservable: Observable<RecordModel>;
    },
    private http: HttpClient,
    public dialog: MatDialog,
    public AuthSrv: AuthService,
    public pocketSrv: PocketChamadosService,
    private api: ApiService,
  ) {
    this.data = dataInjected.data;
    this.pb = AuthSrv.GetPocketBase();

    this.usersFinalizadosSubscription = this.pocketSrv
      .getChamadoUsersFinalized(this.data.id)
      .subscribe((data) => {
        this.usersFinalized = data;
        this.userFinalized = this.getIsFinalized(this.AuthSrv.getID());
        console.log('Users finalizdaos', this.usersFinalized);
      });

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

    console.log('this.finalizado', this.finalizado);
    console.log('this.userFinalized', this.userFinalized);
  }

  changeTitle(event: Event) {
    this.pocketSrv.salvarTitulo(
      this.data.id,
      (event.target as HTMLInputElement).value,
    );
  }

  showEditorDescricao() {
    this.mostrarEditorDescricao = true;
  }

  editorCarregadoDescricao() {
    console.log('Teste');

    if (this.editorDescricao) {
      console.log('Carregado');
      this.editorDescricao?.editor.setContent(this.data.description);
    }
  }

  salvarDescricao() {
    this.mostrarEditorDescricao = false;
    if (!this.editorDescricao) return;

    let content = this.editorDescricao?.editor.getContent();
    this.data.description = content;
    this.pocketSrv.salvarDescricao(this.data.id, content);
  }

  getIsFinalized(user_id: string): boolean {
    let isFinalized: boolean = false;
    this.usersFinalized.forEach((finalizado: any) => {
      if (finalizado.user == user_id) {
        isFinalized = true;
      }
    });

    return isFinalized;
  }

  getTotalWorkedTime(): string {
    return this.getTimeFromMill(this.total_worked_time * 1000);
  }

  getTimeFromMill(timeMilliseconds: number): string {
    // Total number of seconds in the difference
    const totalSeconds = Math.floor(timeMilliseconds / 1000);

    // Total number of minutes in the difference
    const totalMinutes = Math.floor(totalSeconds / 60);

    // Total number of hours in the difference
    const totalHours = Math.floor(totalMinutes / 60);

    // Getting the number of seconds left in one minute
    const remSeconds = totalSeconds % 60;

    // Getting the number of minutes left in one hour
    const remMinutes = totalMinutes % 60;

    let seconds = remSeconds.toString();
    if (totalSeconds < 10) {
      seconds = '0' + seconds;
    }
    let minutes = remMinutes.toString();
    if (totalMinutes < 10) {
      minutes = '0' + minutes;
    }
    let hours = totalHours.toString();
    if (totalHours < 10) {
      hours = '0' + hours;
    }

    return `${hours}:${minutes}:${seconds}`;
  }

  getTimeFromDate(date: Date): string {
    return this.getTimeFromMill(date.getTime());
  }

  getTotalTime(): string {
    // Future Date
    const firstDate: Date = new Date(this.data.end_time);

    // Current Date
    const secondDate: Date = new Date(this.data.created);

    // Time Difference in Milliseconds
    const milliDiff: number = firstDate.getTime() - secondDate.getTime();

    return this.getTimeFromMill(milliDiff);
  }

  relatorioSketchLogic() {
    this.saveIntervalSubscription = interval(15000).subscribe(() => {
      this.saveEditor();
    });

    this.pocketSrv.getRelatorioSketch(this.data.id).subscribe((sketchData) => {
      this.mostrarEditor = true;
      this.sketch = sketchData['sketch'];
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

  editorCarregado() {
    if (this.sketch) {
      this.editorNew!.editor.setContent(this.sketch as string);
    }
  }

  getCurrentServerTime(): Date {
    return new Date(new Date().getTime() - this.timeDifference.getTime());
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

  onFecharChamado() {
    this.saveEditor();
  }

  saveEditor() {
    console.log('Saving editor...');
    if (this.editorNew != undefined) {
      const html = this.editorNew.editor.getContent();
      console.log(html);

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
      const start_time = (<HTMLInputElement>(
        document.getElementById('start-time')
      )).value;
      const end_time = (<HTMLInputElement>document.getElementById('end-time'))
        .value;

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

      console.log(date_start);
      console.log(date_end);
      const html = this.editorNew.editor.getContent();

      from(
        this.pb.collection('relatorios').create({
          user: this.pb.authStore.model!['id'],
          relatorio: html,
          chamado: this.data.id,
          interacao_start: date_start,
          interacao_end: date_end,
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

  finalizarChamado() {
    this.dialog
      .open(ConfirmFinalizarComponent, { data: this.data })
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

  reabrirChamado() {
    this.api
      .ReabrirChamado(this.data)
      .subscribe((data) => this.dialog.closeAll());
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

  openHours(tecnico_id: number) {
    this.dialog.open(ViewHoursComponent, {
      data: { chamado_id: this.data.id, tecnico_id: tecnico_id },
    });
  }
}
