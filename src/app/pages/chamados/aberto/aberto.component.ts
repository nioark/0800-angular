import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { RecordSubscription, RecordModel } from 'pocketbase'; // Assuming these imports are correct
import { Subscription, BehaviorSubject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { FrameNavComponent } from '../../../components/frame-nav/frame-nav.component';
import { PocketCollectionsService } from '../../../services/pocket-collections.service';

@Component({
  selector: 'app-aberto',
  imports: [FrameNavComponent],
  standalone: true,
  templateUrl: './aberto.component.html',
  styleUrls: ['./aberto.component.scss']
})
export class AbertoComponent {

  chamados: any[] = [];
  private pbSubscription: Subscription | undefined;
  private pbSubject = new BehaviorSubject<void>(undefined);

  private pb = this.authSrv.GetPocketBase()

  subscription : Subscription | undefined


  constructor(public authSrv: AuthService, public pocketCollectionsSrv: PocketCollectionsService) {

  }

  ngOnInit(): void {
    this.subscription = this.pocketCollectionsSrv.getChamadosWithStatus("em_espera").subscribe(
      (chamados) => {
        this.chamados = chamados
      }
    )
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe()
  } 


  async fetchChamados() {
    try {
      const res = await this.pb.collection('chamados').getList(1, 50, { filter: "status = 'em_espera'" });
      console.log(res);
      this.chamados = res.items;
    } catch (error) {
      console.error("Error fetching chamados:", error);
    }
  }

}
