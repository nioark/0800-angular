import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ViewImageComponent } from '../../pages/kanban/components/view-image/view-image.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../environment';
import { PocketAnotacoesService } from '../../services/pocket-anotacoes.service';
import { PocketSharedService } from '../../services/pocket-shared.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media.component.html',
  styleUrl: './media.component.scss',
})
export class MediaComponent implements OnInit, OnChanges {
  @Input() midias!: any[];
  @Input() collection!: string;
  @Input() objectID!: string;
  @Input() showAddBtn: boolean = true;

  midiasObj: any[] = [];

  apiUrl = environment.apiUrl;

  constructor(
    private dialog: MatDialog,
    private pocket: PocketAnotacoesService,
    private sharedPocket: PocketSharedService,
  ) {}

  ngOnInit() {
    console.log(this.midias, this.collection, this.objectID);
    this.midiasObj = this.getTypes(this.midias);
  }

  ngOnChanges() {
    this.midiasObj = this.getTypes(this.midias);
  }

  getTypes(midias: any) {
    if (!midias) return;

    let midiasObj = midias.map((imgUrl: string) => {
      let ext = imgUrl.split('.').pop();
      let isVideo = false;
      //get is video
      if (
        ext == 'mp4' ||
        ext == 'mov' ||
        ext == 'avi' ||
        ext == 'mkv' ||
        ext == 'webm' ||
        ext == 'mpeg'
      ) {
        isVideo = true;
      }

      return { url: imgUrl, isVideo: isVideo, type: ext };
    });

    return midiasObj;
  }

  openMidia(url: string) {
    this.dialog.open(ViewImageComponent, { data: url });
  }

  addMidia(event: Event) {
    let target = event.target as HTMLInputElement;

    let files = target.files as FileList;

    let file = files[0];

    // this.images.push(URL.createObjectURL(file))

    let formData = new FormData();
    formData.append('midias', file);

    target.value = '';
    this.sharedPocket.addMidia(this.objectID, formData, this.collection);
  }

  removeMidia(file_name: string) {
    console.log('Removendo midia: ', file_name);
    this.sharedPocket.removeMidia(this.objectID, file_name, this.collection);
  }
}
