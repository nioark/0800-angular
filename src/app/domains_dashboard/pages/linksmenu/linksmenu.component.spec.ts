import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinksmenuComponent } from './linksmenu.component';

describe('LinksmenuComponent', () => {
  let component: LinksmenuComponent;
  let fixture: ComponentFixture<LinksmenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinksmenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LinksmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
