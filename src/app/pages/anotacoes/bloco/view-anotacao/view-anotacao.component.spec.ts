import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAnotacaoComponent } from './view-anotacao.component';

describe('ViewAnotacaoComponent', () => {
  let component: ViewAnotacaoComponent;
  let fixture: ComponentFixture<ViewAnotacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAnotacaoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAnotacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
