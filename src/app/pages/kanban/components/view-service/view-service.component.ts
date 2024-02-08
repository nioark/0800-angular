import { Component, OnInit } from '@angular/core';
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

  constructor() {
    this.clockObserver$ = interval(1000).pipe(
      map(() => (new Date()).toLocaleTimeString().toString())
    );
  }

  ngOnInit(): void {

    var t =  {
            byFile: 'http://localhost:8008/uploadFile', // Your backend file uploader endpoint
            byUrl: 'http://localhost:8008/fetchUrl', // Your endpoint that provides uploading by Url
          }

    var vl = t as ToolSettings 

    const editor = new EditorJS({
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
        checklist: Checklist,
        image: {
          class: ImageTool,
          config: {
            endpoints: {
              byFile: 'http://localhost:8008/uploadFile', // Your backend file uploader endpoint
              byUrl: 'http://localhost:8008/fetchUrl', // Your endpoint that provides uploading by Url
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

}
