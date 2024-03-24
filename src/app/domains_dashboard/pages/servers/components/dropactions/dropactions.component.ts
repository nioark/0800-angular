import { Component } from '@angular/core';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-dropactions',
  standalone: true,
  imports: [],
  templateUrl: './dropactions.component.html',
  styleUrl: './dropactions.component.scss'
})
export class DropactionsComponent {
  ngOnInit() {
    initFlowbite();
  }
}
