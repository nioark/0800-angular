import { Component } from '@angular/core';

@Component({
  selector: 'app-linksmenu',
  standalone: true,
  imports: [],
  templateUrl: './linksmenu.component.html',
  styleUrl: './linksmenu.component.scss'
})
export class LinksmenuComponent {


  display_announcement: boolean;
  constructor() {
    this.display_announcement = localStorage.getItem('display_announcement') == 'true'
  }
}
