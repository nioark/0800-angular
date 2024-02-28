import { Injectable } from '@angular/core';
import PocketBase, { RecordModel } from 'pocketbase';
import { environment } from '../environment';
import { Observable, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PocketAnotacoesService {
  pb = new PocketBase(environment.apiUrl);

  constructor() {

  }

  getBlocosAnotacoes(): Observable<RecordModel[]>{
    const subject = new Subject<RecordModel[]>

    this.pb.collection('blocos').getFullList({expand: 'anotacoes'}).then((blocos) => {
      subject.next(blocos)
    })

    this.pb.collection('blocos').subscribe('*', function (e) {
        console.log(e.action);
        console.log(e.record);
    }, { expand: 'anotacoes' });

    return subject
  }

  salvarAnotacaoDescricao(id_anotacao : string, descricao_html : string){
    this.pb.collection('anotacoes').update(id_anotacao, {
      descricao: descricao_html
    })
  }

  addImage(id_anotacao : string, image : FormData){
    this.pb.collection('anotacoes').update(id_anotacao, image);
  }

  salvarAnotacaoTitulo(id_anotacao : string, titulo : string){
    console.log("titulo: " + titulo)
    this.pb.collection('anotacoes').update(id_anotacao, { 
      titulo: titulo
    }).then((data) => {
      console.log("salvo com sucesso", data)
    })
  }


}
