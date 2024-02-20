import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AndamentoComponent } from './andamento.component';

describe('AndamentoComponent', () => {
  let component: AndamentoComponent;
  let fixture: ComponentFixture<AndamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AndamentoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AndamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
