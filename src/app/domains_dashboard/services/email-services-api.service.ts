import { ServerData } from '../models/apiserver';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApiServer,
  ApiServerBackend,
  convertToBytes,
  formatBytes,
} from '../models/apiserver';
import { map } from 'rxjs';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class EmailServicesApiService {
  constructor(private http: HttpClient) {}

  makeData(domain: ApiServerBackend): ServerData {
    let maxStorageBytes = domain.disk_limit_bytes;
    let usedStorageBytes = domain.disk_used_bytes;
    let remainingStorageBytes = maxStorageBytes - usedStorageBytes;

    let usedStoragePercentage = Number(
      ((usedStorageBytes / maxStorageBytes) * 100).toFixed(2),
    );
    let maxStorage = domain.disk_limit_human;

    let usedStorage = domain.disk_used_human;
    let remainingStorage = formatBytes(remainingStorageBytes);

    let maxUsers = domain.max_pop;
    let usedUsers = domain.used_emails;
    let remainingUsers = maxUsers - usedUsers;
    let usedUserPercentage = Number(((usedUsers / maxUsers) * 100).toFixed(2));
    usedStoragePercentage = Math.min(Math.max(usedStoragePercentage, 0), 100);
    usedUserPercentage = Math.min(Math.max(usedUserPercentage, 0), 100);

    if (domain.price == null || domain.price == undefined) {
      domain.price = 0;
    }

    let finalData: ServerData = {
      domain: domain.name,
      maxStorage: maxStorage,
      maxStorageBytes: maxStorageBytes,
      usedStorageBytes: usedStorageBytes,
      usedStorage: usedStorage,
      remainingStorage: remainingStorage,
      maxUsers: domain.max_pop,
      usedUsers: usedUsers,
      remainingUsers: remainingUsers,
      usedStoragePercentage: usedStoragePercentage,
      usedUsersPercentage: usedUserPercentage,
      pacote: domain.plan,
      ip: domain.ip,
      dns: domain.dns,
      serviceId: domain.service_id,
      serverId: domain.server_id,
      unlimitedStorage: true ? maxStorageBytes == 0 : false,
      unlimitedUsers: true ? domain.max_pop == 0 : false,
      serverType: domain.panel_type,
      uuid: `${domain.service_id}${domain.server_id}`,
      suspended: domain.suspended,
      contratoID: domain.contrato_id,
      contrato: domain.Contrato,
      price: domain.price,
    };

    return finalData;
  }

  get(serverId: number, serviceId: number): Observable<ServerData> {
    return this.http
      .get<any>(
        environment.apiUrlDomains + '/servidores/' + serverId + '/' + serviceId,
      )
      .pipe(
        map((domain: ApiServerBackend) => {
          return this.makeData(domain);
        }),
      );
  }
  fetch(): Observable<ServerData[]> {
    return this.http.get<any>(environment.apiUrlDomains + '/servidores').pipe(
      map((data) => {
        let finalData: ServerData[] = [];

        data.forEach((domain: ApiServerBackend) => {
          finalData.push(this.makeData(domain));
        });

        return finalData;
      }),
    );
  }

  // fetchapi() : Observable<ServerData[]> {
  //   // TODO !! Encriptar token
  //   return this.http.get<any>('https://server1.ht.inf.br:2087/cpsess5839238065/json-api/listaccts?api.version=2', {
  //     headers: new HttpHeaders({
  //       'Authorization': 'whm root:J6PSG9M9XV23AGRAH0NCSPDLBW83SQMN'
  //     })
  //   }).pipe(
  //     map((data) => {
  //       let finalData : ServerData[] = [];

  //       data.data.acct.forEach((domain : ApiServer) => {
  //         let maxStorageBytes = convertToBytes(domain.disklimit);
  //         let usedStorageBytes = convertToBytes(domain.diskused);
  //         let remainingStorageBytes = maxStorageBytes - usedStorageBytes;

  //         let usedStoragePercentage = Number(((usedStorageBytes / maxStorageBytes) * 100).toFixed(2));
  //         let maxStorage = formatBytes(maxStorageBytes);
  //         let usedStorage = formatBytes(usedStorageBytes);
  //         let remainingStorage = formatBytes(remainingStorageBytes);

  //         finalData.push({
  //           domain: domain.domain,
  //           maxStorage: maxStorage,
  //           usedStorage: usedStorage,
  //           remainingStorage: remainingStorage,
  //           maxUsers: domain.maxpop,
  //           usedUsers: 0,
  //           remainingUsers: domain.maxpop - 0,
  //           usedStoragePercentage: usedStoragePercentage,
  //           usedUsersPercentage: 0,
  //           pacote: domain.plan,
  //           ip: domain.ip,
  //           id: domain.uid,
  //           serverId: 0,
  //           unlimitedStorage: true ? maxStorageBytes == Number.MAX_VALUE : false
  //         })
  //       })

  //       console.log(finalData)
  //       return finalData;
  //     }
  //   ));
  // }
}
