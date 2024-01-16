import { Component, OnInit } from '@angular/core';
import { FrameNavComponent } from '../../components/frame-nav/frame-nav.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [FrameNavComponent],
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }


  navigate(path: string): void {
    this.router.navigate([path]);
  }

}
