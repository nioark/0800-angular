import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-frame-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './frame-nav.component.html',
  styleUrl: './frame-nav.component.scss'
})
export class FrameNavComponent {
  constructor(public router: Router){}

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}
