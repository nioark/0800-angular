import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-radial-graph',
  standalone: true,
  imports: [],
  templateUrl: './radial-graph.component.html',
  styleUrl: './radial-graph.component.scss'
})
export class RadialGraphComponent {
  @Input() total!: string;
  @Input() percentage!: number
  @Input() legend1!: string;
  @Input() legend1Value!: string;
  @Input() legend2!: string;
  @Input() legend2Value!: string;
  @Input() title!: string;
  @Input() color!: string;


}
