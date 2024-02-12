import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';

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

  async login(event : Event) {
    event.preventDefault();
    event.stopPropagation();
    console.log(event)
    const email = this.email?.nativeElement.value;
    const password = this.password?.nativeElement.value;
    const vl = this.remember as any
    const remember = vl.nativeElement.checked;

    try {
      await this.authSrv.Login("jeferson@hardtec.srv.br", "ampdtbaf");
      this.navigate()
      console.log("Logado com sucesso")
    } catch (error) {
      console.log(error)
    }

  }
}
