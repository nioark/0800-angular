import { Component, ViewChild } from '@angular/core';
import { ServersFilterComponent } from '../../../servers/components/servers-filter/servers-filter.component';
import { MonthpickerComponent } from '../../component/monthpicker/monthpicker.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../../environment';
import { ThemeService } from '../../../../services/theme.service';
import { AnalyticsService } from '../../../../services/analytics.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-faturamento',
  standalone: true,
  imports: [ServersFilterComponent, MonthpickerComponent],
  templateUrl: './faturamento.component.html',
  styleUrl: './faturamento.component.scss',
})
export class FaturamentoComponent {
  @ViewChild('monthpicker') datePicker: MonthpickerComponent | undefined;
  @ViewChild('filter') filters: ServersFilterComponent | undefined;

  data: Observable<any> | undefined;

  serversFilters: string[] | undefined;

  isAdmin: boolean = localStorage.getItem('isAdmin') == 'true';

  private defaultInitialDate: Date = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 6,
    1,
    10,
    0,
    0,
  );
  private defaultFinalDate: Date = new Date();
  grafana_urls: SafeResourceUrl[];

  constructor(
    private sanitizer: DomSanitizer,
    themeSrv: ThemeService,
    analyticsSrv: AnalyticsService,
  ) {
    this.defaultFinalDate.setHours(23, 59, 59);

    console.log(this.defaultInitialDate, this.defaultFinalDate);
    const theme = themeSrv.getTheme();

    this.data = analyticsSrv.getDashboard();

    this.data.subscribe((data) => {
      console.log(data.dashboard_id);

      let grafana_urls = [
        `${environment.grafanaUrl}/d-solo/${data.dashboard_id}/dashboard?orgId=1&from=${this.defaultInitialDate.getTime()}&to=${this.defaultFinalDate.getTime()}${this.getFilters()}&theme=${theme}&panelId=2`,
        `${environment.grafanaUrl}/d-solo/${data.dashboard_id}/dashboard?orgId=1&from=${this.defaultInitialDate.getTime()}&to=${this.defaultFinalDate.getTime()}${this.getFilters()}&theme=${theme}&panelId=25`,
        `${environment.grafanaUrl}/d-solo/${data.dashboard_id}/dashboard?orgId=1&from=${this.defaultInitialDate.getTime()}&to=${this.defaultFinalDate.getTime()}${this.getFilters()}&theme=${theme}&panelId=26`,
        `${environment.grafanaUrl}/d-solo/${data.dashboard_id}/dashboard?orgId=1&from=${this.defaultInitialDate.getTime()}&to=${this.defaultFinalDate.getTime()}${this.getFilters()}&theme=${theme}&panelId=22`,
        `${environment.grafanaUrl}/d-solo/${data.dashboard_id}/dashboard?orgId=1&from=${this.defaultInitialDate.getTime()}&to=${this.defaultFinalDate.getTime()}${this.getFilters()}&theme=${theme}&panelId=28`,
        `${environment.grafanaUrl}/d-solo/${data.dashboard_id}/dashboard?orgId=1&from=${this.defaultInitialDate.getTime()}&to=${this.defaultFinalDate.getTime()}${this.getFilters()}&theme=${theme}&panelId=29`,
      ];

      this.grafana_urls = grafana_urls.map((url: string) =>
        this.sanitizer.bypassSecurityTrustResourceUrl(url),
      );
      console.log(this.grafana_urls);
    });

    let grafana_urls = [
      `${environment.grafanaUrl}/d-solo/12321/dashboard?orgId=1&from=${this.defaultInitialDate.getTime()}&to=${this.defaultFinalDate.getTime()}${this.getFilters()}&theme=${theme}&panelId=2`,
      `${environment.grafanaUrl}/d-solo/12321/dashboard?orgId=1&from=${this.defaultInitialDate.getTime()}&to=${this.defaultFinalDate.getTime()}${this.getFilters()}&theme=${theme}&panelId=25`,
      `${environment.grafanaUrl}/d-solo/12321/dashboard?orgId=1&from=${this.defaultInitialDate.getTime()}&to=${this.defaultFinalDate.getTime()}${this.getFilters()}&theme=${theme}&panelId=26`,
      `${environment.grafanaUrl}/d-solo/12321/dashboard?orgId=1&from=${this.defaultInitialDate.getTime()}&to=${this.defaultFinalDate.getTime()}${this.getFilters()}&theme=${theme}&panelId=22`,
      `${environment.grafanaUrl}/d-solo/12321/dashboard?orgId=1&from=${this.defaultInitialDate.getTime()}&to=${this.defaultFinalDate.getTime()}${this.getFilters()}&theme=${theme}&panelId=28`,
      `${environment.grafanaUrl}/d-solo/12321/dashboard?orgId=1&from=${this.defaultInitialDate.getTime()}&to=${this.defaultFinalDate.getTime()}${this.getFilters()}&theme=${theme}&panelId=29`,
    ];
    this.grafana_urls = grafana_urls.map((url: string) =>
      this.sanitizer.bypassSecurityTrustResourceUrl(url),
    );
  }

  getFilters() {
    return '&var-query&var-Cwp1=true&var-Cwp2=true&var-Server1=true&var-Server2=true&var-Locaweb=true';
  }

  ngAfterViewInit() {
    const el = document.querySelector('.sticked');
    const observer = new IntersectionObserver(
      ([e]) => e.target.classList.toggle('is-pinned', e.intersectionRatio < 1),
      { threshold: [1] },
    );

    observer.observe(el as Element);

    this.filters?.serversFiltersEmitter.asObservable().subscribe((data) => {
      this.serversFilters = data;
      this.filtersChanged();
      console.log(this.serversFilters);
    });

    this.datePicker?.generateInitialDateOptions(this.defaultInitialDate);
    this.datePicker?.generateFinalDateOptions(
      this.defaultInitialDate,
      this.defaultFinalDate,
    );
    this.datePicker?.GetDates();

    this.datePicker?.monthpickEmitter.asObservable().subscribe((data) => {
      this.changedDateRange(data);
    });
  }

  filtersChanged() {
    const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
    iframes.forEach((iframe) => {
      const url = new URL(iframe.src);
      url.searchParams.set(
        'var-Server1',
        this.serversFilters!.findIndex(
          (server: string) => server === 'server_a_tag',
        ) != -1
          ? 'true'
          : 'false',
      );
      url.searchParams.set(
        'var-Server2',
        this.serversFilters!.findIndex(
          (server: string) => server === 'server_b_tag',
        ) != -1
          ? 'true'
          : 'false',
      );
      url.searchParams.set(
        'var-Cwp1',
        this.serversFilters!.findIndex(
          (server: string) => server === 'server_c_tag',
        ) != -1
          ? 'true'
          : 'false',
      );
      url.searchParams.set(
        'var-Cwp2',
        this.serversFilters!.findIndex(
          (server: string) => server === 'server_d_tag',
        ) != -1
          ? 'true'
          : 'false',
      );
      url.searchParams.set(
        'var-Locaweb',
        this.serversFilters!.findIndex(
          (server: string) => server === 'server_e_tag',
        ) != -1
          ? 'true'
          : 'false',
      );
      console.log(
        this.serversFilters!.findIndex(
          (server: string) => server === 'server_a_tag',
        ) != -1,
        this.serversFilters!.findIndex(
          (server: string) => server === 'server_b_tag',
        ) != -1,
        this.serversFilters!.findIndex(
          (server: string) => server === 'server_c_tag',
        ) != -1,
        this.serversFilters!.findIndex(
          (server: string) => server === 'server_d_tag',
        ) != -1,
        this.serversFilters!.findIndex(
          (server: string) => server === 'server_e_tag',
        ) != -1,
      );
      console.log(url.toString());
      iframe.src = url.toString();
    });
  }

  changedDateRange(data: { initialDate: Date; finalDate: Date }) {
    console.log(data);
    const initialTime = data.initialDate.getTime();
    const finalTime = data.finalDate.getTime();

    const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
    iframes.forEach((iframe) => {
      const url = new URL(iframe.src);
      url.searchParams.set('from', initialTime.toString());
      url.searchParams.set('to', finalTime.toString());
      iframe.src = url.toString();
    });
  }
}
