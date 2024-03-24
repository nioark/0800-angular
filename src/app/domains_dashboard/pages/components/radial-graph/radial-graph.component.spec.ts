import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadialGraphComponent } from './radial-graph.component';

describe('RadialGraphComponent', () => {
  let component: RadialGraphComponent;
  let fixture: ComponentFixture<RadialGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadialGraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RadialGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
