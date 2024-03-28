import { Component } from '@angular/core';
import { MatDialogClose } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-terminar',
  standalone: true,
  imports: [MatDialogClose],
  templateUrl: './confirm-terminar.component.html',
  styleUrl: './confirm-terminar.component.scss',
})
export class ConfirmTerminarComponent {}
