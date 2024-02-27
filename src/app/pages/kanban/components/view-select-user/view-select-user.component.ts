import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose } from '@angular/material/dialog';
import { PocketCollectionsService } from '../../../../services/pocket-collections.service';
import { RecordModel } from 'pocketbase';
import { Searcher } from 'fast-fuzzy';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environment';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-view-select-user',
  standalone: true,
  imports: [MatInputModule, FormsModule,   MatDialogClose,],
  templateUrl: './view-select-user.component.html',
  styleUrl: './view-select-user.component.scss'
})
export class ViewSelectUserComponent {
  currentSearch: string = '';

  users: any[] = [];

  data_search : any[] = [];
  apiUrl = environment.apiUrl

  constructor(@Inject(MAT_DIALOG_DATA) public users_data: any, private authSrv: AuthService, public pocketSrv: PocketCollectionsService) {
    console.log("Chamado data: " , users_data)
    pocketSrv.pb.collection('users').getFullList().then((users) => {
      console.log(users)
      users.map((user) => {
        user['selecionado'] = false
        if (users_data.includes(user.id)) {
          user['selecionado'] = true
        }
      })


      if (!this.authSrv.IsAdmin()) {
        users = users.filter((user) => {
          if (user.id == pocketSrv.pb.authStore.model!["id"]){
            return false
          }

          return true
        })
      }

      this.users = users
      this.data_search = this.users
    })
  }

  searchKeyup(event: Event, search: HTMLInputElement) {
    this.currentSearch = search.value;
    this.data_search = this.searchData(this.users);
  }

  searchData(data : RecordModel[]): RecordModel[]{
    if (this.currentSearch == '') return data;

    const searcher = new Searcher(data as any[], {
      keySelector: (obj) => obj.username,
      threshold: 0.7
    });

    const result = searcher.search(this.currentSearch, { returnMatchData: true });
    return result.map((data) => data.item);
  }


}
