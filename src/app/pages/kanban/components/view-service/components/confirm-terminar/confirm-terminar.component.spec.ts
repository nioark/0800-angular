import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmTerminarComponent } from './confirm-terminar.component';

describe('ConfirmTerminarComponent', () => {
  let component: ConfirmTerminarComponent;
  let fixture: ComponentFixture<ConfirmTerminarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmTerminarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmTerminarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
