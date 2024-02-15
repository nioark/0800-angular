// import {HttpInterceptorFn } from '@angular/common/http';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {

//   console.log(req)
//   const pocketbase_auth = localStorage.getItem('pocketbase_auth');

//   if (!pocketbase_auth) {
//     location.href = '/login';
//     return next(req);
//   }

//   const parsed = JSON.parse(pocketbase_auth);
//   console.log(parsed, "Added token")

//   req.headers.set('Authorization', parsed['token']);

//   return next(req);
// };

import {HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {
    console.log('AuthInterceptor created');
  }

  intercept(request: HttpRequest<any>,next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Outgoing HTTP request', request);

    const pocketbase_auth = localStorage.getItem('pocketbase_auth');

    if (!pocketbase_auth) {
      location.href = '/login';
      return next.handle(request);
    }

    const parsed = JSON.parse(pocketbase_auth);
    console.log(parsed, "Added token")

    if (!request.headers.has('Authorization')) {
      const requestAuthed = request.clone({
        setHeaders: {
          Authorization: parsed['token'],
        },
      })
      console.log("Authed request: ", requestAuthed)
      return next.handle(requestAuthed);
    }
    // Modify the request object
    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        console.log('Incoming HTTP response', event);
      })
    );
  }
}