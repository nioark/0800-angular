import { Component } from '@angular/core';
import { FrameNavComponent } from '../../components/frame-nav/frame-nav.component';
import { PocketCollectionsService } from '../../services/pocket-collections.service';
import { CommonModule, JsonPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { ViewServiceComponent } from '../kanban/components/view-service/view-service.component';
import { RecordModel } from 'pocketbase';
import { MatDialog } from '@angular/material/dialog';
import { Searcher } from 'fast-fuzzy';
 import {MatDatepickerInputEvent, MatDatepickerModule} from '@angular/material/datepicker'; 
import { MatNativeDateModule } from '@angular/material/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-registros',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [FrameNavComponent, CommonModule, MatFormFieldModule, MatDatepickerModule, FormsModule, ReactiveFormsModule, JsonPipe],
  templateUrl: './registros.component.html',
  styleUrl: './registros.component.scss'
})
export class RegistrosComponent {

  currentSearch: string = '';

  chamados: any[] = [];

  data_search: any[] = [];

 range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(private pocketSrv : PocketCollectionsService, private dialog: MatDialog) {
    pocketSrv.pb.collection('chamados').getFullList({filter:"status = 'finalizado' || status = 'cancelado'",expand:"users, created_by"}).then(data => {
      this.chamados = data
      this.data_search = this.chamados
      console.log(this.chamados)
    })
  }

  rangeSearch(event: MatDatepickerInputEvent<Date>){
    console.log(event.value)
    // this.data_search = this.chamados.filter(chamado => { 
    //   if ()
    // })
  }

  searchKeyup(event: Event, search: HTMLInputElement) {
    this.currentSearch = search.value;
    this.data_search = this.searchData(this.chamados);
  }

  searchData(data : RecordModel[]): RecordModel[]{
    if (this.currentSearch == '') return data;

    const searcher = new Searcher(data as any[], {
      keySelector: (obj) => obj.title,
      threshold: 0.7
    });

    const result = searcher.search(this.currentSearch, { returnMatchData: true });
    return result.map((data) => data.item);
  }

  openChamado(element : any ){
    if (element.description != "null"){
      const chamadoSubject = new Subject<RecordModel>;

      this.dialog.open(ViewServiceComponent, {data: {data: element, dataObservable: chamadoSubject}, disableClose: true});
    }
  }
}
