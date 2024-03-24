import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-radial-graph-two',
  standalone: true,
  imports: [],
  templateUrl: './radial-graph-two.component.html',
  styleUrl: './radial-graph-two.component.scss'
})
export class RadialGraphTwoComponent {
  @Input() total!: string;
  @Input() percentage!: number
  @Input() legend1!: string;
  @Input() legend1Value!: string;
  @Input() legend2!: string;
  @Input() legend2Value!: string;
  @Input() title!: string;
  @Input() color!: string;
  @Input() secondarypercentage! : number
  @Input() legend3!: string;
  @Input() legend3Value!: string;
}
