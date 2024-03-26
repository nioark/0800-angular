import { Component } from '@angular/core';
import { environment } from '../../environment';
import PocketBase, { RecordModel } from 'pocketbase';
import { CommonModule } from '@angular/common';
import { PocketChamadosService } from '../../services/pocket-chamados.service';

export interface Mouse {
  id: string; 
  pos_x: string;
  pos_y: string;
}

@Component({
  selector: 'app-mouses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mouses.component.html',
  styleUrl: './mouses.component.scss'
})



export class MousesComponent {

  users : any = {}

  usuarios : { [id: string] : {pos_x : string, pos_y : string}; } = {}
  pb: PocketBase;
  constructor(public pocketSrv: PocketChamadosService,) { 

    this.pocketSrv.getUsers().subscribe((res : any[]) => {
      res.forEach((user : any) => {
        this.users[user["id"]] = user
      })
      console.log(this.users)
    })

    this.pb = new PocketBase(environment.apiUrl);
    this.pb.realtime.subscribe("mouseevent", (e) => {
      this.usuarios[e.id] = e
    })
  }
}
