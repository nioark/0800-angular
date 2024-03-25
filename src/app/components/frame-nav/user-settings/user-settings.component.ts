import { Component } from '@angular/core';
import { PocketChamadosService } from '../../../services/pocket-chamados.service';
import { AuthModel } from 'pocketbase';
import { environment } from '../../../environment';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Dialog } from '@angular/cdk/dialog';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, FormsModule],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss'
})
export class UserSettingsComponent {
  user : AuthModel
  apiUrl = environment.apiUrl

  password = ''
  passwordConfirm = ''
  oldPassword = ''
  error = ''


  constructor(private pocket : PocketChamadosService, private authServ : AuthService, private dialog : Dialog) {
    this.user =  pocket.pb.authStore.model
  }

  async changeAvatar(event : Event) {
    if (this.user == null) {
      return
    }

    let target = event.target as HTMLInputElement

    let files = target.files as FileList

    let file = files[0]

    let formData = new FormData()
    formData.append('avatar', file)
    console.log(formData, this.user['id'])
    await this.pocket.pb.collection('users').update(this.user['id'],formData);
    await this.pocket.pb.collection("users").authRefresh({}, {
          expand: "cargo" // replace with your relation field name
  });
    console.log(files)
  }

  async resetPassword() {
    console.log(this.password, this.passwordConfirm)

    if (this.user == null) {
      return
    }

    if (this.password != this.passwordConfirm) {
      this.error = 'As senhas não coincidem'
      return
    }

    if (this.password.length < 8) {
      this.error = 'A senha deve ter pelo menos 8 caracteres'
      return
    }

    const data = {
        "password": this.password ,
        "passwordConfirm": this.passwordConfirm,
        "oldPassword": this.oldPassword
    }

    try{
      const record = await this.pocket.pb.collection('users').update(this.user['id'], data);
      console.log(record)
      this.authServ.Logout()
      this.dialog.closeAll()
      


    } catch (error) {
     console.log(error) 
    }
  }
}
