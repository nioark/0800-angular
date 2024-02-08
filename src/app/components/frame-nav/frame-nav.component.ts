import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PocketCollectionsService } from '../../services/pocket-collections.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-frame-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './frame-nav.component.html',
  styleUrl: './frame-nav.component.scss'
})
export class FrameNavComponent {

  chamados_em_espera: Number = 0;
  chamados_em_andamento: Number = 0;

  sub1 : Subscription | undefined
  sub2 : Subscription | undefined

  constructor(public router: Router, pocketCollectionsSrv: PocketCollectionsService) {
    this.chamados_em_espera = pocketCollectionsSrv.chamados_em_espera
    this.sub1 = pocketCollectionsSrv.em_espera_event.subscribe(
      (count) => {
        this.chamados_em_espera = count
      }
    )

    this.chamados_em_andamento = pocketCollectionsSrv.chamados_em_andamento
    this.sub2 = pocketCollectionsSrv.em_andamento_event.subscribe(
      (count) => {
        this.chamados_em_andamento = count
      }
    )
  }

  ngOnDestroy() {
    if (this.sub1)
      this.sub1.unsubscribe()

    if (this.sub2)
      this.sub2.unsubscribe()
  } 

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}
