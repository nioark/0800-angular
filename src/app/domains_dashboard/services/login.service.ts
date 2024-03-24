import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  static logout() {
    throw new Error('Method not implemented.');
  }
  constructor(private http: HttpClient) {}

  validateToken(token: string): Observable<any> {
    const formData = new FormData();
    formData.append('token', token);
    return this.http.post<boolean>(
      `${environment.apiUrlDomains}/validate-token`,
      formData,
    );
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLogged(): boolean {
    if (localStorage.getItem('token')) {
      return true;
    }
    return false;
  }
}
