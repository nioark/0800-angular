import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../../../../../services/auth.service';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-add-chamado',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, MatTooltipModule],
  templateUrl: './add-chamado.component.html',
  styleUrl: './add-chamado.component.scss'
})
export class AddChamadoComponent {
  @ViewChild('cliente') cliente :ElementRef | undefined;
  @ViewChild('sobre') sobre :ElementRef | undefined;
  @ViewChild('descricao') descricao :ElementRef | undefined;
  @ViewChild('inputBox') deixar_aberto :HTMLInputElement | undefined;
  @ViewChild('inputBox2') deixar_publico :HTMLInputElement | undefined;

  checkbox1Checked: boolean = false;

  selected = 0;

  constructor(public authSrv : AuthService){}
  
  async createChamado(event : Event) {
    event.preventDefault()
    const cliente = this.cliente?.nativeElement.value
    const descricao = this.descricao?.nativeElement.value
    const sobre = this.sobre?.nativeElement.value
    const vl = this.deixar_aberto as any
    const deixar_aberto = vl.nativeElement.checked
    const vl2 = this.deixar_publico as any
    const deixar_publico = vl2.nativeElement.checked

    const pb = this.authSrv.GetPocketBase()

    if (!pb.authStore.isValid && !pb.authStore.model) 
      return
    
    console.log(pb.authStore.model)
    // example create data
    const data = {
        "users": deixar_aberto ? [] : [pb.authStore.model?.["id"]],
        "messages": [],
        "description": descricao, 
        "title": sobre,
        "cliente": cliente,
        "priority": this.selected,
        "public": deixar_publico,
        "created_by": pb.authStore.model?.["id"]
    };

    console.log(deixar_aberto)
    console.log("Data model: ", data)

    const record = await pb.collection('chamados').create(data);
    console.log(record)
  }
}
