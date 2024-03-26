import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MousesComponent } from './mouses.component';

describe('MousesComponent', () => {
  let component: MousesComponent;
  let fixture: ComponentFixture<MousesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MousesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MousesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
