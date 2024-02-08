import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { from } from 'rxjs';
import PocketBase from 'pocketbase';
import { AuthService } from './services/auth.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = '0800 Sac';

  constructor(authSrv : AuthService) {
     authSrv.Login('jeferson@hardtec.srv.br', 'ampdtbaf').subscribe();
  }

  ngOnInit(): void {
    initFlowbite();
  }

}
