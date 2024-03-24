import { Component } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ContratosService } from '../../services/contratos.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { Contrato } from '../../models/contrato';
import { Searcher } from 'fast-fuzzy';
import { environment } from '../../../environment';
import { FrameNavComponent } from '../../../components/frame-nav/frame-nav.component';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, AsyncPipe, SidebarComponent, FrameNavComponent],
  templateUrl: './contratos.component.html',
  styleUrl: './contratos.component.scss',
})
export class ContratosComponent {
  data: Observable<Contrato[]> | undefined;
  firstData: Contrato[] | undefined;
  contratos: Contrato[] | undefined;

  contratoSrv: ContratosService;
  currentSearch: string = '';

  isAdmin: boolean = localStorage.getItem('isAdmin') == 'true';

  constructor(contratoSrv: ContratosService) {
    this.contratoSrv = contratoSrv;
    this.data = this.contratoSrv.fetch().pipe(
      map((data) => {
        let sorted = data.sort((a_val, b_val) => {
          let a = a_val.email_services_count;
          let b = b_val.email_services_count;
          if (a < b) return -1;
          if (a > b) return 1;

          return 0;
        });
        //Sort based on invalid domains boolean
        sorted = sorted.sort((a_val, b_val) => {
          let a = a_val.has_invalid_domains;
          let b = b_val.has_invalid_domains;
          if (a < b) return 1;
          if (a > b) return -1;

          return 0;
        });

        this.firstData = sorted;
        this.contratos = sorted;

        console.log(sorted);

        return sorted;
      }),
    );
  }

  round(num: number) {
    return Number(num.toFixed(1));
  }

  searchObj(obj: Contrato): string {
    let domains_list: any = [];
    obj.email_services.forEach((dms) => {
      domains_list.push(dms.name);
    });

    return domains_list.join(' ');
  }

  searchData(data: Contrato[]): Contrato[] {
    if (this.currentSearch == '') return data;

    let d = data.map((obj: any) => {
      obj.domain = this.searchObj(obj);
      return obj;
    });

    const searcher = new Searcher(d as any[], {
      keySelector: (obj) => [obj.nome_pessoa, obj.nome_fantasia, obj.domain],
      threshold: 0.7,
    });

    const result = searcher.search(this.currentSearch, {
      returnMatchData: true,
    });
    return result.map((data) => data.item);
  }

  searchKeyup(event: any, search: HTMLInputElement) {
    this.currentSearch = search.value;
    if (this.currentSearch == '') {
      this.contratos = this.firstData;
    } else {
      this.contratos = this.searchData(this.firstData as Contrato[]);
    }
  }
}
