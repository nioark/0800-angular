import { Component, Input, ViewChild } from '@angular/core';
import { SanitizeHtmlPipe } from "../../../../../../sanitize-html.pipe";
import { RecordModel } from 'pocketbase';
import { environment } from '../../../../../../environment';
import { AuthService } from '../../../../../../services/auth.service';
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular';

@Component({
    selector: 'app-service-relatorio',
    standalone: true,
    templateUrl: './service-relatorio.component.html',
    styleUrl: './service-relatorio.component.scss',
    imports: [SanitizeHtmlPipe,  EditorModule,]
})
export class ServiceRelatorioComponent {
  @Input({ required: true }) date!: Date;
  @Input({ required: true }) user!: RecordModel;
  @Input({ required: true }) html!: string;
  @Input({ required: true }) relatorio_data!: RecordModel

  apiUrl = environment.apiUrl

  timeStamp : string = "";

  isFromUser : boolean = false

  mostrarEditor : boolean = false

  @ViewChild('editor') editorNew: EditorComponent | undefined;

  pb = this.authSrv.GetPocketBase()

  constructor(private authSrv : AuthService) { }

  ngOnInit(): void {
    this.isFromUser = this.user.id === this.authSrv.getID()

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - this.date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      this.timeStamp = `${diffInSeconds} segundos atrás`;
    } else if (diffInSeconds < 3600) {
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      this.timeStamp = `${diffInMinutes} minutos atrás`;
    } else if (diffInSeconds < 86400) {
      const diffInHours = Math.floor(diffInSeconds / 3600);
      this.timeStamp = `${diffInHours} horas atrás`;
    } else {
      this.timeStamp = this.date.toLocaleString('pt-br', { day: 'numeric', month: 'short' }) + " " + this.date.toLocaleTimeString('pt-br');
    }
  }

  carregarEditor(){
    this.mostrarEditor = true
  }

  editorCarregado(){
    this.editorNew!.editor.setContent(this.html as string);
    console.log("Editor carregado")
  }

  updateRelatorio(){
    this.html = this.editorNew!.editor.getContent()
    this.pb.collection('relatorios').update(this.relatorio_data.id,{
          relatorio: this.html,
    })

    this.mostrarEditor = false
  }

}
