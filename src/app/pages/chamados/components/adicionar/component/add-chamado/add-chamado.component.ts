import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../../../../../services/auth.service';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { ApiService } from '../../../../../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { SelectClientsComponent } from '../select-clients/select-clients.component';
import { PocketCollectionsService } from '../../../../../../services/pocket-collections.service';
import { ViewImageComponent } from '../../../../../kanban/components/view-image/view-image.component';

@Component({
  selector: 'app-add-chamado',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, MatTooltipModule, MatAutocompleteModule],
  templateUrl: './add-chamado.component.html',
  styleUrl: './add-chamado.component.scss'
})
export class AddChamadoComponent {
  @ViewChild('sobre') sobre :ElementRef | undefined;
  @ViewChild('descricao') descricao :ElementRef | undefined;
  deixar_aberto: boolean = false;
  deixar_publico: boolean = true;
  iniciar_timer: boolean = false;

  selected = 0;

  cliente : any | undefined

  pessoas: any[] = [
    
  ]

  imageFormData : FormData = new FormData()
  images : any[] = []

  error : string = ""

  constructor(public authSrv : AuthService, api : ApiService, private matDialog: MatDialog, private pocketSrv : PocketCollectionsService) {
    api.FetchPessoas().subscribe((pessoas) => {
      this.pessoas = pessoas
    })
  }

  selectCliente() {
    this.matDialog.open(SelectClientsComponent).afterClosed().subscribe(cliente => { 
      cliente!.email = cliente.email.trim()
      cliente!.celular = cliente.celular.trim()
      cliente!.telefone = cliente.telefone.trim()
      console.log("Cliente selecionado: ", cliente)

      this.cliente = cliente
    })
  }

  setImage(event : Event) {
    let target = event.target as HTMLInputElement

    let files = target.files as FileList

    let file = files[0]

    this.images.push(URL.createObjectURL(file))

    this.imageFormData.append('imagem', file)
  }

  openImage(url : string){
    this.matDialog.open(ViewImageComponent, {data: url});
  }
  
  async createChamado(event : Event) {
    event.preventDefault()
    const cliente = this.cliente?.nome
    const descricao = this.descricao?.nativeElement.value
    const sobre = this.sobre?.nativeElement.value

    if (cliente == undefined){
      this.error = "É necessário selecionar um cliente"
      return
    }

    if (sobre == ""){
      this.error = "É necessário adicionar um sobre para o chamado"
      return
    }

    const pb = this.authSrv.GetPocketBase()

    if (!pb.authStore.isValid && !pb.authStore.model) 
      return
    
    console.log(pb.authStore.model)
    // example create data
    const data = {
        "users": this.deixar_aberto ? [] : [pb.authStore.model?.["id"]],
        "messages": [],
        "description": descricao, 
        "title": sobre,
        "cliente": cliente,
        "cliente_data": JSON.stringify(this.cliente),
        "priority": this.selected,
        "public": this.deixar_publico,
        "created_by": pb.authStore.model?.["id"]
    };

    console.log(this.deixar_aberto)
    console.log("Data model: ", data)

    const record = await pb.collection('chamados').create(data)

    if (this.imageFormData != undefined){
      await pb.collection('chamados').update(record["id"],this.imageFormData);
    }

    this.matDialog.closeAll()

    if (this.iniciar_timer){
      console.log("Start timer")
      this.pocketSrv.startUserTimer(record.id)
    }
    console.log(record)
  }
}
