import { Component, Inject, Input, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose } from '@angular/material/dialog';
import { ViewImageComponent } from '../../../kanban/components/view-image/view-image.component';
import { environment } from '../../../../environment';
import { SanitizeHtmlPipe } from "../../../../sanitize-html.pipe";
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular';
import { PocketAnotacoesService } from '../../../../services/pocket-anotacoes.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-view-anotacao',
    standalone: true,
    templateUrl: './view-anotacao.component.html',
    styleUrl: './view-anotacao.component.scss',
    imports: [MatDialogClose, SanitizeHtmlPipe, EditorModule]
})
export class ViewAnotacaoComponent {

  apiUrl = environment.apiUrl
  @ViewChild('editor') editorNew: EditorComponent | undefined;
  mostrarEditor: boolean = false

  subscription : Subscription | undefined

  constructor (@Inject(MAT_DIALOG_DATA) public data : any, private dialog : MatDialog, private pocket : PocketAnotacoesService) {
    this.subscription = this.pocket.getAnotacaoObservable(data.id).subscribe((anotacao : any) => {
      console.log("Anotação updated", anotacao)
      this.data = anotacao
    })
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

  changeTitle(event : Event){
    this.pocket.salvarAnotacaoTitulo(this.data.id, (event.target as HTMLInputElement).value) 
  }
}
