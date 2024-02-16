import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { PocketCollectionsService } from '../../../../../../services/pocket-collections.service';
import { RecordModel } from 'pocketbase';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-add-tecnico',
  standalone: true,
  imports: [FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe],
  templateUrl: './add-tecnico.component.html',
  styleUrl: './add-tecnico.component.scss'
})
export class AddTecnicoComponent {
  myControl = new FormControl();
  users: RecordModel[] = [];
  filteredUsers: Observable<RecordModel[]> | undefined;

  constructor(@Inject(MAT_DIALOG_DATA) public chamadoData: any, private pocketSrv : PocketCollectionsService) {
    pocketSrv.getTecnicosJoinChamados().subscribe(data => {
      this.users = data
      this.users = this.users.filter(user => {
        if (chamadoData.users.includes(user.id)) {
          return false
        }
        return true
      })
    })
  }

  ngOnInit() {
    this.filteredUsers = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: RecordModel): RecordModel[] {
    const filterValue = value;

    return this.users.filter(user => user['username'].toLowerCase().includes(filterValue));
  }

  getName(user: RecordModel) {
    return user['username']; 
  }

  selected() {
    console.log(this.myControl.value.id, this.chamadoData.id)
    this.pocketSrv.addTecnicoToChamado(this.chamadoData.id, this.myControl.value.id)  
  }
}
