import { Component } from '@angular/core';
import { FrameNavComponent } from "../../components/frame-nav/frame-nav.component";
import { AndamentoComponent } from './components/andamento/andamento.component';
import { AdicionarComponent } from './components/adicionar/adicionar.component';
import { AbertoComponent } from './components/aberto/aberto.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AguardandoComponent } from './components/aguardando/aguardando.component';

@Component({
    selector: 'app-chamados',
    standalone: true,
    templateUrl: './chamados.component.html',
    styleUrl: './chamados.component.scss',
    imports: [FrameNavComponent, AndamentoComponent, AdicionarComponent, AbertoComponent, AguardandoComponent]
})
export class ChamadosComponent {

    id: string;
    constructor(private route: ActivatedRoute, private router: Router) {
        this.id = this.route.snapshot.paramMap.get('page') as string;
        if (this.route.snapshot.paramMap.get('page') == null) {
            this.id = 'andamento'
        }
    }

    setRoute(id: string) {
        this.router.navigate(["chamados/",id]);
        this.id = id;
    }
}
