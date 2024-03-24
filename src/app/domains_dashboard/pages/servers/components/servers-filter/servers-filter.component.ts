import { Component, EventEmitter, Output } from '@angular/core';
import { initFlowbite } from 'flowbite';
import $ from 'jquery';
import { createPopper } from '@popperjs/core';

@Component({
  selector: 'app-servers-filter',
  standalone: true,
  imports: [],
  templateUrl: './servers-filter.component.html',
  styleUrl: './servers-filter.component.scss'
})
export class ServersFilterComponent {

  private serversFilters = ['server_a_tag', 'server_b_tag', 'server_c_tag', "server_d_tag"];

  @Output() serversFiltersEmitter = new EventEmitter<string[]>();

  constructor() {
    
  }

  ngOnInit() {
    initFlowbite();
    
  }

  getFilters () : string[] {
    return this.serversFilters
  }


  toggleOption(button : HTMLElement, elemento : HTMLElement, event : Event){
    event.stopPropagation();

    let popper = createPopper(button, elemento, {
      placement: 'bottom',
      modifiers: [
        {
         name: 'offset',
         options: { 
          offset: [0, 10] 
         }
        }
      ]
    })
    popper.forceUpdate()
    console.log(popper.state)
    if (elemento.classList.contains("hidden"))
      elemento.classList.remove("hidden")
    else
      elemento.classList.add("hidden")
  }


  removeBadge(id: string) {
    $('#' + id).fadeOut(300, function(){ $(this).hide();});
    $("#" + id.replace("_tag", "")).prop('checked', false);
    const filterIndex = this.serversFilters.indexOf(id);
    if (filterIndex > -1) {
      this.serversFilters.splice(filterIndex, 1);
    }
    this.serversFiltersEmitter.emit(this.serversFilters);
  }

  showBadge(id: string){
    $('#' + id).fadeIn(300, function(){ $(this).show();});
    if (!this.serversFilters.includes(id)) {
      this.serversFilters.push(id);
    }
    this.serversFiltersEmitter.emit(this.serversFilters);
  }

  toggleServer(event : any, checkbox: HTMLInputElement){
    if (checkbox.checked)
      this.showBadge(checkbox.id + "_tag")
    else
      this.removeBadge(checkbox.id + "_tag")
  }


}
