import { Injectable } from '@angular/core';
import PocketBase, { RecordModel } from 'pocketbase';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root',
})
export class PocketSharedService {
  pb = new PocketBase(environment.apiUrl);

  constructor() {}

  addMidia(id_anotacao: string, image: FormData, collection_name: string) {
    this.pb
      .collection(collection_name)
      .update(id_anotacao, image)
      .then((data) => {
        console.log(data);
      });
  }

  removeMidia(
    id_anotacao: string,
    image_name: string,
    collection_name: string,
  ) {
    this.pb.collection(collection_name).update(id_anotacao, {
      'midias-': image_name,
    });
  }
}
