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
  @Input({ required: true }) timestamp!: string;
  @Input({ required: false }) image_url!: string | null;
  @Input({ required: true }) message!: string;



}
