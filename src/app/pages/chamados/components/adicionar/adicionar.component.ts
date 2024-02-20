import { Component, ElementRef, ViewChild } from '@angular/core';
import { FrameNavComponent } from '../../../../components/frame-nav/frame-nav.component';
import PocketBase from 'pocketbase';
import Client from 'pocketbase';
import { AuthService } from '../../../../services/auth.service';
import { AddChamadoComponent } from './component/add-chamado/add-chamado.component';

@Component({
  selector: 'app-adicionar',
  standalone: true,
  imports: [FrameNavComponent, AddChamadoComponent],
  templateUrl: './adicionar.component.html',
  styleUrl: './adicionar.component.scss'
})
export class AdicionarComponent {


  constructor(public authSrv : AuthService){
    
  }
}
