import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import PocketBase from 'pocketbase';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  pb : PocketBase | undefined

  constructor(public routerSrv : Router) { }

  async _loginAsync (email : string, password : string): Promise<PocketBase> {
    const pb = new PocketBase('http://127.0.0.1:8090'); 
    const userAuth = await pb.collection('users').authWithPassword(email, password);
    this.pb = pb
    return pb
  }

  GetPocketBase(): PocketBase {
    const pb = new PocketBase('http://127.0.0.1:8090')

    if (!pb.authStore.isValid && !pb.authStore.model) {
      this.routerSrv.navigate(['/login'])
    }

    return pb
  }

  Login(email : string, password : string): Observable<PocketBase> {
    return from(this._loginAsync(email, password));
  }
}
