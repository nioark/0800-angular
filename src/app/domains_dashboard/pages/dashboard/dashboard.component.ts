import { Component } from '@angular/core';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { ServersFilterComponent } from '../servers/components/servers-filter/servers-filter.component';
import { DatepickerComponent } from './component/datepicker/datepicker.component';
import { MonthpickerComponent } from './component/monthpicker/monthpicker.component';
import { TabsComponent } from './component/tabs/tabs.component';
import { FaturamentoComponent } from './tabs/faturamento/faturamento.component';
import { EstatisticasComponent } from './tabs/estatisticas/estatisticas.component';
import { ServidoresComponent } from './tabs/servidores/servidores.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmailsApiService } from '../../services/emails-api.service';
import { ServerData } from '../../models/apiserver';
import { FrameNavComponent } from '../../../components/frame-nav/frame-nav.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    ServersFilterComponent,
    FrameNavComponent,
    DatepickerComponent,
    MonthpickerComponent,
    TabsComponent,
    ServidoresComponent,
    EstatisticasComponent,
    FaturamentoComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  currentTab = this.router.url.split('/')[2];

  constructor(private router: Router) {}
}
