import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { HttpClient } from '@angular/common/http';
import { MousesComponent } from "./shared/mouses/mouses.component";


@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [CommonModule, RouterOutlet, MousesComponent]
})
export class AppComponent {
  title = '0800 Sac';

  constructor() {
  }

  ngOnInit(): void {
    initFlowbite();
  }

}
