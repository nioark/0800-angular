import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RecordModel } from 'pocketbase';
import { ViewAnotacaoComponent } from './view-anotacao/view-anotacao.component';
import { Observable, Subscription } from 'rxjs';
import { PocketAnotacoesService } from '../../../services/pocket-anotacoes.service';

@Component({
  selector: 'app-bloco',
  standalone: true,
  imports: [MatTooltipModule],
  templateUrl: './bloco.component.html',
  styleUrl: './bloco.component.scss'
})
export class BlocoComponent {
  @Input({ required: true }) bloco!: any;
  @Input({ required: false }) blocoObservable!: Observable<RecordModel[]>;

  subscription : Subscription | undefined

  constructor(private dialog : MatDialog, private pocket : PocketAnotacoesService) {

  }

  ngOnInit() {
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
