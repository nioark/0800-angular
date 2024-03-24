import { Component } from '@angular/core';
import { ServerData } from '../../../../models/apiserver';
import { EmailsApiService } from '../../../../services/emails-api.service';
import { EmailServicesApiService } from '../../../../services/email-services-api.service';
import {
  CountUpDirective,
  CountUpModule,
} from '../../../../services/count-up.directive';
import { environment } from '../../../../../environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ThemeService } from '../../../../services/theme.service';
import { AnalyticsService } from '../../../../services/analytics.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-estatisticas',
  standalone: true,
  imports: [CountUpModule],
  templateUrl: './estatisticas.component.html',
  styleUrl: './estatisticas.component.scss',
})
export class EstatisticasComponent {
  server: ServerData[] = [];
  usersTotal: number = 0;

  grafana_urls: SafeResourceUrl[];

  isAdmin: boolean = localStorage.getItem('isAdmin') == 'true';

  data: Observable<any> | undefined;

  constructor(
    private emailsSrv: EmailServicesApiService,
    private themeSrv: ThemeService,
    private sanitizer: DomSanitizer,
    analyticsSrv: AnalyticsService,
  ) {
    this.data = analyticsSrv.getDashboard();

    const theme = themeSrv.getTheme();

    this.data.subscribe((data) => {
      let grafana_urls = [
        `${environment.grafanaUrl}/d-solo/${data.dashboard_id}/dashboard?orgId=1&from=now-30d&to=now&theme=${theme}&panelId=33`,
        `${environment.grafanaUrl}/d-solo/${data.dashboard_id}/dashboard?orgId=1&from=now-30d&to=now&theme=${theme}&panelId=36`,
        `${environment.grafanaUrl}/d-solo/${data.dashboard_id}/dashboard?orgId=1&from=now-30d&to=now&theme=${theme}&panelId=37`,
        `${environment.grafanaUrl}/d-solo/${data.dashboard_id}/dashboard?orgId=1&from=now-24h&to=now&theme=${theme}&panelId=38`,
      ];

      this.grafana_urls = grafana_urls.map((url: string) =>
        this.sanitizer.bypassSecurityTrustResourceUrl(url),
      );
    });

    let grafana_urls = [
      `${environment.grafanaUrl}/d-solo/none/dashboard?orgId=1&from=now-30d&to=now&theme=${theme}&panelId=33`,
      `${environment.grafanaUrl}/d-solo/none/dashboard?orgId=1&from=now-30d&to=now&theme=${theme}&panelId=36`,
      `${environment.grafanaUrl}/d-solo/none/dashboard?orgId=1&from=now-30d&to=now&theme=${theme}&panelId=37`,
      `${environment.grafanaUrl}/d-solo/none/dashboard?orgId=1&from=now-24h&to=now&theme=${theme}&panelId=38`,
    ];

    this.grafana_urls = grafana_urls.map((url: string) =>
      this.sanitizer.bypassSecurityTrustResourceUrl(url),
    );
    console.log(this.grafana_urls);

    this.emailsSrv.fetch().subscribe((data) => {
      this.server = data.filter((server) => server.suspended == false);
      this.server = data.filter((server) => server.contratoID != null);
      data.forEach((server) => {
        this.usersTotal += server.usedUsers;
      });
    });
  }
}
