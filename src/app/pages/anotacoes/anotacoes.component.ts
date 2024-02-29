import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { PocketCollectionsService } from '../../services/pocket-collections.service';
import { EditBackgroundComponent } from '../kanban/components/edit-background/edit-background.component';
import { FrameNavComponent } from '../../components/frame-nav/frame-nav.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { AuthModel, RecordModel } from 'pocketbase';
import { BlocoComponent } from './bloco/bloco.component';
import { PocketAnotacoesService } from '../../services/pocket-anotacoes.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-anotacoes',
  standalone: true,
   imports: [FrameNavComponent, MatTooltipModule, CommonModule, BlocoComponent],
  templateUrl: './anotacoes.component.html',
  styleUrl: './anotacoes.component.scss',
})
export class AnotacoesComponent {
  mouseDown = false;
  startX: any;
  scrollLeft: any;
  dragging = false;
  @ViewChild('parent') slider: ElementRef;

  backgroundUrl = "/assets/cool-background.png"

  user : AuthModel

  blocos : RecordModel[] | undefined


  constructor(
    private change: ChangeDetectorRef,
    public dialog: MatDialog,
    private authSrv: AuthService,
    public PocketAnotacoesService: PocketAnotacoesService,
  ) {
    this.slider = new ElementRef(null);
    this.user = this.PocketAnotacoesService.pb.authStore.model!

    this.PocketAnotacoesService.getBlocosOwnAnotacoes().subscribe((blocos) => {
      this.blocos = blocos
      console.log("this.blocos", this.blocos)
    })
  }


  startDragging(e: MouseEvent, flag: boolean) {
    const element = e.target as any as HTMLElement;
    if (element.id != 'parent') {
      return;
    }

    this.mouseDown = true;
    this.startX = e.pageX - this.slider?.nativeElement.offsetLeft;
    this.scrollLeft = this.slider?.nativeElement.scrollLeft;
  }

  stopDragging(e: any, flag: boolean) {
    this.mouseDown = false;
  }

  moveEvent(e: any) {
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

  changeWallpaper(){
    const dialogRef = this.dialog.open(EditBackgroundComponent)
  }

  addBloco(){
    this.PocketAnotacoesService.addBloco("Novo Bloco")
  }
}
