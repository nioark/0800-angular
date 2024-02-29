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

  getAnotacaoObservable(id : string) : Observable<RecordModel>{
    const subject = new Subject<RecordModel>

    this.pb.collection('anotacoes').subscribe(id, function (e) {
      subject.next(e.record)
    })

    //Todo return something to tell what to unsubscribe to

    return subject.asObservable()
  }

  getBlocoObservable(id : string) : Observable<RecordModel>{
    const subject = new Subject<RecordModel>

    this.pb.collection('blocos').subscribe(id, function (e) {
      subject.next(e.record)
    }, { expand: 'anotacoes' });


    this.pb.collection('anotacoes').subscribe("*", function (e) {
      if (e.record.expand){
        subject.next(e.record.expand["bloco"])
      }
    }, {filter : "bloco = '" + id + "'", expand: "bloco.anotacoes"});

    //Todo return something to tell what to unsubscribe to

    return subject.asObservable()
  }

  async getBlocosOwnNoSync() : Promise<RecordModel[]>{
    return await this.pb.collection('blocos').getFullList({filter: "created_by = " +  "'" + this.pb.authStore.model!["id"] + "'"})
  }

  getBlocosOwnAnotacoes(): Observable<RecordModel[]>{
    const subject = new Subject<RecordModel[]>

    let blocos : RecordModel[]= []

    this.pb.collection('blocos').getFullList({expand: 'anotacoes', filter: "created_by = " +  "'" + this.pb.authStore.model!["id"] + "'"}).then((blocosData) => {
      blocos = blocosData
      subject.next(blocos)
    })

    this.pb.collection('blocos').subscribe('*', function (e) {
        console.log(e.action);
        console.log(e.record);
        if (e.action == "create"){
          blocos.push(e.record)
          subject.next(blocos)
        } else if (e.action == "delete"){
          blocos = blocos.filter(bloco => bloco.id != e.record.id) 
          subject.next(blocos)
        }
    }, { expand: 'anotacoes' });
    //Todo user back to back relation to avoid any to many

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

  salvarBlocoTitulo(id_bloco : string, titulo : string){
    this.pb.collection('blocos').update(id_bloco, { 
      titulo: titulo
    })
  }

  async addAnotacaoAsync(id_bloco : string, titulo : string, descricao : string){
    let anotacao = await this.pb.collection('anotacoes').create({
      titulo: titulo,
      descricao: descricao,
      bloco: id_bloco
    })
    await this.pb.collection('blocos').update(id_bloco, {
      'anotacoes+': anotacao.id
    })

    return anotacao
  }

  excluirAnotacao(id_anotacao : string){
    this.pb.collection('anotacoes').delete(id_anotacao) 
  }

  async transferirAnotacao(id_anotacao : string, id_bloco : string){
    let this_anotacao = await this.pb.collection('anotacoes').getOne(id_anotacao)

    console.log(this_anotacao)
    //Remove reference from old bloco
    await this.pb.collection('blocos').update(this_anotacao['bloco'], {
      "anotacoes-": id_anotacao
    })

    //Add reference to itself
    await this.pb.collection('anotacoes').update(id_anotacao, {
      bloco: id_bloco
    })

    //Add referencet to new bloco
    await this.pb.collection('blocos').update(id_bloco, {
      "anotacoes+": id_anotacao
    })

  }

  addBloco(titulo : string){
    this.pb.collection('blocos').create({ 
      titulo: titulo,
      created_by: this.pb.authStore.model!["id"]
    })
  }

  removerBloco(id_bloco : string){
    this.pb.collection('blocos').delete(id_bloco) 
  }


}
