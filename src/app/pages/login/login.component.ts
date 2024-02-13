import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, of, pipe, tap } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  @ViewChild('email') email :ElementRef | undefined;
  @ViewChild('password') password :ElementRef | undefined;
  @ViewChild('remember') remember :HTMLInputElement | undefined;


  constructor(private authSrv : AuthService, public router : Router) {


  }

  ngOnInit(): void {
    const pb = this.authSrv.GetPocketBase()
    if (pb.authStore.isValid) {
      this.router.navigate(['/'])
    }
 
  }

  navigate() {
    this.router.navigate(['/home']) 
  }

  formSubmit(event : Event) {
    // event.stopPropagation();
    event.preventDefault();

    this.login()
  }

  login() {
    const email = this.email?.nativeElement.value;
    const password = this.password?.nativeElement.value;
    const vl = this.remember as any
    const remember = vl.nativeElement.checked;

    this.authSrv.Login(email, password).pipe(
      tap((res) => {;
        this.router.navigateByUrl('/home')
      }), catchError(error => {
        
        return of(console.log("Erro ao logar", error));
      })
    ).subscribe()
  }

}
