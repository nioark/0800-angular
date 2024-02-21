import { Component } from '@angular/core';
import { FrameNavComponent } from '../../../../components/frame-nav/frame-nav.component';
import { AuthService } from '../../../../services/auth.service';
import { RecordModel, RecordSubscription } from 'pocketbase';
import { PocketCollectionsService } from '../../../../services/pocket-collections.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ViewServiceComponent } from '../../../kanban/components/view-service/view-service.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-andamento',
  standalone: true,
  imports: [FrameNavComponent, CommonModule],
  templateUrl: './andamento.component.html',
  styleUrl: './andamento.component.scss'
})
export class AndamentoComponent {

  chamados : any[] | undefined

  pb = this.authSrv.GetPocketBase()

  subscription : Subscription | undefined

  observable : Observable<any>

  constructor (public authSrv : AuthService, public dialog: MatDialog, public pocketCollectionsSrv : PocketCollectionsService) {
    this.observable = this.pocketCollectionsSrv.getChamadosWithStatus("em_andamento", " && users.id ?= '" + this.pb.authStore.model!["id"] + "'")
  }

  ngOnInit() {
    this.subscription = this.observable.subscribe(
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
    if (element.description != "null"){
      const chamadoSubject = new Subject<RecordModel>;

      this.observable.subscribe(
        (chamados) => { 
         chamados.forEach( 
           (chamado: RecordModel) => {
              if (chamado.id == element.id) 
               chamadoSubject.next(chamado)
           }
         )
        }
      )

      this.dialog.open(ViewServiceComponent, {data: {data: element, dataObservable: chamadoSubject}, disableClose: true});
    }
  }

}
