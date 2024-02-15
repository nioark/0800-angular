import { Component } from '@angular/core';
import { FrameNavComponent } from '../../../components/frame-nav/frame-nav.component';
import { AuthService } from '../../../services/auth.service';
import { RecordModel, RecordSubscription } from 'pocketbase';
import { PocketCollectionsService } from '../../../services/pocket-collections.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-andamento',
  standalone: true,
  imports: [FrameNavComponent],
  templateUrl: './andamento.component.html',
  styleUrl: './andamento.component.scss'
})
export class AndamentoComponent {

  chamados : any[] | undefined

  pb = this.authSrv.GetPocketBase()

  subscription : Subscription | undefined

  constructor (public authSrv : AuthService, public pocketCollectionsSrv : PocketCollectionsService) {

  }

  ngOnInit() {
    this.subscription = this.pocketCollectionsSrv.getChamadosWithStatus("em_andamento", "").subscribe(
      (chamados) => {
        this.chamados = chamados
      }
    ) 
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe()
  } 


}
