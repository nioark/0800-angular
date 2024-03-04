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
  CdkDragStart,
  CdkDragEnd,
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

import { CommonModule, NgOptimizedImage } from '@angular/common'

import {MatTooltipModule} from '@angular/material/tooltip';

import PocketBase, { AuthModel, RecordModel } from 'pocketbase';

import { BehaviorSubject, Observable, Subject, Subscription, from, interval, map, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ViewServiceComponent } from './components/view-service/view-service.component';
import { PocketCollectionsService } from '../../services/pocket-collections.service';
import { AddFormComponent } from './components/add-form/add-form.component';
import { ImgAuthPipe } from '../../img-auth.pipe';
import { ViewEsperandoServiceComponent } from './components/view-esperando-service/view-esperando-service.component';
import { ViewSelectUserComponent } from './components/view-select-user/view-select-user.component';
import { environment } from '../../environment';
import { AuthService } from '../../services/auth.service';
import { EditBackgroundComponent } from './components/edit-background/edit-background.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { PocketAnotacoesService } from '../../services/pocket-anotacoes.service';
import { ViewAnotacaoComponent } from '../anotacoes/bloco/view-anotacao/view-anotacao.component';
import { BlocoComponent } from '../anotacoes/bloco/bloco.component';


interface TecnicoServicos {
  nome: string;
  id: number;
  servicos: string[];
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [FrameNavComponent, BlocoComponent, CdkDropListGroup, CdkDropList, CdkDrag, AsyncPipe, MatTooltipModule, ImgAuthPipe,NgOptimizedImage, CommonModule, MatButtonModule, MatMenuModule],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss'
})
export class KanbanComponent  {
  currentTime$: Observable<Date> | undefined;

  mouseDown = false;
  startX: any;
  scrollLeft: any;

  tecnicosdata: any
  chamadosdata: any;

  dragging = false

  apiUrl = environment.apiUrl
  isAdmin : boolean = false
  user : AuthModel

  backgroundUrl = "/assets/cool-background.png"

  tecnicosChamadosSubscription : Subscription | undefined
  chamadosEsperaSubscription : Subscription | undefined

  blocos : RecordModel[] = []

  anotacoes : RecordModel[] = []

  @ViewChild('parent') slider: ElementRef;
  constructor(private change:ChangeDetectorRef, private pocketAnotacao : PocketAnotacoesService, public dialog: MatDialog, private authSrv: AuthService, public pocketCollectionsSrv: PocketCollectionsService) {
    this.slider = new ElementRef(null);

    this.isAdmin = this.authSrv.IsAdmin()
    this.user = this.pocketCollectionsSrv.pb.authStore.model!

    this.tecnicosChamados = this.pocketCollectionsSrv.getTecnicosJoinChamados()

    const pb = authSrv.GetPocketBase()
    const this_user = pb.authStore.model as any

    if (this.user['background'] != ""){
      this.backgroundUrl = this.apiUrl + '/api/files/users/' + this.user['id'] + '/'  + this.user['background']
    }

    this.pocketAnotacao.fetchPublicBlocos().subscribe((anotacoes) => {
      console.log("ANOTACOES: ", anotacoes)
      this.blocos = anotacoes
    })


    this.tecnicosChamadosSubscription = this.tecnicosChamados.subscribe((tecnicos) => {
      console.log("Tecnicos chamados: ", tecnicos)

      let mapped = tecnicos.map((user : any) => {
        if (user?.expand?.chamados_via_users == undefined ) {
          user.expand = {}
          user.expand.chamados_via_users = []
        }
        user?.expand.chamados_via_users.sort((a : any, b : any) => {
          return b.priority - a.priority
        })

        user.canDragTo = user.id == this_user.id
      })

      this.tecnicosdata = tecnicos

      // this.tecnicosdata = this.tecnicosdata.sort((a : any, b : any) => {
      //   return a.id == this_user.id ? -1 : 1
      // })
      console.log("Tecnicos join chamados updated: ", tecnicos)
    })

    this.chamadosEsperaSubscription = this.pocketCollectionsSrv.getChamadosWithStatus("em_espera").subscribe((chamados) => {
      this.chamadosdata = chamados
      console.log("Chamados em espera updated: ", chamados)
    })

    // Create an observable that emits the current time every second
    this.currentTime$ = interval(1000).pipe(map(() => new Date()));
  }

  tecnicosChamados : Observable<RecordModel[]> 

  ngOnDestroy(){
    this.tecnicosChamadosSubscription?.unsubscribe() 
    this.chamadosEsperaSubscription?.unsubscribe()
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

  dragStarted(event: CdkDragStart<any>) {
    console.log("Dragging")
    this.dragging = true
  }

  dragEnded(event: CdkDragEnd<any>) {
    this.dragging = false 
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
    if (element.description != "null"){
      const chamadoSubject = new Subject<RecordModel>;

      this.tecnicosChamados.subscribe((data) => {
        data.forEach((tecnico : any) => {
          tecnico.chamados.forEach((chamado : any) => {
            if (chamado.id == element.id){
              chamadoSubject.next(chamado)
            }
          })
        })
      })
      

      this.dialog.open(ViewServiceComponent, {data: {data: element, dataObservable: chamadoSubject}, disableClose: true});
    }
  }

  openServiceEsperando(element : any ){
    const dialogRef = this.dialog.open(ViewEsperandoServiceComponent, {data: element, disableClose: true}); 
  }

  addService(){
    const dialogRef = this.dialog.open(AddFormComponent);
  }

  getUserNames(tecnicos : any){
   return tecnicos.map((user : any) => user.username).join(',\n') 
  }

  changeWallpaper(){
    const dialogRef = this.dialog.open(EditBackgroundComponent)
  }

  async addAnotacao(tecnico : any){
    console.log(tecnico)
    const record = await this.pocketAnotacao.addUserAnotacao(tecnico.id, "Nova anotação", "")
    console.log("Anotação adicionada", record)

    if (record != null) {
      this.dialog.open(ViewAnotacaoComponent, {data : record}); 
    }
  }

  addBloco(){
    this.pocketAnotacao.addBloco("Novo Bloco", true)
  }

}
