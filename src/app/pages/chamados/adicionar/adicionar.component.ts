import { Component, ElementRef, ViewChild } from '@angular/core';
import { FrameNavComponent } from '../../../components/frame-nav/frame-nav.component';
import PocketBase from 'pocketbase';
import Client from 'pocketbase';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-adicionar',
  standalone: true,
  imports: [FrameNavComponent],
  templateUrl: './adicionar.component.html',
  styleUrl: './adicionar.component.scss'
})
export class AdicionarComponent {
  @ViewChild('cliente') cliente :ElementRef | undefined;
  @ViewChild('descricao') descricao :ElementRef | undefined;
  @ViewChild('inputBox') deixar_aberto :HTMLInputElement | undefined;

  constructor(public authSrv : AuthService){
    
  }

  async createChamado(event : Event) {
    event.preventDefault()
    const cliente = this.cliente?.nativeElement.value
    const descricao = this.descricao?.nativeElement.value
    const vl = this.deixar_aberto as any
    const deixar_aberto = vl.nativeElement.checked

    const pb = this.authSrv.GetPocketBase()

    if (!pb.authStore.isValid && !pb.authStore.model) 
      return
    
    console.log(pb.authStore.model)
    // example create data
    const data = {
        "users": [ pb.authStore.model?.["id"]],
        "messages": [],
        "description": "", 
        "title": descricao,
        "cliente": cliente,
        "status" : deixar_aberto ? "em_espera" : "em_andamento",
    };

    console.log(deixar_aberto)
    console.log("Data model: ", data)

    const record = await pb.collection('chamados').create(data);
    console.log(record)
  }
}
