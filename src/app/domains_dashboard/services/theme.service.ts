import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  theme : string = "dark"

  constructor() {

    if (localStorage.getItem('theme') != null){
      this.theme = localStorage.getItem('theme')!

      this.setTheme(this.theme)
    } else {
      this.setTheme("dark")

    }
  }

  setTheme(theme: string) {
    localStorage.setItem('theme', theme);
    this.theme = theme
    this.loadTheme()
  }

  getTheme(){
    return this.theme
  }

  loadTheme(){
    if (this.theme == "dark"){
      document.documentElement.classList.add('dark');
    }
    else {
      document.documentElement.classList.remove('dark');
    }
  }
}
