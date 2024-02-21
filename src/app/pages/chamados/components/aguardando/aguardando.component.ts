import { Component } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { PocketCollectionsService } from '../../../../services/pocket-collections.service';
import { ViewServiceComponent } from '../../../kanban/components/view-service/view-service.component';
import { CommonModule } from '@angular/common';
import { RecordModel } from 'pocketbase';

@Component({
  selector: 'app-aguardando',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aguardando.component.html',
  styleUrl: './aguardando.component.scss'
})
export class AguardandoComponent {

  chamados : any[] | undefined

  pb = this.authSrv.GetPocketBase()

  subscription : Subscription | undefined

  observable : Observable<any>
 

  constructor (public authSrv : AuthService, public dialog: MatDialog, public pocketCollectionsSrv : PocketCollectionsService) {
    this.observable = this.pocketCollectionsSrv.getChamadosWithStatus("aguardando", " && users.id ?= '" + this.pb.authStore.model!["id"] + "'")
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

    const dialogRef = this.dialog.open(ViewServiceComponent, {data: {data: element, dataObservable: chamadoSubject}, disableClose: true});
  }

}
