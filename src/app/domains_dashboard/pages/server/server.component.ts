import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { ServersService } from '../../services/servers.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Server } from '../../models/server';
import { Observable, combineLatest, forkJoin, map, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RadialGraphComponent } from '../components/radial-graph/radial-graph.component';
import { EmailServicesApiService } from '../../services/email-services-api.service';
import {
  ServerData,
  convertToBytes,
  humanizeBytes,
} from '../../models/apiserver';
import { EmailApi, EmailData } from '../../models/email';
import { EmailsApiService } from '../../services/emails-api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environment';
import { RadialGraphTwoComponent } from '../components/radial-graph-two/radial-graph-two.component';
import { FrameNavComponent } from '../../../components/frame-nav/frame-nav.component';

@Component({
  selector: 'app-server',
  standalone: true,
  imports: [
    SidebarComponent,
    CommonModule,
    RadialGraphComponent,
    RadialGraphTwoComponent,
    FrameNavComponent,
  ],
  templateUrl: './server.component.html',
  styleUrl: './server.component.scss',
})
export class ServerComponent {
  server$: Observable<ServerData> | undefined;
  emails$: Observable<EmailApi[]> | undefined;

  emailsData: EmailData[] = [];

  totalStorage!: string;
  percentageStorage!: number;
  storageUsedLegend: string = 'Em Uso';
  storageUsedValue!: string;
  storageRemainingLegend: string = 'Livre';
  storageRemainingValue!: string;
  storageColor!: string;

  totalAccounts!: string;
  percentageAccounts!: number;
  accountsUsedLegend: string = 'Em Uso';
  accountsUsedValue!: string;
  accountsRemainingLegend: string = 'Livre';
  accountsRemainingValue!: string;
  accountsColor!: string;

  totalStorageMail: string = '0 bytes';
  emailStoragePercentage!: number;

  serverId!: number;
  serviceId!: number;
  grafanaUrl: any;

  constructor(
    serverSrv: ServersService,
    private sanitizer: DomSanitizer,
    private emailServiceSrv: EmailServicesApiService,
    private emailSrv: EmailsApiService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) {
    const serverId = this.route.snapshot.params['serverId'];
    const serviceId = this.route.snapshot.params['serviceId'];
    this.server$ = emailServiceSrv.get(serverId, serviceId);
    this.emails$ = emailSrv.get(serverId, serviceId);

    forkJoin([this.server$, this.emails$])
      .pipe(
        tap(([server, emails]) => {
          let totalEmailStorage = 0;
          emails.forEach((email) => {
            totalEmailStorage += email.disk_used_bytes;
          });

          this.totalStorageMail = humanizeBytes(totalEmailStorage);

          this.emailStoragePercentage = Number(
            ((totalEmailStorage / server.maxStorageBytes) * 100).toFixed(2),
          );
          if (server.unlimitedStorage)
            this.emailStoragePercentage = Number(
              ((totalEmailStorage / server.usedStorageBytes) * 100).toFixed(2),
            );

          emails.forEach((email) => {
            let diskUsedNumber = email.disk_used_bytes;
            let percentage = Number(
              ((diskUsedNumber / totalEmailStorage) * 100).toFixed(2),
            );

            percentage = Math.max(0, Math.min(percentage, 100));
            let emailData: EmailData = {
              domain: email.domain,
              email: email.email,
              user: email.user,
              diskUsed: email.disk_used_bytes,
              diskUsedHuman: email.disk_used_human,
              storagePercentage: percentage,
            };

            this.emailsData?.push(emailData);
          });
        }),
      )
      .subscribe();

    this.server$.subscribe((server) => {
      this.serverId = server.serverId;
      this.serviceId = server.serviceId;

      this.totalStorage = server.maxStorage;
      this.percentageStorage = server.usedStoragePercentage;
      if (server.unlimitedStorage) this.percentageStorage = 100;

      this.storageUsedValue = server.usedStorage;
      this.storageRemainingValue = server.remainingStorage;
      if (this.storageRemainingValue == 'NaN undefined')
        this.storageRemainingValue = '0 Bytes';

      if (server.unlimitedStorage) this.storageColor = 'rgb(120, 81, 169)';
      else if (this.percentageStorage < 50)
        this.storageColor = 'rgb(49 196 141)';
      else if (this.percentageStorage < 80)
        this.storageColor = ' rgb(252 233 106)';
      else this.storageColor = 'rgb(240 82 82)';

      this.totalAccounts = server.maxUsers.toString();
      this.percentageAccounts = server.usedUsersPercentage;
      if (server.unlimitedUsers) this.percentageAccounts = 0;
      this.accountsUsedValue = server.usedUsers.toString();
      this.accountsRemainingValue = server.remainingUsers.toString();

      if (this.percentageAccounts < 50) this.accountsColor = 'rgb(118 169 250)';
      else if (this.percentageAccounts < 80)
        this.accountsColor = 'rgb(252 233 106)';
      else this.accountsColor = 'rgb(240 82 82)';

      const unsafeUrl =
        environment.grafanaUrl +
        `/d-solo/wKCKVtFSz/new-dashboard?orgId=1&var-server_id=${server.serverId}&var-service_id=${server.serviceId}&panelId=2&from=now-1h&to=now`;
      this.grafanaUrl =
        this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);

      console.log(server);
    });
  }

  round(num: number | null) {
    if (num == null) return 'null';
    return Number(num.toFixed(2));
  }

  gotoPath(path: string) {
    this.router.navigate(['/dominios/' + path]);
  }

  openCpanel() {
    const formData: FormData = new FormData();
    formData.append('serverId', this.serverId.toString());
    formData.append('serviceId', this.serviceId.toString());

    this.http
      .post(environment.apiUrlDomains + '/getlinkcpanel', formData)
      .subscribe({
        next: (response) => {
          window.open(response.toString(), '_blank');

          // Handle response here
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }

  openCwp() {
    const formData: FormData = new FormData();
    formData.append('serverId', this.serverId.toString());
    formData.append('serviceId', this.serviceId.toString());

    this.http
      .post(environment.apiUrlDomains + '/getlinkcwp', formData)
      .subscribe({
        next: (response) => {
          window.open(response.toString(), '_blank');

          // Handle response here
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }
}
