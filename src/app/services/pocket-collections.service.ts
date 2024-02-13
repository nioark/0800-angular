import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, forkJoin, from, map, switchMap } from 'rxjs';
import { RecordSubscription, RecordModel } from 'pocketbase'; // Assuming these imports are correct
import PocketBase from 'pocketbase';
import edjsHTML from 'editorjs-html';

@Injectable({
  providedIn: 'root'
})
export class PocketCollectionsService {

  pb = new PocketBase('http://localhost:8090');

  private chamadosEvent: Subject<RecordSubscription<RecordModel>>;
  private relatoriosEvent: Subject<RecordSubscription<RecordModel>>;

  chamados_em_espera: Number = 0;
  chamados_em_andamento: Number = 0;

  public em_espera_event = new Subject<Number>;
  public em_andamento_event = new Subject<Number>;

  constructor() {
    console.log("Subscribed")
    this.chamadosEvent = new Subject<RecordSubscription<RecordModel>>();
    this.relatoriosEvent = new Subject<RecordSubscription<RecordModel>>();

    this.pb.collection('relatorios').subscribe('*', (e) => {
      this.relatoriosEvent.next(e);
    })
    
    this.pb.collection('chamados').subscribe('*', (e) => {
      this.chamadosEvent.next(e);
    })

    this.countChamadosWithStatus("em_espera").subscribe(
      (count) => {
        this.chamados_em_espera = count
        this.em_espera_event.next(count)
      }
    )

    this.countChamadosWithStatus("em_andamento").subscribe(
      (count) => {
        this.chamados_em_andamento = count
        this.em_andamento_event.next(count)
      }
    )
  }

  getChamadosWithStatus(status : string): Observable<RecordModel[]>{
    const chamadoSubject = new Subject<RecordModel[]>;

    let chamados: RecordModel[] = [];

    this.pb.collection('chamados').getList(1, 50, { filter: `status = '${status}'`, requestKey: "chamadosstatus" }).then((res) => {;
      chamados = res.items;
      // console.log("Buscado items:", chamados);
      chamadoSubject.next(chamados);
    })

    this.chamadosEvent.subscribe((e) => {
      const { action, record } = e;
      // console.log("Ação:", action, "Record:", record);

      if (action === "create") {
        if (record["status"] == status)
          chamados.push(record);
      } else if (action === "delete") {
        const idToRemove = record.id;
        const indexToRemove = chamados.findIndex(chamado => chamado.id === idToRemove);

        if (indexToRemove !== -1) {
          chamados.splice(indexToRemove, 1);
          // console.log(`Element with id ${idToRemove} removed from the array`);
        }
      } else if (action === "update"){

        if (record["status"] != status) {
          const idToRemove = record.id;
          const indexToRemove = chamados.findIndex(chamado => chamado.id === idToRemove);
          if (indexToRemove !== -1) {
            chamados.splice(indexToRemove, 1); 
            // console.log(`Element with id ${idToRemove} removed from the array`);
          } 
        } else if (record["status"] == status) {
          chamados.push(record);
        }
        else {
          const idToUpdate = record.id;
          const indexToUpdate = chamados.findIndex(chamado => chamado.id === idToUpdate);
          chamados[indexToUpdate] = record;
        }
      }
      chamadoSubject.next(chamados);
    });

    return chamadoSubject.asObservable();
  }

  getChamadosEmpty(): Observable<RecordModel[]>{
    const chamadoSubject = new Subject<RecordModel[]>; 

    let chamados: RecordModel[] = [];

    this.pb.collection('chamados').getFullList({filter: "users:length = 0"}).then((chamados) => {
      chamadoSubject.next(chamados);
    })


    return chamadoSubject.asObservable();
  }

  countChamadosWithStatus(status : string): Observable<Number>{
    const chamadoSubject = new Subject<Number>;

    const pb = new PocketBase('http://localhost:8090');

    pb.collection('chamados').getList(1, 50, { filter: `status = '${status}'` }).then((res) => {;
      chamadoSubject.next(res.totalItems);
    }).catch((err) => {
      console.error(err);
    })

    this.chamadosEvent.subscribe((e) => {
        const { action, record } = e;
      // console.log("Ação:", action, "Record:", record)
        pb.collection('chamados').getList(1, 1, { filter: `status = '${status}'` }).then((res) => {;

          chamadoSubject.next(res.totalItems);
        }).catch((err) => {
          console.error(err);
        })
    });

    return chamadoSubject.asObservable();
  }


  _findUser(users: RecordModel[], userId: string): RecordModel | undefined {
    return users.find((user: RecordModel) => user.id === userId);
  }

  _expandUsers(record: RecordModel, users: RecordModel[]): RecordModel {
    let usersExpands: RecordModel[] = [];
    record['users'].forEach((userId: string) => {
      let userFound = this._findUser(users, userId);
      if (userFound) {
        usersExpands.push(userFound);
      }
    });

    record.expand = { users: usersExpands };
    return record;
  }

  _updateUserChamados(users: RecordModel[], newChamado: RecordModel): RecordModel[] {
    let updatedAndRemoved = users.map((user: RecordModel) => {
      user['chamados'] = user['chamados'].map((chamado: RecordModel) => {
        if (chamado.id === newChamado.id) {
          if (!newChamado['users'].includes(user.id)) {
            return null;
          }
          return newChamado;
        }
        return chamado;
      }).filter((chamado: RecordModel | null) => chamado !== null);
      return user;
    });

    //Add missing chamados
    updatedAndRemoved.forEach((user: RecordModel) => {
      if (newChamado['users'].includes(user.id)) {
        if (!user['chamados'].includes(newChamado)) {
          user['chamados'].push(newChamado);
        }
      }
    })
    return updatedAndRemoved;
  }


  getTecnicosJoinChamados(): Observable<RecordModel[]>{
    const chamadoSubject = new Subject<RecordModel[]>;

    let chamados: RecordModel[] = [];
    let usersWithChamadosR: RecordModel[] = [];

    from(this.pb.collection('users').getFullList()).pipe(
      switchMap(users => {
        const userFilters = users.map(user => `users.id?="${user.id}"`).join('||');
        return from(this.pb.collection('chamados').getFullList({ filter: userFilters, expand: 'users' })).pipe(
          map((chamados : RecordModel[]) => ({ users, chamados }))
        );
      })
    ).subscribe({
      next: ({ users, chamados }) => {
        // Initialize the list for tecnicos
        const usersWithChamados = users.map((user: RecordModel) => {
          user['chamados'] = [];
          return user;
        });

        chamados.forEach((chamado : RecordModel) => {
          chamado['users'].forEach((userID: any) => {
            const userFound = usersWithChamados.find((user : RecordModel) => user.id === userID);
            if (userFound) {
              userFound['chamados'].push(chamado);
            }
          });
        });

        usersWithChamadosR = usersWithChamados;
        chamadoSubject.next(usersWithChamados);
        // Your further processing here...
      },
      error: error => {
        console.error("Error fetching users and chamados:", error);
      }
    });

    this.chamadosEvent.subscribe((e) => {
      const { action, record } = e;
      if (action === "update" || action === "create") {
        let recordExpanded = this._expandUsers(record, usersWithChamadosR);
        usersWithChamadosR = this._updateUserChamados(usersWithChamadosR, record);
        chamadoSubject.next(usersWithChamadosR);
      }

    })

    return chamadoSubject.asObservable();
  }

  pushTecnicoChamado(id_tecnico : string, chamado : any){

    console.log("id_tecnico:", id_tecnico, "id_chamado:", chamado.id);''

    this.pb.collection('chamados').update(chamado.id, {
      "users+": id_tecnico
    })
  }

  _parse(relatorio : any, edjsPrser : edjsHTML) : {relatorio: string, date: Date} {

     const parse = edjsPrser.parseStrict(relatorio['relatorio'])

     if (parse instanceof Error) {
        console.log(parse)
      }else {
        return {relatorio: parse.join(''), date: new Date(relatorio['created'])}
      }

      return {relatorio: "", date: new Date()}
  }

  getRelatoriosParsed(chamado_id : string): Observable<any[]>{
    const edjsParser = edjsHTML();
    let relatorios : any[] = []

    const chamadoSubject = new Subject<any[]>;

    this.pb.collection('relatorios').getFullList({
      filter: `chamado = '${chamado_id}'`, sort: '-created', expand: 'user'
    }).then((item) => {
      console.log(item)
      item.forEach(relatorio => {
        relatorios.push(this._parse(relatorio, edjsParser))
      })
      console.log(relatorios)

      chamadoSubject.next(relatorios);
    }) 

    this.relatoriosEvent.subscribe((e) => {
      const { action, record } = e;
      if (action === "create") {
        relatorios.unshift(this._parse(record, edjsParser)); 
        chamadoSubject.next(relatorios);
      }
    })

    return chamadoSubject.asObservable();
  }
}
