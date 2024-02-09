import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, forkJoin, from, switchMap } from 'rxjs';
import { RecordSubscription, RecordModel } from 'pocketbase'; // Assuming these imports are correct
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class PocketCollectionsService {

  pb = new PocketBase('http://localhost:8090');

  private chamadosEvent: Subject<RecordSubscription<RecordModel>>;

  chamados_em_espera: Number = 0;
  chamados_em_andamento: Number = 0;

  public em_espera_event = new Subject<Number>;
  public em_andamento_event = new Subject<Number>;

  constructor() { 
    console.log("Subscribed")
    this.chamadosEvent = new Subject<RecordSubscription<RecordModel>>();
    
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

    this.pb.collection('chamados').getList(1, 50, { filter: `status = '${status}'` }).then((res) => {;
      chamados = res.items;
      // console.log("Buscado items:", chamados);

      chamadoSubject.next(chamados);
    })

    this.chamadosEvent.subscribe((e) => {
      const { action, record } = e;
      // console.log("Ação:", action, "Record:", record);

      if (action === "create") {
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

  getTecnicosJoinChamados(): Observable<RecordModel[]>{
    const chamadoSubject = new Subject<RecordModel[]>;

    let chamados: RecordModel[] = [];

    //old rule @request.auth.chamados.id ?= @request.data.id
    /*.pipe(
        switchMap((users : RecordModel[]) => {
          const userFilters = users.map(user => `users.id="${user.id}"`).join('||');
          return this.pb.collection('chamados').getFullList({ filter: userFilters });
        })
      )
    */

    this.pb.collection('users').getFullList().then(users => {
      from(this.pb.collection('chamados').getFullList({requestKey: 'chamados'})).pipe(
        switchMap((chamados : RecordModel[]) => {
          const userFilters = users.map(user => `users.id="${user.id}"`).join('||');
          return this.pb.collection('chamados').getFullList({ filter: userFilters });
        })
      ).subscribe({
        next: chamados => {
          users.map(user => {
            user["chamados"] = []
            return user
          })

          chamados.forEach(chamado => {
            chamado['users'].forEach((userID : any) => {
              let userFound = users.find(user => user.id == userID)
              if (userFound) {
                userFound["chamados"].push(chamado)
              }
            })
          })

          chamadoSubject.next(users);

          // Your further processing here...
        },
        error: error => {
          console.error("Error fetching users and chamados:", error);
        }
      });
    });


    this.chamadosEvent.subscribe((e) => {
    })
  
    return chamadoSubject.asObservable();
  }

  pushTenicoChamado(id_tecnico : string, chamado : any){

    console.log("id_tecnico:", id_tecnico, "id_chamado:", chamado.id);''

    this.pb.collection('chamados').update(chamado.id, {
      "status": "em_andamento"
    }).then(() => {
      this.pb.collection('users').update(id_tecnico, {
        "chamados+": chamado.id,
      })
    })
  }
}
