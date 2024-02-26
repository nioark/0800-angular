import { Component, OnInit } from '@angular/core';
import { FrameNavComponent } from '../../components/frame-nav/frame-nav.component';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { UserSettingsComponent } from '../../components/frame-nav/user-settings/user-settings.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [FrameNavComponent],
})
export class HomeComponent implements OnInit {

  constructor(private router: Router, private dialog : Dialog) { }

  ngOnInit() {
  }


  navigate(path: string): void {
    this.router.navigate([path]);
  }

  openConfigs(): void {
    this.dialog.open(UserSettingsComponent);
  }

}
