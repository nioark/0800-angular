import { Component, ElementRef, Inject, OnDestroy, OnInit, Pipe, ViewChild } from '@angular/core';
import { Observable, Subscription, interval, map } from 'rxjs';
import { ServiceRelatorioComponent } from './components/service-relatorio/service-relatorio.component';
import Header from '@editorjs/header'; 
import List from '@editorjs/list';
import ImageTool from '@editorjs/image'; 
import Paragraph from '@editorjs/paragraph';
import Checklist from '@editorjs/checklist'
import SimpleImage from "@editorjs/simple-image";
import LinkTool from '@editorjs/link';
import { NgOptimizedImage } from '@angular/common'


import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import Client from 'pocketbase';
import { AuthService } from '../../../../services/auth.service';
import { PocketCollectionsService } from '../../../../services/pocket-collections.service';
import { CommonModule } from '@angular/common';
import { ImgAuthPipe } from '../../../../img-auth.pipe'
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular';
import { Editor } from 'tinymce';
import { AddTecnicoComponent } from './components/add-tecnico/add-tecnico.component';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-view-service',
    standalone: true,
    templateUrl: './view-service.component.html',
    styleUrls: ['./view-service.component.scss'],
    imports: [ServiceRelatorioComponent, MatDialogClose, CommonModule, NgOptimizedImage, ImgAuthPipe, EditorModule]
})
export class ViewServiceComponent implements OnDestroy {
  // Define observer variable
  clockObserver$: Observable<String>;
  time: String = "";

  pb : Client

  relatorios : any = []
  mostrarEditor : boolean = false;
  pausado : boolean = false;

  em_espera : boolean = false;
  em_andamento : boolean = false;
  admin : boolean = false;

  @ViewChild('editor') editorNew : EditorComponent | undefined

  clockIntervalSubscription: Subscription | undefined

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private http : HttpClient, public dialog: MatDialog,  public AuthSrv : AuthService, public pocketSrv: PocketCollectionsService) {
    if (this.data.status == "em_espera"){
      this.em_espera = true
    }

    if (this.data.status == "em_andamento"){
      this.em_andamento = true 
    }

    this.clockObserver$ = interval(1000).pipe(
      map(() => (new Date()).toLocaleTimeString().toString())
    );

    this.pocketSrv.getRelatoriosParsed(this.data.id).subscribe(data => {
      this.relatorios = data
    })

    this.pb = AuthSrv.GetPocketBase()

     var endpointsUrl =  {
      byFile: 'http://localhost:8090/uploadFile', // Your backend file uploader endpoint
      byUrl: 'http://localhost:8090/fetchUrl', // Your endpoint that provides uploading by Url
    }

    if (!this.em_espera){
      this.clockIntervalSubscription = this.clockObserver$.subscribe(currentTime => {
        this.time = currentTime;
        this.updateTimers()
      });

      this.pocketSrv.getChamadoTimers(this.data.id).subscribe(data => {
        data.forEach((duracao : any) => {
          var duracao_total_str : any
          var duracao_total_seconds : any

          //Primeira vez abrindo o chamado
          if (duracao.last_end == "" && duracao.status == "em_andamento"){
            let last_start = new Date(duracao.last_start) as any
            let date_now = new Date() as any

            const dates_difference = (date_now - last_start) / 1_000
            duracao_total_seconds = dates_difference 
            duracao_total_str = new Date(duracao_total_seconds * 1000).toISOString().slice(11, 19)

          } else if (duracao.last_end != "" && duracao.status == "em_andamento") {
            let last_start = new Date(duracao.last_start) as any
            let date_now = new Date() as any

            duracao_total_seconds = (date_now - last_start) / 1_000
            duracao_total_seconds += duracao.total_elapsed_time_seconds
            duracao_total_str = new Date(duracao_total_seconds * 1000).toISOString().slice(11, 19)
          } else if ( duracao.status == "em_pausa") {
            duracao_total_seconds = duracao.total_elapsed_time_seconds 
            duracao_total_str = new Date(duracao_total_seconds * 1000).toISOString().slice(11, 19)

          }

          const findt = this.data.expand.users.find((user : any) => user.id ==  duracao.user)
          findt["duracao_total_str"] = duracao_total_str
          findt["duracao_total_seconds"] = duracao_total_seconds
          findt["duracao_status"] = duracao.status
        })

        this.updateTimers()
        // const findt = this.data.expand.users.find((user : any) => user.id ==  data.user)
      })
    }
  }

  updateTimers(){
    this.data.expand.users.map((user : any) => {
      if (user["duracao_status"] != undefined && user["duracao_status"] == "em_andamento"){
        user["duracao_total_seconds"] += 1
        user["duracao_total_str"] = new Date(user["duracao_total_seconds"] * 1000).toISOString().slice(11, 19)
      } else if ( user["duracao_status"] != undefined && user["duracao_status"] == "em_pausa"){
        user["duracao_total_str"] = new Date(user["duracao_total_seconds"] * 1000).toISOString().slice(11, 19)
      } else {
        user["duracao_total_str"] = "00:00:00"
      }

      if (user.id == this.pb.authStore.model!["id"]){
        if (user.duracao_status == "em_pausa" || user.duracao_total_str == "00:00:00"){
          this.pausado = true
        }
      }
    })  
  }

  ngOnDestroy(){
    if (this.clockIntervalSubscription)
      this.clockIntervalSubscription.unsubscribe()
  }

  sendRelatorio() {
    if (this.editorNew){
      const html = this.editorNew.editor.getContent()

      // this.editorNew.editor.uploadImages(endpointsUrl)

      this.pb.collection('relatorios').create({
          "user": this.pb.authStore.model!["id"],
          "relatorio": html,
          "chamado": this.data.id

      })
    }
  }

  openAddView(){
    const dialogRef = this.dialog.open(AddTecnicoComponent, {data: this.data });
  }

  setEditor(val : boolean){
    this.mostrarEditor = val
  }

  resumeTimer(){
    this.pausado = false 
    this.pocketSrv.startChamado(this.data.id)

  }

  pauseTimer(){
    this.pausado = true 
    this.pocketSrv.pauseChamado(this.data.id)
  }

  finalizarChamado(){
    // this.pocketSrv.finalizarChamado(this.data.id)
    const formData = new FormData()
    formData.append('chamado_id', this.data.id)
    this.http.post<any>(`http://localhost:8090/finalizarChamado`, formData).subscribe(data => {
      console.log(data)
    })
  }

  cancelarChamado(){

  }

}
