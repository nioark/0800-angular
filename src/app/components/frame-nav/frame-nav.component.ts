import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PocketCollectionsService } from '../../services/pocket-collections.service';
import { Subscription } from 'rxjs';
import Client, { AuthModel, RecordModel } from 'pocketbase';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../environment';
import { MatDialog } from '@angular/material/dialog';
import { UserSettingsComponent } from './user-settings/user-settings.component';

@Component({
  selector: 'app-frame-nav',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './frame-nav.component.html',
  styleUrl: './frame-nav.component.scss'
})
export class FrameNavComponent {

  chamados_em_espera: Number = 0;
  chamados_em_andamento: Number = 0;
  chamados_aguardando: Number = 0;

  sub1 : Subscription | undefined
  sub2 : Subscription | undefined

  user : AuthModel

  pb : Client

  apiUrl = environment.apiUrl

  constructor(public router: Router, pocketCollectionsSrv: PocketCollectionsService, private dialog : MatDialog) {
    this.pb = pocketCollectionsSrv.pb
    if (!this.pb.authStore.isValid) {
      this.router.navigate(['/login']) 
    }

    this.user = this.pb.authStore.model

    this.chamados_em_espera = pocketCollectionsSrv.chamados_em_espera
    this.sub1 = pocketCollectionsSrv.em_espera_event.subscribe(
      (count) => {
        this.chamados_em_espera = count
      }
    )

    this.chamados_em_andamento = pocketCollectionsSrv.chamados_em_andamento
    this.sub2 = pocketCollectionsSrv.em_andamento_event.subscribe(
      (count) => {
        this.chamados_em_andamento = count
      }
    )

    this.chamados_aguardando = pocketCollectionsSrv.chamados_aguardando
    this.sub2 = pocketCollectionsSrv.aguardando_event.subscribe(
      (count) => {
        this.chamados_aguardando = count
      }
    )
  }

  ngOnDestroy() {
    if (this.sub1)
      this.sub1.unsubscribe()

    if (this.sub2)
      this.sub2.unsubscribe()
  } 

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.pb.authStore.clear();
    this.router.navigate(['/login']) 
  }

  OpenSettings(): void {
    this.dialog.open(UserSettingsComponent); 
  }
}
