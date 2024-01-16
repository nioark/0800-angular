import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbertoComponent } from './aberto.component';

describe('AbertoComponent', () => {
  let component: AbertoComponent;
  let fixture: ComponentFixture<AbertoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbertoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AbertoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
