import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCancelarComponent } from './confirm-cancelar.component';

describe('ConfirmCancelarComponent', () => {
  let component: ConfirmCancelarComponent;
  let fixture: ComponentFixture<ConfirmCancelarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmCancelarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmCancelarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
