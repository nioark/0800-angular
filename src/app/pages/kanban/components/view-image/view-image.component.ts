import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-view-image',
  standalone: true,
  imports: [],
  templateUrl: './view-image.component.html',
  styleUrl: './view-image.component.scss'
})
export class ViewImageComponent {
  url = ""

  constructor (@Inject(MAT_DIALOG_DATA) public data: any){
    this.url = data
  } 

}
