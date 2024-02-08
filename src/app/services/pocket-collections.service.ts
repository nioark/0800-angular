import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
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
    
    this.pb.collection('Chamado').subscribe('*', (e) => {
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

    this.pb.collection('chamado').getList(1, 50, { filter: `status = '${status}'` }).then((res) => {;
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

  countChamadosWithStatus(status : string): Observable<Number>{
    const chamadoSubject = new Subject<Number>;

    const pb = new PocketBase('http://localhost:8090');

    pb.collection('chamado').getList(1, 50, { filter: `status = '${status}'` }).then((res) => {;
      chamadoSubject.next(res.totalItems);
    }).catch((err) => {
      console.error(err);
    })

    this.chamadosEvent.subscribe((e) => {
        const { action, record } = e;
      // console.log("Ação:", action, "Record:", record)
        pb.collection('chamado').getList(1, 1, { filter: `status = '${status}'` }).then((res) => {;

          chamadoSubject.next(res.totalItems);
        }).catch((err) => {
          console.error(err);
        })
    });

    return chamadoSubject.asObservable();
  }

  getTecnicos(): Observable<RecordModel[]>{
    const chamadoSubject = new Subject<RecordModel[]>;

    let chamados: RecordModel[] = [];

    this.pb.collection('users').getList(1, 50).then((res) => {;
      chamados = res.items;
      console.log("Buscado items:", chamados);

      chamadoSubject.next(chamados);
    })

    this.chamadosEvent.subscribe((e) => {
    })
  
    return chamadoSubject.asObservable();
  }
}
