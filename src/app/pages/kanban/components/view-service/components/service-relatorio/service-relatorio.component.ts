import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-service-relatorio',
  standalone: true,
  imports: [],
  templateUrl: './service-relatorio.component.html',
  styleUrl: './service-relatorio.component.scss'
})
export class ServiceRelatorioComponent {
  @Input({ required: true }) name!: string;
  @Input({ required: true }) avatar_url!: string;
  @Input({ required: true }) date!: Date;
  @Input({ required: false }) image_url!: string | null;
  @Input({ required: true }) html!: string;

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
