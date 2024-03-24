import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss'
})
export class PopupComponent {
  @Input({ required: true }) titulo!: string;
  @Input({ required: true }) mensagem!: string;
  @Input({ required: true}) erro_popup!: boolean;

  id : string;

  constructor () {
    this.id = (Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)).replace(/\d/g, '');
    setTimeout(() => {
      this.closePopup()
    }, 3000);
  }

  closePopup(): void {
    const element = document.querySelector('#' + this.id);
    element?.parentElement?.removeChild(element);

  }

}
