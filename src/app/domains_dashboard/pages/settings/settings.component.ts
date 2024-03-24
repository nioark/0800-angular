import { Component } from '@angular/core';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { ThemeService } from '../../services/theme.service';
import { FrameNavComponent } from '../../../components/frame-nav/frame-nav.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SidebarComponent, FrameNavComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  constructor(private themeSrv: ThemeService) {}

  ngOnInit() {
    const theme = this.themeSrv.getTheme();
  }

  loadTheme() {
    const themeSwitch = document.getElementById(
      'themeswitch',
    ) as HTMLInputElement;

    if (themeSwitch.checked) {
      this.themeSrv.setTheme('dark');
    } else {
      this.themeSrv.setTheme('light');
    }
  }
}
