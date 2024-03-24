import { Component } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../../../environment';

@Component({
  selector: 'app-servidores',
  standalone: true,
  imports: [],
  templateUrl: './servidores.component.html',
  styleUrl: './servidores.component.scss',
})
export class ServidoresComponent {
  graph_url: SafeResourceUrl = '';

  constructor(private sanitizer: DomSanitizer) {
    this.graph_url = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${environment.grafanaUrl}/d-solo/Tjd_dlFIz/zabbix?orgId=1&from=now-6h&to=now&panelId=2`,
    );
  }
}
