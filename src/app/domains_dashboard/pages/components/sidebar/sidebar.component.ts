import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../../services/login.service';
import { SettingsComponent } from '../../settings/settings.component';
import { CommonModule } from '@angular/common';
import { FrameNavComponent } from '../../../../components/frame-nav/frame-nav.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FrameNavComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  display_announcement: boolean;

  constructor(
    private router: Router,
    private loginSrv: LoginService,
  ) {
    let val = localStorage.getItem('display_announcement') as string;
    this.display_announcement = /true/i.test(val);
  }

  gotoPath(path: string) {
    this.router.navigate(['/dominios/' + path]);
  }

  logout() {
    this.loginSrv.logout();
    this.gotoPath('login');
  }
}
