import {
  Component,
  ComponentRef,
  ElementRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { AnalyticsService } from '../../services/analytics.service';
import { Observable, map, tap } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { PopupComponent } from '../components/popup/popup.component';
import { Custos, CustosAvg } from '../../models/analytics';
import { FrameNavComponent } from '../../../components/frame-nav/frame-nav.component';

@Component({
  selector: 'app-config-custo',
  standalone: true,
  imports: [SidebarComponent, CommonModule, AsyncPipe, FrameNavComponent],
  templateUrl: './config-custo.component.html',
  styleUrl: './config-custo.component.scss',
})
export class ConfigCustoComponent {
  @ViewChild('server1') server1: ElementRef | undefined;
  @ViewChild('server2') server2: ElementRef | undefined;
  @ViewChild('cwp1') cwp1: ElementRef | undefined;
  @ViewChild('cwp2') cwp2: ElementRef | undefined;

  @ViewChild('container', { read: ViewContainerRef }) container:
    | ViewContainerRef
    | undefined;

  now_data: any;

  data: Observable<any> | undefined;
  dataAvg: Observable<CustosAvg>;
  dataAvgF: any;

  analyticsService: AnalyticsService;

  constructor(analyticsService: AnalyticsService) {
    let date_now = new Date();
    let hours = date_now.getHours();
    let minutes = date_now.getMinutes();
    let seconds = date_now.getSeconds();

    this.now_data = {
      server1: 0,
      server2: 0,
      cwp1: 0,
      cwp2: 0,
      created_at: date_now.toLocaleDateString(),
      updated_at: new Date(),
      created_at_hour: `${hours <= 9 ? '0' : ''}${hours}:${minutes <= 9 ? '0' : ''}${minutes}:${seconds <= 9 ? '0' : ''}${seconds}`,
      service_id: 0,
    };
    this.analyticsService = analyticsService;

    this.dataAvg = this.analyticsService.getCustosAvg().pipe(
      map((x) => {
        console.log(x);
        this.dataAvgF = x;
        this.dataAvgF.server1 = this.round(x.server1);
        this.dataAvgF.server2 = this.round(x.server2);
        this.dataAvgF.cwp1 = this.round(x.cwp1);
        this.dataAvgF.cwp2 = this.round(x.cwp2);

        return x;
      }),
    );
  }

  ngOnInit() {
    this.data = this.analyticsService.fetchCustos().pipe(
      map((data: any) => {
        console.log(data);
        let new_data = data.sort((a: any, b: any) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });

        new_data = new_data.map((item: any) => {
          let date_now = new Date(item.created_at);
          let hours = date_now.getHours();
          let minutes = date_now.getMinutes();
          let seconds = date_now.getSeconds();
          item.created_at_hour = `${hours <= 9 ? '0' : ''}${hours}:${minutes <= 9 ? '0' : ''}${minutes}:${seconds <= 9 ? '0' : ''}${seconds}`;
          item.created_at = date_now.toLocaleDateString();
          return item;
        });

        let date_now = new Date();
        let hours = date_now.getHours();
        let minutes = date_now.getMinutes();
        let seconds = date_now.getSeconds();

        const now_custos = new_data.shift();
        this.now_data = now_custos;
        if (!now_custos) {
          this.now_data = {
            server1: 0,
            server2: 0,
            cwp1: 0,
            cwp2: 0,
            loaweb: 0,
            created_at: new Date().toLocaleDateString(),
            updated_at: new Date(),
            created_at_hour: `${hours <= 9 ? '0' : ''}${hours}:${minutes <= 9 ? '0' : ''}${minutes}:${seconds <= 9 ? '0' : ''}${seconds}`,
            service_id: 0,
          };
          console.log(this.now_data);
        }

        return new_data;
      }),
    );
  }
  round(num: number) {
    return Number(num.toFixed(4));
  }

  addPopup(titulo: string, mensagem: string, erro: boolean) {
    const component: ComponentRef<PopupComponent> =
      this.container?.createComponent(
        PopupComponent,
      ) as ComponentRef<PopupComponent>;
    component.instance.titulo = titulo;
    component.instance.mensagem = mensagem;
    component.instance.erro_popup = erro;
  }

  alterar() {
    let server1 = this.server1?.nativeElement.value as string;
    let server2 = this.server2?.nativeElement.value as string;
    let cwp1 = this.cwp1?.nativeElement.value as string;
    let cwp2 = this.cwp2?.nativeElement.value as string;

    this.analyticsService
      .setCustos(server1, server2, cwp1, cwp2)
      .subscribe((response) => {
        console.log(response);

        if (response.error) {
          this.addPopup('Erro!', 'Não foi possivel alterar custos', true);
          return;
        } else {
          this.addPopup('Sucesso!', 'Custos alterados com sucesso!', false);
        }
      });
  }
}
