import { Component, OnInit, OnDestroy } from '@angular/core';
import { RecordSubscription, RecordModel } from 'pocketbase'; // Assuming these imports are correct
import { Subscription, BehaviorSubject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { FrameNavComponent } from '../../../../components/frame-nav/frame-nav.component';
import { AuthService } from '../../../../services/auth.service';
import { PocketCollectionsService } from '../../../../services/pocket-collections.service';
import { ViewServiceComponent } from '../../../kanban/components/view-service/view-service.component';
import { ViewEsperandoServiceComponent } from '../../../kanban/components/view-esperando-service/view-esperando-service.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aberto',
  imports: [FrameNavComponent, CommonModule],
  standalone: true,
  templateUrl: './aberto.component.html',
  styleUrls: ['./aberto.component.scss']
})
export class AbertoComponent {

  chamados: any[] = [];
  private pbSubscription: Subscription | undefined;
  private pbSubject = new BehaviorSubject<void>(undefined);

  private pb = this.authSrv.GetPocketBase()

  subscription : Subscription | undefined


  constructor(public authSrv: AuthService,public dialog: MatDialog, public pocketCollectionsSrv: PocketCollectionsService) {

  }

  ngOnInit(): void {
    this.subscription = this.pocketCollectionsSrv.getChamadosWithStatus("em_espera").subscribe(
      (chamados) => {
        console.log(chamados)
        this.chamados = chamados
      }
    )
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe()
  } 

  openService(element : any ){
    const dialogRef = this.dialog.open(ViewEsperandoServiceComponent, {data: element, disableClose: true});
  }

}
