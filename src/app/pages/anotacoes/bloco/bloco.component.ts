import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RecordModel } from 'pocketbase';
import { ViewAnotacaoComponent } from './view-anotacao/view-anotacao.component';
import { Observable, Subscription } from 'rxjs';
import { PocketAnotacoesService } from '../../../services/pocket-anotacoes.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { SelectBlocoComponent } from './select-bloco/select-bloco.component';

@Component({
  selector: 'app-bloco',
  standalone: true,
  imports: [MatTooltipModule, MatButtonModule, MatMenuModule],
  templateUrl: './bloco.component.html',
  styleUrl: './bloco.component.scss',
})
export class BlocoComponent implements OnInit {
  @Input({ required: true }) bloco!: any;
  @Input({ required: false }) blocoObservable!: Observable<RecordModel[]>;

  subscription: Subscription | undefined;

  constructor(
    private dialog: MatDialog,
    private pocket: PocketAnotacoesService,
  ) {}

  ngOnInit() {
    this.subscription = this.pocket
      .getBlocoObservable(this.bloco.id)
      .subscribe((bloco) => {
        this.bloco = bloco;
      });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  openAnotacao(record: RecordModel) {
    this.dialog.open(ViewAnotacaoComponent, { data: record });
  }

  async addAnotacao() {
    const record = await this.pocket.addAnotacaoAsync(
      this.bloco.id,
      'Nova anotação',
      '',
    );
    console.log('Anotação adicionada', record);
    this.dialog.open(ViewAnotacaoComponent, { data: record });
  }

  updateTitulo(event: Event) {
    this.pocket.salvarBlocoTitulo(
      this.bloco.id,
      (event.target as HTMLInputElement).value,
    );
  }

  removerAnotacao() {
    this.pocket.removerBloco(this.bloco.id);
  }
}
