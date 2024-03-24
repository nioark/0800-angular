import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropactionsComponent } from './dropactions.component';

describe('DropactionsComponent', () => {
  let component: DropactionsComponent;
  let fixture: ComponentFixture<DropactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropactionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DropactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
