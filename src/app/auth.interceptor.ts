import {HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  console.log(req)
  const pocketbase_auth = localStorage.getItem('pocketbase_auth');

  if (!pocketbase_auth) {
    location.href = '/login';
    return next(req);
  }

  const parsed = JSON.parse(pocketbase_auth);
  console.log(parsed, "Added token")

  req.headers.set('Authorization', parsed['token']);

  return next(req);
};
