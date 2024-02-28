import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RecordModel } from 'pocketbase';
import { ViewAnotacaoComponent } from './view-anotacao/view-anotacao.component';

@Component({
  selector: 'app-bloco',
  standalone: true,
  imports: [MatTooltipModule],
  templateUrl: './bloco.component.html',
  styleUrl: './bloco.component.scss'
})
export class BlocoComponent {
  @Input({ required: true }) bloco!: any;

  constructor(private dialog : MatDialog) { }

  openAnotacao(record: RecordModel) {
    this.dialog.open(ViewAnotacaoComponent, {data : record}); 
  }

}
