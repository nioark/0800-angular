import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
})
export class TabsComponent {
  currentTab = this.router.url.split('/')[2];
  isAdmin: boolean = localStorage.getItem('isAdmin') == 'true';

  constructor(private router: Router) {}

  gotoPath(path: string) {
    // window.history.replaceState({}, '', path);
    this.router.navigate(['/dominios/' + path]);
  }
}
