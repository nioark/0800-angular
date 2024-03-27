import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHoursComponent } from './view-hours.component';

describe('ViewHoursComponent', () => {
  let component: ViewHoursComponent;
  let fixture: ComponentFixture<ViewHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewHoursComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
