import { Injectable } from '@angular/core';
import { Observable, Subject, from, map, of } from 'rxjs';
import PocketBase from 'pocketbase';
import { Router } from '@angular/router';
import { environment } from '../environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  pb : PocketBase

  constructor(public routerSrv : Router) { 
    this.pb = new PocketBase(environment.apiUrl);
    if (this.pb.authStore.isValid) {
      this.pb.collection("users").authRefresh({}, {
        
      })
    }
  }

  async _loginAsync (email : string, password : string): Promise<PocketBase | null> {
    try {
      const userAuth = await this.pb.collection('users').authWithPassword(email, password, {}, {
        expand : 'cargo',
      });

      await this.pb.collection("users").authRefresh({}, {
          expand: "cargo" // replace with your relation field name
      })
    } catch (error) {
      return null
    }


    return this.pb
  }

  IsAdmin() : boolean {
    return this.pb.authStore.model!['isAdmin'];
  }

  GetPocketBase(): PocketBase {
    const pb = new PocketBase(environment.apiUrl)

    if (!pb.authStore.isValid && !pb.authStore.model) {
      this.routerSrv.navigate(['/login'])
    }

    return pb
  }

  Login(email : string, password : string): Observable<boolean> {
    return from(this._loginAsync(email, password)).pipe(
      map((pb) => {
        if (pb != null) {
          return true;
        }
        return false;
      })
    );
  }

  Logout() {
    this.pb.authStore.clear();
    this.routerSrv.navigate(['/login'])  
  }
}
