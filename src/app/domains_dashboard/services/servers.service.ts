import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Server } from '../models/server';

function getRandomFloatInRange(min: number, max: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

@Injectable({
  providedIn: 'root',
})
export class ServersService {
  constructor(private http: HttpClient) {}

  get(id: number): Observable<Server> {
    return this.fetch().pipe(map((servers) => servers[id]));
  }

  fetch(): Observable<Server[]> {
    return this.http
      .get('assets/Servidores_Email2.csv', { responseType: 'text' })
      .pipe(
        map((data) => {
          let finalData = [];
          let csvToRowArray = data.split('\n');
          for (let index = 1; index < csvToRowArray.length - 1; index++) {
            let row = csvToRowArray[index].split('&');
            let storageCapacity = row[4];
            let storageCapacityNumber = parseFloat(
              row[4].split(' ')[0].replace(',', '.')
            );
            let storageCapacityType = row[4].split(' ')[1];
            let usedStorageCapacity = getRandomFloatInRange(
              0,
              storageCapacityNumber
            );
            let usedStorageCapacityString =
              usedStorageCapacity + ' ' + storageCapacityType;
            let usedStorageCapacityPercentage = Number(
              ((usedStorageCapacity / storageCapacityNumber) * 100).toFixed(2)
            );

            let nowAccounts = parseInt(row[3].split('/')[0]);
            let maxAccounts = parseInt(row[3].split('/')[1]);
            let accountPercentage = Number(
              ((nowAccounts / maxAccounts) * 100).toFixed(2)
            );

            const server: Server = {
              id: index - 1,
              domainName: row[0],
              webDomainName: row[1],
              emailDomainName: row[2],
              accounts: row[3].split('/').join(' / '),
              usedAccounts: nowAccounts,
              totalAccounts: maxAccounts,
              accountPercentage: accountPercentage,
              usedStorageCapacityNumber: Number(usedStorageCapacity.toFixed(0)),
              storageCapacityNumber: storageCapacityNumber,
              remainingStorageCapacity: Number(
                (storageCapacityNumber - usedStorageCapacity).toFixed(0)
              ),
              storageCapacityType: storageCapacityType,
              storageCapacity: storageCapacity,
              usedStorageCapacity: usedStorageCapacityString,
              usedStorageCapacityPercentage: usedStorageCapacityPercentage,
              value: row[5],
              packageValue: row[6],
              packageId: 1,
            };

            finalData.push(server);
          }

          return finalData;
        })
      );
  }
}
