import { Component } from '@angular/core';
import { FrameNavComponent } from '../../components/frame-nav/frame-nav.component';
import { PocketCollectionsService } from '../../services/pocket-collections.service';
import { CommonModule, JsonPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { ViewServiceComponent } from '../kanban/components/view-service/view-service.component';
import { RecordModel } from 'pocketbase';
import { MatDialog } from '@angular/material/dialog';
import { Searcher } from 'fast-fuzzy';
import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ViewSelectUserComponent } from '../kanban/components/view-select-user/view-select-user.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registros',
  standalone: true,
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ],
  imports: [
    FrameNavComponent,
    CommonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
  ],
  templateUrl: './registros.component.html',
  styleUrl: './registros.component.scss',
})
export class RegistrosComponent {
  currentSearch: string = '';

  chamados: any[] = [];

  data_search: any[] = [];

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  startDate : Date | null = null;
  endDate : Date | null = null;

  mostrarCancelados: boolean = false;
  mostrarFinalizados: boolean = true;
  mostrarFaturados: boolean = false;

  usersFilter : RecordModel[] = []
  usersFilterID : string[] = []

  constructor(
    private pocketSrv: PocketCollectionsService,
    private dialog: MatDialog,
    private authSrv: AuthService
  ) {
    let query = "(status = 'finalizado' || status = 'cancelado')"
    if (!authSrv.IsAdmin()){
       query += " && users.id ?= '" + pocketSrv.pb.authStore.model!['id'] + "'"
    }

    console.log("User query", query)

    pocketSrv.pb
      .collection('chamados')
      .getFullList({
        filter: query,
        expand: 'users, created_by',
      })
      .then((data) => {
        this.chamados = data;
        this.search()

        console.log(this.chamados);
      });

  }

  dateChanged() {
    if (this.startDate != null && this.endDate != null) {
      this.search();
    }
  }

  checkboxEvent(event: any) {
    this.search()
  }

  search() {
    let fuzzyMatched = this.searchData(this.chamados);
    if (this.startDate != null && this.endDate != null) {
      fuzzyMatched = fuzzyMatched.filter((chamado) => {
        return (
          new Date(chamado['created']) >= this.startDate! &&
          new Date(chamado['created']) <= this.endDate!
        );
      });
    }

    let canceladosFilter: RecordModel[] = []
    if (this.mostrarCancelados == true) {
      canceladosFilter = fuzzyMatched.filter((chamado: { [x: string]: string; }) => { 
          return chamado['status'] == 'cancelado';
        });
    }

    let finalizadosFilter: RecordModel[] = []
    if (this.mostrarFinalizados == true) {
      finalizadosFilter = fuzzyMatched.filter((chamado: { [x: string]: string; }) => { 
          let faturado = chamado['faturado'] as unknown as boolean
          return chamado['status'] == 'finalizado' && faturado == false
        });
    }

    let faturadosFilters: RecordModel[] = []
    if (this.mostrarFaturados == true) {
      faturadosFilters = fuzzyMatched.filter((chamado: { [x: string]: string; }) => {
        let faturado = chamado['faturado'] as unknown as boolean

        return faturado == true;
      })

    }

    fuzzyMatched = [...canceladosFilter, ...finalizadosFilter, ...faturadosFilters]

    if (this.usersFilterID.length > 0) {
        fuzzyMatched = fuzzyMatched.filter((chamado) => {
        let includedCount = 0


        this.usersFilterID.forEach((id) => {
          console.log(chamado["users"], id)
          if (chamado["users"].includes(id)) {
            includedCount++
          }
        })
        return includedCount == this.usersFilterID.length
      })
    }

    if (this.currentSearch == '') {
      //Sort date
      fuzzyMatched.sort((a, b) => {
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      })
    }
    
    this.data_search = fuzzyMatched;
  }

  searchKeyup(event: Event, search: HTMLInputElement) {
    this.currentSearch = search.value;
    this.search();
  }

  searchData(data: RecordModel[]): RecordModel[] {
    if (this.currentSearch == '') return data;

    const searcher = new Searcher(data as any[], {
      keySelector: (obj) => obj.title + ' ' + obj.cliente,
      threshold: 0.7,
    });

    const result = searcher.search(this.currentSearch, {
      returnMatchData: true,
    });
    return result.map((data) => data.item);
  }

  openChamado(element: any) {
    if (element.description != 'null') {
      const chamadoSubject = new Subject<RecordModel>();

      this.dialog.open(ViewServiceComponent, {
        data: { data: element, dataObservable: chamadoSubject },
        disableClose: true,
      });
    }
  }

  joinNames(users: RecordModel[]) {
    return users.map((user) => user["username"]).join(', '); 
  }

  openSelectView(){

    this.dialog.open(ViewSelectUserComponent, { data:  this.usersFilterID}).afterClosed().subscribe((users) => {
      let usersSelected : RecordModel[] = []
      let usersSelectedID : string[] = []

      if (users == undefined) {
        return
      }
      users.forEach((user: RecordModel) => {
        if(user["selecionado"]) {
          usersSelected.push(user)
          usersSelectedID.push(user["id"])
        }
      })

      this.usersFilter = usersSelected
      this.usersFilterID = usersSelectedID
      console.log("Selected user: ", usersSelected)
      this.search()
    })
      
  }
}
