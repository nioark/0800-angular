import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectClientsComponent } from './select-clients.component';

describe('SelectClientsComponent', () => {
  let component: SelectClientsComponent;
  let fixture: ComponentFixture<SelectClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectClientsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
