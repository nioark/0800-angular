import { Component, Input, ViewChild } from '@angular/core';
import { SanitizeHtmlPipe } from '../../../../../../sanitize-html.pipe';
import { RecordModel } from 'pocketbase';
import { environment } from '../../../../../../environment';
import { AuthService } from '../../../../../../services/auth.service';
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-service-relatorio',
  standalone: true,
  templateUrl: './service-relatorio.component.html',
  styleUrl: './service-relatorio.component.scss',
  imports: [SanitizeHtmlPipe, EditorModule, MatTooltipModule],
})
export class ServiceRelatorioComponent {
  @Input({ required: true }) finalized!: boolean;
  @Input({ required: true }) date!: Date;
  @Input({ required: true }) user!: RecordModel;
  @Input({ required: true }) html!: string;
  @Input({ required: true }) relatorio_data!: RecordModel;

  apiUrl = environment.apiUrl;

  timeStamp: string = '';

  isFromUser: boolean = false;

  mostrarEditor: boolean = false;

  @ViewChild('editor') editorNew: EditorComponent | undefined;

  pb = this.authSrv.GetPocketBase();

  constructor(private authSrv: AuthService) {}

  ngOnInit(): void {
    this.isFromUser = this.user.id === this.authSrv.getID();

    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - this.date.getTime()) / 1000,
    );

    if (diffInSeconds < 60) {
      this.timeStamp = `${diffInSeconds} segundos atrás`;
    } else if (diffInSeconds < 3600) {
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      this.timeStamp = `${diffInMinutes} minutos atrás`;
    } else if (diffInSeconds < 86400) {
      const diffInHours = Math.floor(diffInSeconds / 3600);
      this.timeStamp = `${diffInHours} horas atrás`;
    } else {
      this.timeStamp =
        this.date.toLocaleString('pt-br', { day: 'numeric', month: 'short' }) +
        ' ' +
        this.date.toLocaleTimeString('pt-br');
    }
  }

  carregarEditor() {
    this.mostrarEditor = true;
  }

  editorCarregado() {
    this.editorNew!.editor.setContent(this.html as string);
    const start_time = <HTMLInputElement>document.getElementById('start-time');
    const end_time = <HTMLInputElement>document.getElementById('end-time');

    start_time.value = this.getTimeFromDate(
      this.relatorio_data['interacao_start'],
    );
    end_time.value = this.getTimeFromDate(this.relatorio_data['interacao_end']);

    console.log('Editor carregado');
  }

  updateRelatorio() {
    this.html = this.editorNew!.editor.getContent();

    const start_time = (<HTMLInputElement>document.getElementById('start-time'))
      .value;
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

    this.relatorio_data['interacao_start'] = date_start.toISOString();
    this.relatorio_data['interacao_end'] = date_end.toISOString();

    this.pb.collection('relatorios').update(this.relatorio_data.id, {
      relatorio: this.html,
      interacao_start: date_start,
      interacao_end: date_end,
    });

    this.mostrarEditor = false;
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
}
