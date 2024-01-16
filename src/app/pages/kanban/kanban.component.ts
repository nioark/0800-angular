import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FrameNavComponent } from '../../components/frame-nav/frame-nav.component';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { BehaviorSubject, Observable, interval, map } from 'rxjs';
import { AsyncPipe } from '@angular/common';


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

  tecnicosSubject$: BehaviorSubject<TecnicoServicos[]> = new BehaviorSubject<TecnicoServicos[]>([])
  tecnicosData$: Observable<TecnicoServicos[]> | undefined

  servicos = ["Outlook não funciona", "Problema no micro", "Problema no Windows"]
  cards : string[][] = [[], []]


  currentTime$: Observable<Date> | undefined;

  ngOnInit() {
    // Create an observable that emits the current time every second
    this.currentTime$ = interval(1000).pipe(map(() => new Date()));

    this.tecnicosData$ = this.tecnicosSubject$.asObservable()

    this.tecnicosData$.subscribe((tecnicos) => {
      console.log(tecnicos)
    })
  }


  @ViewChild('parent') slider: ElementRef;
  constructor() {
    this.slider = new ElementRef(null);


  }

  mouseDown = false;

  startX: any;

  scrollLeft: any;

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

  drop(event: CdkDragDrop<any>) {
    this.tecnicosSubject$.next({...this.tecnicos})

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
  }
}
