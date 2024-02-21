import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSelectUserComponent } from './view-select-user.component';

describe('ViewSelectUserComponent', () => {
  let component: ViewSelectUserComponent;
  let fixture: ComponentFixture<ViewSelectUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSelectUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewSelectUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
