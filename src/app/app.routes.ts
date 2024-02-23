import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { KanbanComponent } from './pages/kanban/kanban.component';
import { LoginComponent } from './pages/login/login.component';
import { ChamadosComponent } from './pages/chamados/chamados.component';
import { RegistrosComponent } from './pages/registros/registros.component';

export const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'home', component: HomeComponent},
  { path: 'chamados/:page', component: ChamadosComponent, },
  { path: 'registros', component: RegistrosComponent},

  { path: 'tecnicos', component: KanbanComponent},
  { path: 'login', component: LoginComponent}
  
    // path: 'chamados/encerrados', loadComponent: () => EncerradosComponent,
];
