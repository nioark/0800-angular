import { Component } from '@angular/core';
import { AddChamadoComponent } from '../../../chamados/adicionar/component/add-chamado/add-chamado.component';

@Component({
  selector: 'app-add-form',
  standalone: true,
  imports: [AddChamadoComponent],
  templateUrl: './add-form.component.html',
  styleUrl: './add-form.component.scss'
})
export class AddFormComponent {

}
