import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-address-link',
  standalone: true,
  imports: [],
  templateUrl: './address-link.component.html',
  styleUrl: './address-link.component.scss'
})
export class AddressLinkComponent {

  @ViewChild('tooltip1', { static: true }) tooltipElement!: ElementRef;

  element : any

  @Input() domain!: string;
  @Input() emailDomain!: string;
  @Input() webDomain!: string;



  ngAfterViewInit() {
    this.element = this.tooltipElement.nativeElement;
    this.hideTooltip()
    // Use the element variable to access the element and perform operations
  }

  showTooltip() {
    this.element.classList.remove("hidden");
  }
  hideTooltip() {
    this.element.classList.add("hidden");
  }

  clicked(event : any) {
    event.stopPropagation();
  }
}
