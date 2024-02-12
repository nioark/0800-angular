import { ChangeDetectorRef, Component, ElementRef, HostBinding, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FrameNavComponent } from '../../components/frame-nav/frame-nav.component';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
  CdkDragEnter,
  CdkDragExit,
} from '@angular/cdk/drag-drop';

import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';

import {MatTooltipModule} from '@angular/material/tooltip';


import PocketBase from 'pocketbase';

import { BehaviorSubject, Observable, from, interval, map, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ViewServiceComponent } from './components/view-service/view-service.component';
import { PocketCollectionsService } from '../../services/pocket-collections.service';


interface TecnicoServicos {
  nome: string;
  id: number;
  servicos: string[];
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [FrameNavComponent, CdkDropListGroup, CdkDropList, CdkDrag, AsyncPipe, MatTooltipModule],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss'
})
export class KanbanComponent implements OnInit  {
  currentTime$: Observable<Date> | undefined;

  mouseDown = false;
  startX: any;
  scrollLeft: any;

  tecnicosdata: any
  chamadosdata: any;

  @ViewChild('parent') slider: ElementRef;
  constructor(private change:ChangeDetectorRef, public dialog: MatDialog, public pocketCollectionsSrv: PocketCollectionsService) {
    this.slider = new ElementRef(null);
  }

  ngOnInit() {

    this.pocketCollectionsSrv.getTecnicosJoinChamados().subscribe((tecnicos) => {
      this.tecnicosdata = tecnicos
      console.log("Técnicos: ",tecnicos)
    })

    this.pocketCollectionsSrv.getChamadosWithStatus("em_espera").subscribe((chamados) => {
      this.chamadosdata = chamados
      console.log("Chamados: ", chamados)
    })

    // Create an observable that emits the current time every second
    this.currentTime$ = interval(1000).pipe(map(() => new Date()));
  }

  tecnicoEntered(event: CdkDragEnter<any>) {
    window.document.querySelector<any>('.cdk-drag-placeholder').style.opacity = "0"
  }

  updateStyle(){
    window.document.querySelector<any>('.cdk-drag-placeholder').style.opacity = "1"

    // window.document.querySelector<any>('.cdk-drag-placeholder').style.display = "block"
  }

  dropTecnico(event: CdkDragDrop<any>, user : any) {
    const chamado = event.previousContainer.data[event.previousIndex]
    // console.log(event.previousContainer, event.previousIndex)
    // console.log(chamado, user.username, user.id)
    this.pocketCollectionsSrv.pushTecnicoChamado(user.id, chamado)
  }

  drop(event: CdkDragDrop<any>) {

    if (event.previousContainer === event.container) {
      // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      console.log(event.container.data)
    } else {
      console.log(event.previousContainer.data, event.container.data)
      // transferArrayItem(
      //   event.previousContainer.data,
      //   event.container.data,
      //   event.previousIndex,
      //   event.currentIndex,
      // );
    }


    // let new_array = JSON.parse(JSON.stringify(this.tecnicos));
    // this.tecnicosSubject$.next(new_array);



  }

  startDragging(e : MouseEvent, flag : boolean) {
    const element = e.target as any as HTMLElement
    if (element.id != "parent") {
      return
    }

    this.mouseDown = true;
    this.startX = e.pageX - this.slider?.nativeElement.offsetLeft;
    this.scrollLeft = this.slider?.nativeElement.scrollLeft;
  }

  stopDragging(e : any, flag : boolean) {
    this.mouseDown = false;
  }

  moveEvent(e : any) {

    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }

    const x = e.pageX - this.slider?.nativeElement.offsetLeft;
    const scroll = x - this.startX;


    this.slider.nativeElement.scrollLeft = this.scrollLeft - scroll;
  }

  onWheel(event: WheelEvent): void {
    let addAmount = event.deltaY;

    let steps = addAmount / 10;
    let direction = Math.sign(addAmount);

    let slider = this.slider.nativeElement;

    const interval = setInterval(() => {
      slider.scrollLeft += steps;

      addAmount -= steps;

      if (direction * addAmount <= direction) {
        clearInterval(interval);
      }
    }, 10);

    event.preventDefault();
  }

  openService(element : any ){
    const dialogRef = this.dialog.open(ViewServiceComponent, {data: element});
  }

  getUserNames(tecnicos : any){
   return tecnicos.map((user : any) => user.username).join(',\n') 
  }


}
