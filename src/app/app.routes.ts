import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { KanbanComponent } from './pages/kanban/kanban.component';
import { LoginComponent } from './pages/login/login.component';
import { ChamadosComponent } from './pages/chamados/chamados.component';
import { RegistrosComponent } from './pages/registros/registros.component';
import { AnotacoesComponent } from './pages/anotacoes/anotacoes.component';
import { ConfigCustoComponent } from './domains_dashboard/pages/config-custo/config-custo.component';
import { ContratosComponent } from './domains_dashboard/pages/contratos/contratos.component';
import { DashboardComponent } from './domains_dashboard/pages/dashboard/dashboard.component';
import { ServerComponent } from './domains_dashboard/pages/server/server.component';
import { ServersComponent } from './domains_dashboard/pages/servers/servers.component';
import { SettingsComponent } from './domains_dashboard/pages/settings/settings.component';
import { AuthGuard } from './domains_dashboard/services/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'chamados/:page', component: ChamadosComponent },
  { path: 'registros', component: RegistrosComponent },
  { path: 'anotacoes', component: AnotacoesComponent },

  { path: 'tecnicos', component: KanbanComponent },
  { path: 'login', component: LoginComponent },

  { path: 'dominios/dashboard', redirectTo: 'dominios/dashboard/estatisticas' },
  {
    path: 'dominios/dashboard/estatisticas',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dominios/dashboard/servidores',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dominios/dashboard/faturamento',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dominios/servers/config',
    component: ConfigCustoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dominios/servers',
    component: ServersComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dominios/contratos',
    component: ContratosComponent,
    canActivate: [AuthGuard],
  },
  { path: 'dominios/login', component: LoginComponent },
  {
    path: 'dominios/settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dominios/server/:serverId/:serviceId',
    component: ServerComponent,
    canActivate: [AuthGuard],
  },

  // path: 'chamados/encerrados', loadComponent: () => EncerradosComponent,
];
