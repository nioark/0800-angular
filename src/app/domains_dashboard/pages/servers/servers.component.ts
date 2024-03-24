import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  ViewChild,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { AddressLinkComponent } from './components/address-link/address-link.component';
import { HttpClient } from '@angular/common/http';
import { AsyncPipe, CommonModule, NgComponentOutlet } from '@angular/common';
import { ServersService } from '../../services/servers.service';
import { Searcher } from 'fast-fuzzy';
import { ServersFilterComponent } from './components/servers-filter/servers-filter.component';
import $ from 'jquery';
import { EmailServicesApiService } from '../../services/email-services-api.service';
import { ServerData } from '../../models/apiserver';
import { initFlowbite } from 'flowbite';
import { DropactionsComponent } from './components/dropactions/dropactions.component';
import { createPopper } from '@popperjs/core';
import { environment } from '../../../environment';
import { Router } from '@angular/router';
import { PopupComponent } from '../components/popup/popup.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { FrameNavComponent } from '../../../components/frame-nav/frame-nav.component';

@Component({
  selector: 'app-servers',
  standalone: true,
  imports: [
    SidebarComponent,
    AddressLinkComponent,
    CommonModule,
    ServersFilterComponent,
    DropactionsComponent,
    NgComponentOutlet,
    AsyncPipe,
    FrameNavComponent,
  ],
  templateUrl: './servers.component.html',
  styleUrl: './servers.component.scss',
})
export class ServersComponent {
  public data: ServerData[] = [];
  public data_view: ServerData[] = [];
  public firstData: ServerData[] = [];
  private loadedLength: number = 40;

  isAdmin: boolean = localStorage.getItem('isAdmin') == 'true';

  dataView$: BehaviorSubject<ServerData[]> = new BehaviorSubject<ServerData[]>(
    [],
  );

  private serversFilterDict = {
    server_a_tag: 0,
    server_b_tag: 1,
    server_c_tag: 2,
    server_d_tag: 3,
    server_e_tag: 4,
  };
  private serversFilters = [
    'server_a_tag',
    'server_b_tag',
    'server_c_tag',
    'server_d_tag',
    'server_e_tag',
  ];
  private currentSearch = '';
  private currentOrderBy = '';
  private reverseOrder = false;
  public usersAmmount = 0;

  @ViewChild('filter') filters: ServersFilterComponent | undefined;
  @ViewChild('pulse') loadingtab: ElementRef | undefined;

  @ViewChild('discocheio') discoCheioTag:
    | ElementRef<HTMLInputElement>
    | undefined;
  @ViewChild('usuariolotados') usuarioLotadosTag:
    | ElementRef<HTMLInputElement>
    | undefined;
  @ViewChild('dominiossuspensos') dominiosSuspensosTag:
    | ElementRef<HTMLInputElement>
    | undefined;
  @ViewChild('dominiosduplicados') dominiosDuplicadosTag:
    | ElementRef<HTMLInputElement>
    | undefined;
  @ViewChild('dominiossemcontratos') dominiosSemContratoTag:
    | ElementRef<HTMLInputElement>
    | undefined;

  @ViewChild('escondersuspensos') esconderSuspensosTag:
    | ElementRef<HTMLInputElement>
    | undefined;
  @ViewChild('container', { read: ViewContainerRef }) container:
    | ViewContainerRef
    | undefined;

  constructor(
    private http: HttpClient,
    private componentFactoryResolver: ComponentFactoryResolver,
    private serverSrv: ServersService,
    private emailsSrv: EmailServicesApiService,
    private router: Router,
  ) {
    this.emailsSrv.fetch().subscribe((data) => {
      this.firstData = data;
      this.finalSearch();
      this.loadingtab?.nativeElement.classList.remove('animate-pulse');
    });
  }

  copy(domain: string, event: Event) {
    this.stopEvent(event);
    console.log(domain);
    this.addPopup('Copiado!', 'Link ' + domain + ' foi copiado.', false);
    // navigator.clipboard.writeText(domain).then().catch(e => console.log(e));

    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData?.setData('text/plain', domain);
      e.preventDefault();
      document.removeEventListener('copy', null as any);
    });
    document.execCommand('copy');
  }

  round(num: number | null) {
    if (num == null) return 'null';
    return Number(num.toFixed(1));
  }

  gotoPath(path: string) {
    this.router.navigate(['/dominios/' + path]);
  }

  loadList() {
    this.data_view = [...this.data.slice(0, this.data_view.length + 10)];
    this.loadedLength += 10;
  }

  onWheel() {
    var scrollTop = $('#scroll').scrollTop() as number;
    var docHeight = $('table').height() as number;
    var winHeight = $('#scroll').height() as number;
    var scrollPercent = scrollTop / (docHeight - winHeight);
    var scrollPercentRounded = Math.round(scrollPercent * 100);
    let size = this.data_view.length;
    let width = $(window).width() as number;
    let pixelSize = 57;

    if (width > 1280) pixelSize = 57;
    else pixelSize = 75;
    // console.log(scrollTop, 75 * (size - 10))

    if (scrollTop > pixelSize * (size - 10)) {
      this.loadList();
      let slide = this.loadingtab?.nativeElement as HTMLDivElement;
      let tab = this.loadingtab?.nativeElement as HTMLDivElement;
      let size_diff = this.data.length - (size + 10);

      if (size_diff > 0)
        $('#heightclass').css('height', pixelSize * size_diff + 'px');
      else $('#heightclass').css('height', '0px');
    }

    // if (scrollPercentRounded > 90){
    //   let slide = this.loadingtab?.nativeElement as HTMLDivElement
    //   this.loadList()
    //   // setTimeout(() => {

    //   //   slide.scrollTop += 75 * 60
    //   // }, 100)
    // }
  }

  ngOnInit() {
    initFlowbite();
  }

  addPopup(titulo: string, mensagem: string, erro: boolean) {
    const component: ComponentRef<PopupComponent> =
      this.container?.createComponent(
        PopupComponent,
      ) as ComponentRef<PopupComponent>;
    component.instance.titulo = titulo;
    component.instance.mensagem = mensagem;
    component.instance.erro_popup = erro;
  }

  ngAfterViewInit() {
    this.changedOrderBy('domain');

    this.filters?.serversFiltersEmitter.asObservable().subscribe((data) => {
      this.serversFilters = data;
      this.finalSearch();
    });
  }

  changedOrderBy(orderBy: string) {
    if (orderBy == this.currentOrderBy && this.reverseOrder == true)
      this.currentOrderBy = '';
    else if (orderBy == this.currentOrderBy && this.reverseOrder == false)
      this.reverseOrder = true;
    else {
      this.reverseOrder = false;
      this.currentOrderBy = orderBy;
    }

    this.finalSearch();
  }

  toggleOption(button: HTMLElement, elemento: HTMLElement, event: Event) {
    this.stopEvent(event);

    let popper = createPopper(button, elemento, {
      placement: 'bottom',
    });
    popper.forceUpdate();
    // console.log(popper.state)
    if (elemento.classList.contains('hidden'))
      elemento.classList.remove('hidden');
    else elemento.classList.add('hidden');
  }

  stopEvent(event: Event) {
    event.stopPropagation();
  }

  setCheckbox(
    checkbox: ElementRef<HTMLInputElement> | undefined,
    value: boolean,
  ) {
    if (checkbox && checkbox.nativeElement) {
      checkbox.nativeElement.checked = value;
    }
  }

  changedFilters(elemento: string) {
    // if (elemento == "dominiossuspensos")
    //   this.setCheckbox(this.esconderSuspensosTag, false)

    // if (elemento == "dominiossuspensos" && this.dominiosSuspensosTag?.nativeElement.checked == false)
    //   this.setCheckbox(this.esconderSuspensosTag, true)

    // if (elemento == "escondersuspensos")
    //   this.setCheckbox(this.dominiosSuspensosTag, false)

    this.finalSearch();
  }

  filterData(data: ServerData[]): ServerData[] {
    const serverIds = this.serversFilters.map(
      (tag) =>
        this.serversFilterDict[tag as keyof typeof this.serversFilterDict],
    );

    const esconderSuspended = this.esconderSuspensosTag?.nativeElement.checked;
    const discoCheio = this.discoCheioTag?.nativeElement.checked;
    const usuarioLotados = this.usuarioLotadosTag?.nativeElement.checked;
    const dominiosSuspensos = this.dominiosSuspensosTag?.nativeElement.checked;
    const dominiosDuplicados =
      this.dominiosDuplicadosTag?.nativeElement.checked;
    const dominiosSemContrato =
      this.dominiosSemContratoTag?.nativeElement.checked;

    let domainCounts = {};
    const domainCount = new Map<string, number>();
    for (const server of data) {
      domainCount.set(server.domain, (domainCount.get(server.domain) || 0) + 1);
    }

    return data.filter((server) => {
      if (!serverIds.includes(server.serverId)) return false;

      if (
        esconderSuspended &&
        server.suspended == true &&
        dominiosSuspensos == false
      )
        return false;

      if (dominiosSuspensos && server.suspended == false) return false;

      if (
        discoCheio &&
        (server.usedStoragePercentage < 80 || server.unlimitedStorage)
      )
        return false;
      if (
        usuarioLotados &&
        (server.usedUsersPercentage < 90 || server.unlimitedUsers)
      )
        return false;
      if (dominiosSemContrato && server.contratoID != null) return false;
      // console.log(server.domain, (domainCount.get(server.domain)|| 0))
      if (dominiosDuplicados && (domainCount.get(server.domain) || 0) == 1)
        return false;

      return true;
    });
  }

  dataOrderBy(data: ServerData[]): ServerData[] {
    if (this.currentOrderBy == '') {
      return data;
    }

    let sorted;

    if (this.currentOrderBy == 'domain' || this.currentOrderBy == 'pacote')
      sorted = data.sort((a_val, b_val) => {
        let a = a_val[this.currentOrderBy as keyof ServerData];
        let b = b_val[this.currentOrderBy as keyof ServerData];
        if (a < b) return -1;
        if (a > b) return 1;

        return 0;
      });
    else
      sorted = data.sort((a_val, b_val) => {
        let a = a_val[this.currentOrderBy as keyof ServerData];
        let b = b_val[this.currentOrderBy as keyof ServerData];
        if (a < b) return 1;
        if (a > b) return -1;

        return 0;
      });

    if (this.reverseOrder) return sorted.reverse();
    else return sorted;
  }

  openServer(serviceId: number, serverId: number) {
    this.router.navigate([`/server/${serverId}/${serviceId}`]);
  }

  searchKeyup(event: Event, search: HTMLInputElement) {
    this.currentSearch = search.value;
    this.finalSearch();
  }

  searchData(data: ServerData[]): ServerData[] {
    if (this.currentSearch == '') return data;

    const searcher = new Searcher(data as any[], {
      keySelector: (obj) => obj.domain,
      threshold: 0.9,
    });

    const result = searcher.search(this.currentSearch, {
      returnMatchData: true,
    });
    return result.map((data) => data.item);
  }

  finalSearch() {
    const time = performance.now();
    const filteredData = this.filterData(this.firstData);
    const searchedData = this.searchData(filteredData);

    this.usersAmmount = 0;
    this.data = this.dataOrderBy(searchedData);

    this.data.forEach((server) => {
      this.usersAmmount += server.usedUsers;
    });

    this.data_view = this.data.slice(0, this.loadedLength);

    //todo make reload based in the actual scrollin

    let size = this.data_view.length;
    let width = $(window).width() as number;
    let pixelSize = 57;
    let size_diff = this.data.length - size;

    if (size_diff > 0) {
      // console.log((pixelSize * (size_diff)) + "px")
      $('#heightclass').css('height', pixelSize * size_diff + 'px');
    } else {
      // console.log("0px")
      $('#heightclass').css('height', '0px');
    }

    console.log(performance.now() - time);
  }

  sendDomainWithError(serverId: number, serviceId: number, domain: string) {
    const formData: FormData = new FormData();
    formData.append('serverId', serverId.toString());
    formData.append('serviceId', serviceId.toString());
    formData.append('domain', domain);

    this.http
      .post(environment.apiUrlDomains + '/domainerror', formData)
      .subscribe();
  }

  openCpanel(
    serverId: number,
    serviceId: number,
    event: Event,
    domain: string,
  ) {
    this.stopEvent(event);
    const formData: FormData = new FormData();
    formData.append('serverId', serverId.toString());
    formData.append('serviceId', serviceId.toString());
    console.log(serverId, serviceId);

    this.http
      .post(environment.apiUrlDomains + '/getlinkcpanel', formData)
      .subscribe({
        next: (response) => {
          this.addPopup('Sucesso!', 'Sessão criada com sucesso!', false);
          window.open(response.toString(), '_blank');
        },
        error: (error) => {
          this.addPopup('Erro!', 'Falha ao criar sessão!', true);

          this.sendDomainWithError(serverId, serviceId, domain);

          console.error('Error:', error);
        },
      });
  }

  openCwp(serverId: number, serviceId: number, event: Event, domain: string) {
    this.stopEvent(event);
    const formData: FormData = new FormData();
    formData.append('serverId', serverId.toString());
    formData.append('serviceId', serviceId.toString());

    this.http
      .post(environment.apiUrlDomains + '/getlinkcwp', formData)
      .subscribe({
        next: (response) => {
          window.open(response.toString(), '_blank');

          // Handle response here
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }
}
