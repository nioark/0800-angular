import { HttpClient, HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject, Subscription, distinctUntilChanged, filter, switchMap, map, tap, Observable, catchError } from 'rxjs';

@Pipe({
  name: 'useHttpImgSrc',
  standalone: true
})

export class ImgAuthPipe implements PipeTransform {
  private transformValue = new BehaviorSubject<string>('');

  constructor(private httpClient: HttpClient,
              private domSanitizer: DomSanitizer,
              private cdr: ChangeDetectorRef) {
    // every pipe instance will set up their subscription
  }

  transform(imagePath: string): Observable<string | SafeUrl> {
    // we emit a new value
    // this.transformValue.next("/assets/loading.png");

    // await new Promise(resolve => setTimeout(resolve, 1000));

    const httpResponse = this.httpClient.get(imagePath, { observe: 'response', responseType: 'blob' }).subscribe(
      (response: HttpResponse<Blob>) => {
        const ObjectURL = URL.createObjectURL(response.body as Blob);
        this.domSanitizer.bypassSecurityTrustUrl(ObjectURL)

        this.transformValue.next(ObjectURL);
      }
    );

    // we always return the latest value
    // return this.domSanitizer.bypassSecurityTrustUrl(ObjectURL)

    return this.transformValue.asObservable();
  }

}


  // transform(imagePath: string): Observable<string | SafeUrl> {
  //   // we emit a new value
  //   this.transformValue.next(imagePath);

  //   // await new Promise(resolve => setTimeout(resolve, 1000));

  //   const httpResponse = await this.httpClient.get(imagePath, { observe: 'response', responseType: 'blob' }).toPromise();

  //   if (!httpResponse) {
  //     return 'notfound';
  //   }
  //   const ObjectURL = URL.createObjectURL(httpResponse.body as Blob);

  //   console.log("val: ", httpResponse);
  //   // we always return the latest value
  //   return this.domSanitizer.bypassSecurityTrustUrl(ObjectURL)
  // }

// export class ImgAuthPipe implements PipeTransform, OnDestroy {
//   private subscription = new Subscription();
//   private transformValue = new BehaviorSubject<string>('');

//   private latestValue!: string | SafeUrl;

//   constructor(private httpClient: HttpClient,
//               private domSanitizer: DomSanitizer,
//               private cdr: ChangeDetectorRef) {
//     // every pipe instance will set up their subscription
//     this.setUpSubscription();
//   }

//   // ...

//   transform(imagePath: string): Observable<string | SafeUrl> {
//     // we emit a new value
//     this.transformValue.next(imagePath);

//     // we always return the latest value
//     return this.transformValue.asObservable();
//   }

//   ngOnDestroy(): void {
//     this.subscription.unsubscribe();
//   }

//   private setUpSubscription(): void {
//     const transformSubscription = this.transformValue
//       .asObservable()
//       .pipe(
//         filter((v): v is string => !!v),
//         distinctUntilChanged(),
//         // we use switchMap, so the previous subscription gets torn down 
//         switchMap((imagePath: string) => this.httpClient
//           // we get the imagePath, observing the response and getting it as a 'blob'
//           .get(imagePath, { observe: 'response', responseType: 'blob' })
//           .pipe(
//             // we map our blob into an ObjectURL
//             map((response: HttpResponse<Blob>) => {
//               console.log("Response pipe: ",response);
//               return URL.createObjectURL(response.body as Blob);

//             }),
//             // we bypass Angular's security mechanisms
//             map((unsafeBlobUrl: string) => {
//               console.log("unsafeBlobUrl: ", unsafeBlobUrl);
//               return this.domSanitizer.bypassSecurityTrustUrl(unsafeBlobUrl)
//             }),
//             // we trigger it only when there is a change in the result
//             filter((blobUrl) => blobUrl !== this.latestValue),
//           )
//         ),
//         tap((imagePath: string | SafeUrl) => {
//           this.latestValue = imagePath;
//           console.log("Latest Value: ", this.latestValue);

//           this.cdr.markForCheck();
//         })
//       )
//       .subscribe();
//     this.subscription.add(transformSubscription);
//   }
// }