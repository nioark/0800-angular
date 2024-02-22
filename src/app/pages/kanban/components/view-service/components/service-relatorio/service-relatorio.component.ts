import { Component, Input } from '@angular/core';
import { SanitizeHtmlPipe } from "../../../../../../sanitize-html.pipe";
import { RecordModel } from 'pocketbase';
import { environment } from '../../../../../../environment';

@Component({
    selector: 'app-service-relatorio',
    standalone: true,
    templateUrl: './service-relatorio.component.html',
    styleUrl: './service-relatorio.component.scss',
    imports: [SanitizeHtmlPipe]
})
export class ServiceRelatorioComponent {
  @Input({ required: true }) date!: Date;
  @Input({ required: true }) user!: RecordModel;
  @Input({ required: true }) html!: string;

  apiUrl = environment.apiUrl

  timeStamp : string = "";

  ngOnInit(): void {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - this.date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      this.timeStamp = `${diffInSeconds} segundos atrás`;
    } else if (diffInSeconds < 3600) {
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      this.timeStamp = `${diffInMinutes} minutos atrás`;
    } else if (diffInSeconds < 86400) {
      const diffInHours = Math.floor(diffInSeconds / 3600);
      this.timeStamp = `${diffInHours} horas atrás`;
    } else {
      this.timeStamp = this.date.toLocaleString('pt-br', { day: 'numeric', month: 'short' }) + " " + this.date.toLocaleTimeString('pt-br');
    }
  }

}
