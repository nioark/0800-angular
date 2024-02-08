import { Component, ElementRef, ViewChild } from '@angular/core';
import { FrameNavComponent } from '../../../components/frame-nav/frame-nav.component';
import PocketBase from 'pocketbase';

@Component({
  selector: 'app-adicionar',
  standalone: true,
  imports: [FrameNavComponent],
  templateUrl: './adicionar.component.html',
  styleUrl: './adicionar.component.scss'
})
export class AdicionarComponent {
  @ViewChild('cliente') cliente:ElementRef | undefined;
  @ViewChild('descricao') descricao:ElementRef | undefined;

  async createChamado(event : Event) {
    event.preventDefault()
    const cliente = this.cliente?.nativeElement.value
    const descricao = this.cliente?.nativeElement.value

    const pb = new PocketBase('http://127.0.0.1:8090');

    const adminData = await pb.admins.authWithPassword('adm@hardtec.srv.br', 'nany88483240');

    // example create data
    const data = {
        "user": "5kj10axm80tq671",
        "messages": [
            
        ],
        "description": cliente, 
        "title": descricao
    };

    const record = await pb.collection('Chamado').create(data);
  }
}
