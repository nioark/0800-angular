import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadialGraphTwoComponent } from './radial-graph-two.component';

describe('RadialGraphTwoComponent', () => {
  let component: RadialGraphTwoComponent;
  let fixture: ComponentFixture<RadialGraphTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadialGraphTwoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RadialGraphTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
