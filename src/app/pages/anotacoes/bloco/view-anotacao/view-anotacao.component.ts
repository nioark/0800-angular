import { Component, Inject, Input, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose } from '@angular/material/dialog';
import { ViewImageComponent } from '../../../kanban/components/view-image/view-image.component';
import { environment } from '../../../../environment';
import { SanitizeHtmlPipe } from "../../../../sanitize-html.pipe";
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular';
import { PocketAnotacoesService } from '../../../../services/pocket-anotacoes.service';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { SelectBlocoComponent } from '../select-bloco/select-bloco.component';
import cloneDeep from 'lodash.clonedeep';

@Component({
    selector: 'app-view-anotacao',
    standalone: true,
    templateUrl: './view-anotacao.component.html',
    styleUrl: './view-anotacao.component.scss',
    imports: [MatDialogClose, SanitizeHtmlPipe, EditorModule, MatButtonModule, MatMenuModule]
})
export class ViewAnotacaoComponent {

  apiUrl = environment.apiUrl
  @ViewChild('editor') editorNew: EditorComponent | undefined;
  mostrarEditor: boolean = false

  subscription : Subscription | undefined

  constructor (@Inject(MAT_DIALOG_DATA) public data : any, private dialog : MatDialog, private pocket : PocketAnotacoesService) {
    this.data = cloneDeep(data)

    console.log("this.data",this.data)

    this.data.imagens = this.mapIsVideo(this.data.imagens)

    this.subscription = this.pocket.getAnotacaoObservable(data.id).subscribe((anotacao : any) => {
      console.log("Anotação updated", anotacao)
      anotacao.imagens = this.mapIsVideo(anotacao.imagens)
      this.data = anotacao
      console.log("DAta midia: ",this.data)

    })
  }

  mapIsVideo(imagens : any){
    imagens = imagens.map((img : any) => {
        let ext = img.split('.').pop()
        let isVideo = false
        //get is video
        if (ext == 'mp4' || ext == 'mov' || ext == 'avi' || ext == 'mkv' || ext == 'webm' || ext == "mpeg") { 
          isVideo = true
        }
        console.log(isVideo)

        return {url : img, isVideo : isVideo, type : ext}
    })

    return imagens
  }

  ngOnDestroy(){
    this.subscription?.unsubscribe() 
  }

  openImage(url: string) {
   this.dialog.open(ViewImageComponent,{ data: url });
  }

  showEditor(){
    this.mostrarEditor = true
  }

  salvarDescricao(){
    this.mostrarEditor = false
    if (!this.editorNew) return

    let content = this.editorNew?.editor.getContent()
    this.data.descricao = content
    this.pocket.salvarAnotacaoDescricao(this.data.id, content)
  }

  editorCarregado(){
    if (this.editorNew){
      this.editorNew?.editor.setContent(this.data.descricao)

    }

  }

  addImage(event : Event){
    console.log("Added image")
    let target = event.target as HTMLInputElement

    let files = target.files as FileList

    let file = files[0]

    // this.images.push(URL.createObjectURL(file))

    let formData = new FormData()
    formData.append('imagens', file)

    this.pocket.addImage(this.data.id, formData)
  }

  removeImage(file_name : string){
    this.pocket.removeImage(this.data.id, file_name) 
  }

  changeTitle(event : Event){
    this.pocket.salvarAnotacaoTitulo(this.data.id, (event.target as HTMLInputElement).value) 
  }

  excluirAnotacao(){
    this.pocket.excluirAnotacao(this.data.id)
    this.dialog.closeAll()
  }

  async transferirAnotacao(){
    let blocos = await this.pocket.getBlocosOwnNoSync()
    this.dialog.open(SelectBlocoComponent, {data : {blocos:blocos, bloco : this.data}}).afterClosed().subscribe((bloco : any) => {;
      this.pocket.transferirAnotacao(this.data.id, bloco.id)
    })
  }

  async copiarAnotacao(){
    let blocos = await this.pocket.getBlocosOwnNoSync()
    this.dialog.open(SelectBlocoComponent, {data : {blocos:blocos, bloco : this.data}}).afterClosed().subscribe((bloco : any) => {;
      this.pocket.copiarAnotacao(this.data.id, bloco.id)
    })
  }
}
