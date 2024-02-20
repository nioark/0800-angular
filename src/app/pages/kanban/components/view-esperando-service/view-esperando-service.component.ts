import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose } from '@angular/material/dialog';
import { PocketCollectionsService } from '../../../../services/pocket-collections.service';

@Component({
  selector: 'app-view-esperando-service',
  standalone: true,
  imports: [MatDialogClose],
  templateUrl: './view-esperando-service.component.html',
  styleUrl: './view-esperando-service.component.scss'
})
export class ViewEsperandoServiceComponent {

  constructor (@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog,  public pocketSrv: PocketCollectionsService){
    
  }
}
