import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmFinalizarComponent } from './confirm-finalizar.component';

describe('ConfirmFinalizarComponent', () => {
  let component: ConfirmFinalizarComponent;
  let fixture: ComponentFixture<ConfirmFinalizarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmFinalizarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmFinalizarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
