import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { PocketCollectionsService } from '../../../../services/pocket-collections.service';

@Component({
  selector: 'app-aguardando',
  standalone: true,
  imports: [],
  templateUrl: './aguardando.component.html',
  styleUrl: './aguardando.component.scss'
})
export class AguardandoComponent {

  chamados : any[] | undefined

  pb = this.authSrv.GetPocketBase()

  subscription : Subscription | undefined

  constructor (public authSrv : AuthService, public dialog: MatDialog, public pocketCollectionsSrv : PocketCollectionsService) {}

  ngOnInit() {
    this.subscription = this.pocketCollectionsSrv.getChamadosWithStatus("aguardando", " && users.id ?= '" + this.pb.authStore.model!["id"] + "'").subscribe(
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

}
