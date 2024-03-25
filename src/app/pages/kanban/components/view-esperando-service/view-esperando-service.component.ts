import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose } from '@angular/material/dialog';
import { PocketChamadosService } from '../../../../services/pocket-chamados.service';
import { ViewSelectUserComponent } from '../view-select-user/view-select-user.component';
import { AuthService } from '../../../../services/auth.service';
import { environment } from '../../../../environment';
import { ViewImageComponent } from '../view-image/view-image.component';

@Component({
  selector: 'app-view-esperando-service',
  standalone: true,
  imports: [MatDialogClose],
  templateUrl: './view-esperando-service.component.html',
  styleUrl: './view-esperando-service.component.scss'
})
export class ViewEsperandoServiceComponent {
  user_admin: boolean = false;
  apiUrl = environment.apiUrl;
  constructor (@Inject(MAT_DIALOG_DATA) public data: any, private authSrv : AuthService, public dialog: MatDialog,  public pocketSrv: PocketChamadosService){
    this.user_admin = authSrv.IsAdmin()
    console.log(this.user_admin)
  } 

  openAddView() {
    this.dialog
      .open(ViewSelectUserComponent, { data: this.data.users })
      .afterClosed()
      .subscribe((res: any[]) => {
        let usr: any[] = [];
        res.forEach((user: any) => {
          if (user.selecionado == true) usr.push(user.id);
        });

        // console.log("Last ",[...usr, this.pb.authStore.model!["id"]])
        // this.pocketSrv.updateChamadoUsers(this.data.id,[...usr]);

        this.pocketSrv.pb.collection('chamados').update(   
          this.data.id,
          {
            users: [...usr],
          },
          { requestKey: 'chamadoadd' },
        );

        this.dialog.closeAll();
    });

    // const dialogRef = this.dialog.open(AddTecnicoComponent, {data: this.data });
  }

  openImage(url : string){
    this.dialog.open(ViewImageComponent, {data: url});
  }

  selfTransfer(){
    this.pocketSrv.pb.collection('chamados').update(
      this.data.id, 
      {
        users: [this.pocketSrv.pb.authStore.model!["id"]],
      }
    )

    this.dialog.closeAll();
  }
}
