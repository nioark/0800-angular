import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RecordModel } from 'pocketbase';
import { ViewAnotacaoComponent } from './view-anotacao/view-anotacao.component';
import { Observable, Subscription } from 'rxjs';
import { PocketAnotacoesService } from '../../../services/pocket-anotacoes.service';
import { initFlowbite } from 'flowbite';

import {
  initDropdowns,
} from 'flowbite';

@Component({
  selector: 'app-bloco',
  standalone: true,
  imports: [MatTooltipModule],
  templateUrl: './bloco.component.html',
  styleUrl: './bloco.component.scss'
})


export class BlocoComponent implements OnInit {
  @Input({ required: true }) bloco!: any;
  @Input({ required: false }) blocoObservable!: Observable<RecordModel[]>;

  subscription : Subscription | undefined

  constructor(private dialog : MatDialog, private pocket : PocketAnotacoesService) {

  }

  ngOnInit() {
    console.log("Iniciado bloco")
    initFlowbite();
    this.subscription = this.pocket.getBlocoObservable(this.bloco.id).subscribe(
      (bloco) => {
        console.log("Bloco updated", bloco)
        this.bloco = bloco
      }
    ) 
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe() 

  }

  openAnotacao(record: RecordModel) {
    this.dialog.open(ViewAnotacaoComponent, {data : record}); 
  }

}
