import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnotacoesComponent } from './anotacoes.component';

describe('AnotacoesComponent', () => {
  let component: AnotacoesComponent;
  let fixture: ComponentFixture<AnotacoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnotacoesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnotacoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
