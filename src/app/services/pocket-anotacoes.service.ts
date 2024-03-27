import { Injectable } from '@angular/core';
import PocketBase, { RecordModel } from 'pocketbase';
import { environment } from '../environment';
import { Observable, Subject } from 'rxjs';
import { PocketSharedService } from './pocket-shared.service';

@Injectable({
  providedIn: 'root',
})
export class PocketAnotacoesService {
  pb = new PocketBase(environment.apiUrl);

  constructor(private sharedPocket: PocketSharedService) {}

  getAnotacaoObservable(id: string): Observable<RecordModel> {
    const subject = new Subject<RecordModel>();

    this.pb.collection('anotacoes').subscribe(
      id,
      function (e) {
        subject.next(e.record);
      },
      { expand: 'bloco' },
    );

    //Todo return something to tell what to unsubscribe to

    return subject.asObservable();
  }

  fetchPublicBlocos(): Observable<RecordModel[]> {
    const subject = new Subject<RecordModel[]>();

    let blocos: RecordModel[] = [];

    this.pb
      .collection('blocos')
      .getFullList({
        filter: 'public = true',
        expand: 'anotacoes_via_bloco.bloco',
      })
      .then((data) => {
        blocos = data;
        subject.next(data);
      });

    this.pb.collection('blocos').subscribe(
      '*',
      function (e) {
        if (e.action == 'create') {
          blocos.push(e.record);
          subject.next(blocos);
        } else if (e.action == 'delete') {
          blocos = blocos.filter((bloco) => bloco.id != e.record.id);
          subject.next(blocos);
        } else if (e.action == 'update') {
          let findIndex = blocos.findIndex((bloco) => bloco.id == e.record.id);
          blocos[findIndex] = e.record;
          subject.next(blocos);
        }
      },
      { expand: 'anotacoes_via_bloco.bloco' },
    );

    return subject;
  }

  async getBlocosOwnNoSync(): Promise<RecordModel[]> {
    return await this.pb.collection('blocos').getFullList({
      filter: 'created_by = ' + "'" + this.pb.authStore.model!['id'] + "'",
    });
  }

  // fetchUserAnotacoesObservable() : Observable<RecordModel[]>{
  //   const subject = new Subject<RecordModel[]>

  //   let anotacoes : RecordModel[] = []

  //   this.pb.collection('anotacoes').getFullList().then((data) => {
  //     anotacoes = data
  //     subject.next(anotacoes)
  //   })

  //   this.pb.collection('anotacoes').subscribe('*', function (e) {
  //       if (e.action == "create"){
  //         anotacoes.push(e.record)
  //         subject.next(anotacoes)
  //       } else if (e.action == "delete"){
  //         anotacoes = anotacoes.filter(anotacao => anotacao.id != e.record.id)
  //         subject.next(anotacoes)
  //       } else if (e.action == "update"){
  //         let findIndex = anotacoes.findIndex(anotacao => anotacao.id == e.record.id)
  //         anotacoes[findIndex] = e.record
  //         subject.next(anotacoes)
  //       }
  //   })

  //   return subject.asObservable()
  // }

  getBlocoObservable(id: string): Observable<RecordModel> {
    const subject = new Subject<RecordModel>();

    this.pb.collection('blocos').subscribe(
      id,
      function (e) {
        console.log('EXPANDED VIA BLOCOS, ', e.record);

        subject.next(e.record);
      },
      { expand: 'anotacoes_via_bloco.bloco' },
    );

    this.pb.collection('anotacoes').subscribe(
      '*',
      function (e) {
        console.log('Event anotacoes via bloco: ', e);
        if (e.record.expand) {
          console.log('EXPANDED VIA ANOTACOES, ', e.record.expand['bloco']);
          subject.next(e.record.expand['bloco']);
        }
      },
      {
        filter: "bloco = '" + id + "'",
        expand: 'bloco.anotacoes_via_bloco.bloco',
      },
    );

    //Todo return something to tell what to unsubscribe to

    return subject.asObservable();
  }

  getBlocosOwnAnotacoes(): Observable<RecordModel[]> {
    const subject = new Subject<RecordModel[]>();

    let blocos: RecordModel[] = [];

    this.pb
      .collection('blocos')
      .getFullList({
        expand: 'anotacoes_via_bloco.bloco',
        filter:
          'created_by = ' +
          "'" +
          this.pb.authStore.model!['id'] +
          "' && public = false",
      })
      .then((blocosData) => {
        blocos = blocosData;
        subject.next(blocos);
      });

    this.pb.collection('blocos').subscribe(
      '*',
      function (e) {
        console.log(e.action);
        console.log(e.record);
        if (e.action == 'create') {
          blocos.push(e.record);
          subject.next(blocos);
        } else if (e.action == 'delete') {
          blocos = blocos.filter((bloco) => bloco.id != e.record.id);
          subject.next(blocos);
        }
      },
      { expand: 'anotacoes_via_bloco.bloco' },
    );
    //Todo user back to back relation to avoid any to many

    return subject;
  }

  salvarAnotacaoDescricao(id_anotacao: string, descricao_html: string) {
    this.pb.collection('anotacoes').update(id_anotacao, {
      descricao: descricao_html,
    });
  }

  salvarAnotacaoTitulo(id_anotacao: string, titulo: string) {
    console.log('titulo: ' + titulo);
    this.pb
      .collection('anotacoes')
      .update(id_anotacao, {
        titulo: titulo,
      })
      .then((data) => {
        console.log('salvo com sucesso', data);
      });
  }

  salvarBlocoTitulo(id_bloco: string, titulo: string) {
    this.pb.collection('blocos').update(id_bloco, {
      titulo: titulo,
    });
  }

  async addUserAnotacao(id_user: string, titulo: string, descricao: string) {
    let bloco = await this.pb
      .collection('blocos')
      .getFullList({ filter: `created_by = '${id_user}' && public = true` });
    let blocoFound = bloco[0];

    console.log('Log bloco get full list: ', bloco);

    if (bloco.length == 0) {
      try {
        console.log(id_user);
        blocoFound = await this.pb.collection('blocos').create({
          titulo: '',
          created_by: id_user,
          public: true,
        });
      } catch (e) {
        console.log('Error: ', e);
      }
    }

    console.log('Log bloco found: ', blocoFound);

    let anotacao = await this.pb.collection('anotacoes').create({
      titulo: titulo,
      descricao: descricao,
      bloco: blocoFound.id,
    });

    return null;
  }

  async addAnotacaoAsync(id_bloco: string, titulo: string, descricao: string) {
    let anotacao = await this.pb.collection('anotacoes').create({
      titulo: titulo,
      descricao: descricao,
      bloco: id_bloco,
    });
    await this.pb.collection('blocos').update(id_bloco, {
      'anotacoes+': anotacao.id,
    });

    return anotacao;
  }

  excluirAnotacao(id_anotacao: string) {
    this.pb.collection('anotacoes').delete(id_anotacao);
  }

  async transferirAnotacao(id_anotacao: string, id_bloco: string) {
    await this.pb.collection('anotacoes').update(id_anotacao, {
      bloco: id_bloco,
    });
  }

  async copiarAnotacao(id_anotacao: string, id_bloco: string) {
    let anotacao = await this.pb.collection('anotacoes').getOne(id_anotacao);
    let copia = await this.addAnotacaoAsync(
      id_bloco,
      anotacao['titulo'],
      anotacao['descricao'],
    );
    const formData = new FormData();

    for (let i = 0; i < anotacao['imagens'].length; i++) {
      let link_image =
        environment.apiUrl +
        '/api/files/anotacoes/' +
        id_anotacao +
        '/' +
        anotacao['imagens'][i];
      console.log('Imagem: ', link_image);
      let res = await fetch(link_image);
      let blob = await res.blob();
      console.log(blob);
      formData.append('imagens', blob);
    }

    this.sharedPocket.addMidia(copia.id, formData, 'anotacoes');
    console.log('formData: ', formData);
  }

  addBloco(titulo: string, public_bloco = false) {
    this.pb.collection('blocos').create({
      titulo: titulo,
      created_by: this.pb.authStore.model!['id'],
      public: public_bloco,
    });
  }

  removerBloco(id_bloco: string) {
    this.pb.collection('blocos').delete(id_bloco);
  }
}
