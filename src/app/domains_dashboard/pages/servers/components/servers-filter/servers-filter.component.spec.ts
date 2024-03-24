import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServersFilterComponent } from './servers-filter.component';

describe('ServersFilterComponent', () => {
  let component: ServersFilterComponent;
  let fixture: ComponentFixture<ServersFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServersFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServersFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
