import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameNavComponent } from './frame-nav.component';

describe('FrameNavComponent', () => {
  let component: FrameNavComponent;
  let fixture: ComponentFixture<FrameNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrameNavComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FrameNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
