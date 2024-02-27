import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewImageComponent } from './view-image.component';

describe('ViewImageComponent', () => {
  let component: ViewImageComponent;
  let fixture: ComponentFixture<ViewImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewImageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
