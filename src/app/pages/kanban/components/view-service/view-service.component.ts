import { Component, Inject, OnInit } from '@angular/core';
import { Observable, interval, map } from 'rxjs';
import { ServiceRelatorioComponent } from './components/service-relatorio/service-relatorio.component';
import EditorJS, { ToolSettings } from '@editorjs/editorjs';
import Header from '@editorjs/header'; 
import List from '@editorjs/list';
import ImageTool from '@editorjs/image'; 
import Paragraph from '@editorjs/paragraph';
import Checklist from '@editorjs/checklist'
import SimpleImage from "@editorjs/simple-image";
import LinkTool from '@editorjs/link';

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

@Component({
  selector: 'app-view-service',
  standalone: true,
  imports: [ServiceRelatorioComponent, MatDialogClose],
  templateUrl: './view-service.component.html',
  styleUrls: ['./view-service.component.scss']
})
export class ViewServiceComponent implements OnInit {
  // Define observer variable
  clockObserver$: Observable<String>;
  time: String = "";
  editor : EditorJS | undefined;

  pb : Client

  relatorios : any = []

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public AuthSrv : AuthService, public pocketSrv: PocketCollectionsService) {
    this.clockObserver$ = interval(1000).pipe(
      map(() => (new Date()).toLocaleTimeString().toString())
    );


    this.pocketSrv.getRelatoriosParsed(this.data.id).subscribe(data => {
      this.relatorios = data
    })


    this.pb = AuthSrv.GetPocketBase()
  }

  ngOnInit(): void {
    var endpointsUrl =  {
      byFile: 'http://localhost:8090/uploadFile', // Your backend file uploader endpoint
      byUrl: 'http://localhost:8090/fetchUrl', // Your endpoint that provides uploading by Url
    }

    console.log(this.data)

    this.editor = new EditorJS({
      /**
       * Id of Element that should contain Editor instance
       */

      minHeight: 50,
      holder: 'editorjs',
      tools: { 
        header: {
        inlineToolbar: true,
          class: Header, 
          config: {
            levels: [2, 3, 4],
            defaultLevel: 3
          }
        }, 

        list: List,
        // checklist: Checklist,
        image: {
          class: ImageTool,
          config: {
            endpoints: endpointsUrl,
            additionalRequestHeaders: {
              'authorization': "this.pb.authStore.token"
            }
          }
        }
      }, 
    });
    // Subscribe to observable
    this.clockObserver$.subscribe(currentTime => {
      this.time = currentTime;
    });
  }

  sendRelatorio() {
    if (this.editor){
      this.editor.save().then((outputData) => {
        this.pb.collection('relatorios').create({
          "user": this.pb.authStore.model!["id"],
          "relatorio": JSON.stringify(outputData),
          "chamado": this.data.id

        })
        console.log('Article data: ', outputData)
      }).catch((error) => {
        console.log('Saving failed: ', error)
      });
    }
  }

}
