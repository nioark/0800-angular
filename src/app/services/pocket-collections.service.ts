import { Injectable, SecurityContext } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, forkJoin, from, map, of, switchMap, tap } from 'rxjs';
import { RecordSubscription, RecordModel } from 'pocketbase'; // Assuming these imports are correct
import PocketBase from 'pocketbase';
import edjsHTML from 'editorjs-html';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../environment';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import cloneDeep from 'lodash.clonedeep';

@Injectable({
  providedIn: 'root'
})
export class PocketCollectionsService {

  pb = new PocketBase(environment.apiUrl);

  private chamadosEvent: Subject<RecordSubscription<RecordModel>>;
  private relatoriosEvent: Subject<RecordSubscription<RecordModel>>;
  private horasEvent: Subject<RecordSubscription<RecordModel>>;

  chamados_em_espera: Number = 0;
  chamados_em_andamento: Number = 0;
  chamados_aguardando: Number = 0;

  public em_espera_event = new Subject<Number>;
  public em_andamento_event = new Subject<Number>;
  public aguardando_event = new Subject<Number>;

  constructor( public domSanitizerSrv: DomSanitizer, private apiSrv : ApiService, private http: HttpClient) {
    this.chamadosEvent = new Subject<RecordSubscription<RecordModel>>();
    this.relatoriosEvent = new Subject<RecordSubscription<RecordModel>>();
    this.horasEvent = new Subject<RecordSubscription<RecordModel>>();

    this.pb.collection('relatorios').subscribe('*', (e) => {
      this.relatoriosEvent.next(e);
    })
    
    this.pb.collection('chamados').subscribe('*', (e) => {
      this.chamadosEvent.next(e);
    })

    this.pb.collection('horas').subscribe('*', (e) => {
      this.horasEvent.next(e);
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


    this.countChamadosWithStatus("aguardando").subscribe(
      (count) => {
        this.chamados_aguardando = count
        this.aguardando_event.next(count)
      }
    )
  }

  getChamadosWithMultipleStatus(status : string[], filterExtra = ""): Observable<RecordModel[]>{
    const chamadoSubject = new Subject<RecordModel[]>;

    filterExtra = "&& " + filterExtra ? filterExtra : "";

    let chamados: RecordModel[] = [];

    let statusFilters = []

    for (let i = 0; i < status.length; i++) {
      statusFilters[i] = `status = '${status[i]}'`;
    }

    this.pb.collection('chamados').getList(1, 50, { filter: `${statusFilters.join(' || ')}` + filterExtra , requestKey: "chamadosstatus", expand:"users, created_by" }).then((res) => {;
      chamados = res.items;
      chamadoSubject.next(chamados);
    })

    this.chamadosEvent.subscribe((e) => {
      const { action, record } = e;
      console.log("Ação:", action, "Record:", record);

      if (action === "create") {
        if (status.includes(record["status"]))
          chamados.push(record);
      } else if (action === "delete") {
        const idToRemove = record.id;
        const indexToRemove = chamados.findIndex(chamado => chamado.id === idToRemove);

        if (indexToRemove !== -1) {
          chamados.splice(indexToRemove, 1);
          // console.log(`Element with id ${idToRemove} removed from the array`);
        }
      } else if (action === "update"){

        if (!status.includes(record["status"])) {
          const idToRemove = record.id;
          const indexToRemove = chamados.findIndex(chamado => chamado.id === idToRemove);
          if (indexToRemove !== -1) {
            chamados.splice(indexToRemove, 1); 
            // console.log(`Element with id ${idToRemove} removed from the array`);
          }
        } else if (status.includes(record["status"])) {
          let findIndex = chamados.findIndex(chamado => chamado.id === record.id);
          let chamadoFound = chamados[findIndex];
          if (findIndex !== -1) {
            record["expand"] = chamadoFound["expand"] //Expand with the old chamado
            chamados[findIndex] = record;

          } else {
            chamados.push(record);
          }
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

  getChamadosWithStatus(status : string, filterExtra = ""): Observable<RecordModel[]>{
    const chamadoSubject = new Subject<RecordModel[]>;

    filterExtra = "&& " + filterExtra ? filterExtra : "";

    let chamados: RecordModel[] = [];

    this.pb.collection('chamados').getList(1, 50, { filter: `status = '${status}'` + filterExtra , requestKey: "chamadosstatus", expand:"users, created_by" }).then((res) => {;
      chamados = res.items;
      // console.log("Buscado items:", chamados);
      chamadoSubject.next(chamados);
    })

    this.chamadosEvent.subscribe((e) => {
      const { action, record } = e;

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
          let findIndex = chamados.findIndex(chamado => chamado.id === record.id);
          let chamadoFound = chamados[findIndex];
          console.log("Chamado achado:", chamadoFound);
          if (findIndex !== -1) {
            record["expand"] = chamadoFound["expand"] //Expand with the old chamado
            chamados[findIndex] = record;
            // record["users"] = chamadoFound["users"] //Expand with the old chamado
            // record["created_by"] = chamadoFound["created_by"] //Expand with the old chamado
          } else {
            chamados.push(record);
          }
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

  //Todo stop getList every event
  countChamadosWithStatus(status : string): Observable<Number>{
    const chamadoSubject = new Subject<Number>;

    const pb = new PocketBase(environment.apiUrl);

    pb.collection('chamados').getList(1, 50, { filter: `status = '${status}'` }).then((res) => {;
      chamadoSubject.next(res.totalItems);
    }).catch((err) => {
      console.error(err);
    })

    this.chamadosEvent.subscribe((e) => {
        const { action, record } = e;
      // console.log("Ação:", action, "Record:", record)
        pb.collection('chamados').getList(1, 1, { filter: `status = '${status}'` , requestKey: "RequestCount"}).then((res) => {;

          chamadoSubject.next(res.totalItems);
        }).catch((err) => {
          console.log("Erro de contagem")
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
        usersExpands.push(cloneDeep(userFound));
      }
    });

    let created_by = this._findUser(users, record['created_by']);

    record.expand = { users: usersExpands, created_by: created_by };
    return record;
  }

  _expandUser(record: RecordModel, users: RecordModel[]): RecordModel {
    const user = this._findUser(users, record['user']);
    record.expand = { user: user };
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

  _removeUserChamados(users: RecordModel[], newChamado: RecordModel): RecordModel[] {
    let updatedAndRemoved = users.map((user: RecordModel) => { 
      user['chamados'] = user['chamados'].map((chamado: RecordModel) => {
        if (chamado.id === newChamado.id) {
          return null;
        }
        return chamado;
      }).filter((chamado: RecordModel | null) => chamado !== null);
      return user;
    });

    return updatedAndRemoved;
  }


  getTecnicosJoinChamados(): Observable<RecordModel[]>{
    const chamadoSubject = new Subject<RecordModel[]>;

    let chamados: RecordModel[] = [];
    let usersWithChamadosR: RecordModel[] = [];

    from(this.pb.collection('users').getFullList()).pipe(
      switchMap(users => {
        const userFilters = users.map(user => `users.id?="${user.id}"`).join('||');
        return from(this.pb.collection('chamados').getFullList({ filter: "(" + userFilters + ")" + " && status != 'finalizado' && status != 'cancelado'", expand: 'users,created_by' })).pipe(
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
        if (record["status"] == "finalizado" || record["status"] == "cancelado") {
          usersWithChamadosR = this._removeUserChamados(usersWithChamadosR, record);

        } else {
          let recordExpanded = this._expandUsers(record, usersWithChamadosR);
          usersWithChamadosR = this._updateUserChamados(usersWithChamadosR, record);
        }
        chamadoSubject.next(usersWithChamadosR);
      }

    })

    return chamadoSubject.asObservable();
  }

  pushTecnicoChamado(id_tecnico : string, chamado : any){
    this.pb.collection('chamados').update(chamado.id, {
      "users+": id_tecnico
    }, {requestKey: "chamadosstatus"})
  }

  customParser(block: { data: any}){
    const component = `<img [src]='${block.data.file.url} | useHttpImgSrc | async'>`
    console.log("component: ", component)
    // console.log("sanitizer: ", this.domSanitizerSrv.sanitize)
    // const sanitized = this.domSanitizerSrv.sanitize(SecurityContext.HTML, component)
    // console.log(sanitized)

    return component;
  }

  getRelatoriosParsed(chamado_id : string): Observable<any[]>{
    const edjsParser = edjsHTML({image: this.customParser});
    let relatorios : any[] = []

    const chamadoSubject = new Subject<any[]>;

    this.pb.collection('relatorios').getFullList({
      filter: `chamado = '${chamado_id}'`, sort: '-created', expand: 'user'
    }).then((item) => {
      item.forEach(relatorio => {
        relatorios.push(relatorio)
      })

      chamadoSubject.next(relatorios);
    }) 

    this.relatoriosEvent.subscribe((e) => {
      const { action, record } = e;
      if (action === "create") {
        console.log("record: ", record)
        if (record["chamado"] == chamado_id){
          this.pb.collection('users').getFullList().then((users) => {
            relatorios.unshift(this._expandUser(record, users))
            chamadoSubject.next(relatorios)
          })
        }
      }
    })

    return chamadoSubject.asObservable();
  }

  addTecnicoToChamado(id_chamado : string, id_tecnico : string){
    this.pb.collection('chamados').update(id_chamado, {
      "users+": id_tecnico
    })
  }

  startUserTimer(chamado_id : string, userId = this.pb.authStore.model!["id"]) : Observable<boolean>{
    if (!this.pb.authStore.isValid)
      return of(false);

    let startedSubject = new Subject<boolean>();

    this.apiSrv.GetTime().subscribe((time) => {
      const data = {
          "start_time": time,
          "user": userId,
          "chamado": chamado_id
      };

      let promise = this.pb.collection('horas').create(data, { requestKey: "startchamado"});
      promise.then((hora) => {
        startedSubject.next(true);
      })

      promise.catch((error) => {
        startedSubject.next(false);
      })
    })

    return startedSubject.asObservable();
  }

  pauseUserTimer(chamado_id : string, userId = this.pb.authStore.model!["id"]) : Observable<boolean>{
    if (!this.pb.authStore.isValid)
      return of(false);

    let pauseSubject = new Subject<boolean>();


    this.apiSrv.GetTime().subscribe((time) => {
      this.pb.collection('horas').getFirstListItem(`chamado.id = '${chamado_id}' && user.id = '${userId}' && end_time = ''`, {requestKey: "pausechamado"}).then((hora) => {;
        let promise = this.pb.collection('horas').update(hora.id, {
          end_time : time
        }, {requestKey: "udpdatehora"})

        promise.then((hora) => {
          pauseSubject.next(true);
        })

        promise.catch((error) => {
          pauseSubject.next(false);
        })
      })
    })

    return pauseSubject.asObservable();
  }

  updateChamadoUsers(chamadoID : string, userIds : string[]){
    //http post to /updateUsersChamado
    const postData = {
      chamadoId: chamadoID,
      userIds: userIds
    };

    this.http.post(environment.apiUrl + '/updateUsersChamado', postData).subscribe((data : any) => {
      console.log("Update chamados data: ",data)
    })
  }

  getChamadoTimers(chamado_id : string) : Observable<any>{
    const timersSubject = new Subject<any[]>;
    
    this.pb.collection('duracao_chamados').getFullList({ filter: `chamado.id = '${chamado_id}'`, expand:"user" }).then((item) => {
      timersSubject.next(item);
    })

    this.horasEvent.subscribe((e) => {
      this.pb.collection('duracao_chamados').getFullList({ filter: `chamado.id = '${chamado_id}'`, expand:"user", requestKey:"GEtchamadostimerskey"}).then((item) => {
        timersSubject.next(item);
      })
    })

    this.pb.collection('chamados').subscribe(chamado_id, (e) => {
      this.pb.collection('duracao_chamados').getFullList({ filter: `chamado.id = '${chamado_id}'`, expand:"user", requestKey:"GEtchamadostimerskey"}).then((item) => {
        timersSubject.next(item);
      })
    })

    console.log("getChamadoTimers")

    return timersSubject.asObservable();
  }

  marcarChamadoFaturado(chamado_id : string){
    this.pb.collection('chamados').update(chamado_id, { 
      "faturado": true
    })
  }

  getUsers() : Observable<RecordModel[]>{
    return from(this.pb.collection('users').getFullList()); 
  }

  getRelatorioSketch(chamado_id : string) : Observable<RecordModel>{
    return from(this.pb.collection('relatorio_sketchs').getFirstListItem(`chamado.id = '${chamado_id}' && user.id = '${this.pb.authStore.model!["id"]}'`));
  }

  saveRelatorioSketch(chamado_id : string, html : string){
    this.getRelatorioSketch(chamado_id).pipe(
      tap((sketch) => {
        console.log("Tried to save")
        this.pb.collection('relatorio_sketchs').update(sketch.id, {
          "sketch": html
        })
      }),
      catchError((error : any) => {
        this.pb.collection('relatorio_sketchs').create({
            "chamado": chamado_id,
            "user": this.pb.authStore.model!["id"],
            "sketch": html
        })
        return of(null)
      })
    ).subscribe()
  }

  apagarSketch(chamado_id : string){
    this.getRelatorioSketch(chamado_id).pipe( 
      tap((sketch) => {
        this.pb.collection('relatorio_sketchs').delete(sketch.id)
      })
    ).subscribe()
  }
}
