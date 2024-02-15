import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = '0800 Sac';

  constructor(http : HttpClient) {
    // console.log("Request")
    // http.get<any>(`http://localhost:8090/images/test.png`) .subscribe(
    //   (data) => {
    //     console.log(data) 
    //   }
    // )
  }

  ngOnInit(): void {
    initFlowbite();
  }

}
