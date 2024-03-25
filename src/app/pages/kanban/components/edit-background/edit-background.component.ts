import { Component } from '@angular/core';
import { AuthModel } from 'pocketbase';
import { PocketChamadosService } from '../../../../services/pocket-chamados.service';
import { AuthService } from '../../../../services/auth.service';
import { Dialog } from '@angular/cdk/dialog';

@Component({
  selector: 'app-edit-background',
  standalone: true,
  imports: [],
  templateUrl: './edit-background.component.html',
  styleUrl: './edit-background.component.scss',
})
export class EditBackgroundComponent {
  user: AuthModel;

  constructor(
    private pocket: PocketChamadosService,
    private authServ: AuthService,
    private dialog: Dialog,
  ) {
    this.user = pocket.pb.authStore.model;
  }

  async changeBackground(event: Event) {
    if (this.user == null) {
      return;
    }

    let target = event.target as HTMLInputElement;

    let files = target.files as FileList;

    let file = files[0];

    let formData = new FormData();
    formData.append('background', file);
    console.log(formData, this.user['id']);
    await this.pocket.pb.collection('users').update(this.user['id'], formData);
    await this.pocket.pb.collection('users').authRefresh(
      {},
      {
        expand: 'cargo', // replace with your relation field name
      },
    );

    this.dialog.closeAll();
    console.log('Wallpaper changed');
    window.location.reload();
    console.log(files);
  }
}
