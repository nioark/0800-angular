import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEsperandoServiceComponent } from './view-esperando-service.component';

describe('ViewEsperandoServiceComponent', () => {
  let component: ViewEsperandoServiceComponent;
  let fixture: ComponentFixture<ViewEsperandoServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEsperandoServiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewEsperandoServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
