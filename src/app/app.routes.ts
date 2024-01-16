import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AndamentoComponent } from './pages/chamados/andamento/andamento.component';
import { AbertoComponent } from './pages/chamados/aberto/aberto.component';
import { AdicionarComponent } from './pages/chamados/adicionar/adicionar.component';
import { KanbanComponent } from './pages/kanban/kanban.component';

export const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'chamados/andamento', component: AndamentoComponent},
  { path: 'chamados/aberto', component: AbertoComponent},
  { path: 'chamados/adicionar', component: AdicionarComponent},
  { path: 'tecnicos', component: KanbanComponent},
    // path: 'chamados/encerrados', loadComponent: () => EncerradosComponent,
];
