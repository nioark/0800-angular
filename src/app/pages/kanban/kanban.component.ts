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

import PocketBase from 'pocketbase';

import { BehaviorSubject, Observable, from, interval, map, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ViewServiceComponent } from './components/view-service/view-service.component';


interface TecnicoServicos {
  nome: string;
  id: number;
  servicos: string[];
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [FrameNavComponent, CdkDropListGroup, CdkDropList, CdkDrag, AsyncPipe],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss'
})
export class KanbanComponent implements OnInit  {

  tecnicos: TecnicoServicos[] = [
    { nome: 'jeferson', servicos: ["Instalação de softwares"], id: 1 },
    { nome: 'rafa', servicos: [], id: 2 },
    { nome: 'vini', servicos: [], id: 3 },
    { nome: 'kevin', servicos: [], id: 4 },
  ];

  servicos = ["Outlook não funciona", "Problema no micro", "Problema no Windows"]

  tecnicosSubject$: BehaviorSubject<TecnicoServicos[]> = new BehaviorSubject<TecnicoServicos[]>([])
  tecnicosData$: Observable<TecnicoServicos[]> | undefined

  servicosSubject$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([])
  servicosData$: Observable<string[]> | undefined

  cards : string[][] = [[], []]
  currentTime$: Observable<Date> | undefined;

  mouseDown = false;
  startX: any;
  scrollLeft: any;

  @ViewChild('parent') slider: ElementRef;
  constructor(private change:ChangeDetectorRef, public dialog: MatDialog) {
    this.slider = new ElementRef(null);
  }

  async getChamados(){
  const pb = new PocketBase('http://127.0.0.1:8090');

    const adminData = await pb.admins.authWithPassword('adm@hardtec.srv.br', 'nany88483240');

    const result = await pb.collection('Chamado').getList(1, 20)
    console.log(result)
  }

  ngOnInit() {
    
    this.getChamados()

    // Create an observable that emits the current time every second
    this.currentTime$ = interval(1000).pipe(map(() => new Date()));

    this.tecnicosData$ = this.tecnicosSubject$.asObservable()

    this.tecnicosData$.subscribe((tecnicos) => {
      console.log(tecnicos)
    })

    this.tecnicosSubject$.next([...this.tecnicos])

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes)
    if (changes['tecnicos']) {
      this.tecnicosSubject$.next([...this.tecnicos]);
    }
  }

  tecnicoEntered(event: CdkDragEnter<any>) {
    window.document.querySelector<any>('.cdk-drag-placeholder').style.opacity = "0"
  }

  updateStyle(){
    window.document.querySelector<any>('.cdk-drag-placeholder').style.opacity = "1"

    // window.document.querySelector<any>('.cdk-drag-placeholder').style.display = "block"
  }

  drop(event: CdkDragDrop<any>) {

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }


    let new_array = JSON.parse(JSON.stringify(this.tecnicos));
    this.tecnicosSubject$.next(new_array);



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
    const dialogRef = this.dialog.open(ViewServiceComponent);
  }


}
