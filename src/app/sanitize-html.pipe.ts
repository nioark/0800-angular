import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'sanitizeHtml',
  standalone: true
})
export class SanitizeHtmlPipe implements PipeTransform {

  constructor(private _sanitizer:DomSanitizer) {
  }

  transform(v:string):SafeHtml {
    console.log("HTml before:", v, "html after :", this._sanitizer.bypassSecurityTrustHtml(v));
    return this._sanitizer.bypassSecurityTrustHtml(v);
  }
}
