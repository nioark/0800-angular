import { Component, EventEmitter, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { PocketCollectionsService } from '../../../../../../services/pocket-collections.service';
import { AuthService } from '../../../../../../services/auth.service';

@Component({
  selector: 'app-confirm-finalizar',
  standalone: true,
  imports: [MatDialogClose, FormsModule],
  templateUrl: './confirm-finalizar.component.html',
  styleUrl: './confirm-finalizar.component.scss'
})

export class ConfirmFinalizarComponent {
  horasNumber: number = 12
  minutoNumber: number = 0

  duracao : any

  constructor(@Inject(MAT_DIALOG_DATA) private data : any, private pocket : PocketCollectionsService, private authSrv : AuthService){
    let id = this.authSrv.getID()

    let user = data.expand.users.find((user : any) => user.id == id)
    let horas = user.duracao_total_seconds / 3600
    let minutos = (user.duracao_total_seconds % 3600) / 60

    this.horasNumber = Math.floor(horas)
    this.minutoNumber = Math.floor(minutos)
  }

  finalizarChamado(horasS : string, minutoS : string){
    let horas = parseInt(horasS)
    let minutos = parseInt(minutoS)

    console.log(horas, minutos)

    let segundos = horas * 3600 + minutos * 60
    console.log(segundos)

    this.pocket.addUserFinalizado(this.data.id, this.authSrv.getID(), segundos)
  }
}
