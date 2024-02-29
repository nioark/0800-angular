import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { PocketAnotacoesService } from '../../../../services/pocket-anotacoes.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-select-bloco',
  standalone: true,
  imports: [MatInputModule, FormsModule,   MatDialogClose],
  templateUrl: './select-bloco.component.html',
  styleUrl: './select-bloco.component.scss'
})
export class SelectBlocoComponent {

  currentSearch: string = '';

  blocos: any[] = [];

  data_search : any[] = [];

 constructor(@Inject(MAT_DIALOG_DATA) public blocos_data: { blocos : any, bloco : any}, private authSrv: AuthService, public pocketSrv: PocketAnotacoesService) {
  this.blocos = blocos_data.blocos

  let own_block = this.blocos_data.blocos.findIndex((bloco: any) => {
    return bloco.id == blocos_data.bloco
  })

  //REmove the index
  console.log("this.blocos", this.blocos)
 }

 searchKeyup(event: any, search : HTMLInputElement) {
 }
}
