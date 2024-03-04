import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { RecordModel } from 'pocketbase';
import { Searcher } from 'fast-fuzzy';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { PocketCollectionsService } from '../../../../../../services/pocket-collections.service';
import { ApiService } from '../../../../../../services/api.service';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-select-clients',
  standalone: true,
  imports: [MatInputModule, FormsModule,   MatDialogClose, MatTooltipModule],
  templateUrl: './select-clients.component.html',
  styleUrl: './select-clients.component.scss'
})
export class SelectClientsComponent {
    currentSearch: string = '';

  users: any[] = [];

  data_search : any[] = [];

  constructor(private apiSrv : ApiService) {
    apiSrv.FetchPessoas().subscribe((users) => {
      this.users = users
      this.data_search = this.users.slice(0, 100)

      console.log(users.length)
    })
  }

  searchKeyup(event: Event, search: HTMLInputElement) {
    this.currentSearch = search.value;
    var timenow = Date.now();
    this.data_search = this.searchDataRegex(this.users).slice(0, 100);
    console.log(Date.now() - timenow)
  }

  searchDataRegex(data : RecordModel[]): RecordModel[]{
    if (this.currentSearch == '') return data;
    let search = this.currentSearch.toUpperCase();
    return data.filter((item) => {
      if (item['nome'].includes(search)) {
        return true;
      }
      return false
    })
  }

  searchDataFuzzy(data : RecordModel[]): RecordModel[]{
    if (this.currentSearch == '') return data;

    const searcher = new Searcher(data as any[], {
      keySelector: (obj) => obj.nome,
      threshold: 0.7
    });

    const result = searcher.search(this.currentSearch, { returnMatchData: true });

    return result.map((data) => data.item);
  }
}
