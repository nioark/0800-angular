import { Component, ElementRef, Inject, OnInit, Pipe, ViewChild } from '@angular/core';
import { Observable, interval, map } from 'rxjs';
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

@Component({
    selector: 'app-view-service',
    standalone: true,
    templateUrl: './view-service.component.html',
    styleUrls: ['./view-service.component.scss'],
    imports: [ServiceRelatorioComponent, MatDialogClose, CommonModule, NgOptimizedImage, ImgAuthPipe, EditorModule]
})
export class ViewServiceComponent implements OnInit {
  // Define observer variable
  clockObserver$: Observable<String>;
  time: String = "";

  pb : Client

  relatorios : any = []

  mostrarEditor : boolean = false;

  @ViewChild('editor') editorNew : EditorComponent | undefined

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog,  public AuthSrv : AuthService, public pocketSrv: PocketCollectionsService) {
    this.clockObserver$ = interval(1000).pipe(
      map(() => (new Date()).toLocaleTimeString().toString())
    );

    this.pocketSrv.getRelatoriosParsed(this.data.id).subscribe(data => {
      this.relatorios = data
      console.log(data)
    })

    this.pb = AuthSrv.GetPocketBase()
  }

  ngOnInit(): void {
    var endpointsUrl =  {
      byFile: 'http://localhost:8090/uploadFile', // Your backend file uploader endpoint
      byUrl: 'http://localhost:8090/fetchUrl', // Your endpoint that provides uploading by Url
    }

    console.log(this.data)
    this.clockObserver$.subscribe(currentTime => {
      this.time = currentTime;
    });
  }

  sendRelatorio() {
    if (this.editorNew){
      console.log(this.editorNew)

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

}
