import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AguardandoComponent } from './aguardando.component';

describe('AguardandoComponent', () => {
  let component: AguardandoComponent;
  let fixture: ComponentFixture<AguardandoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AguardandoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AguardandoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
