import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectBlocoComponent } from './select-bloco.component';

describe('SelectBlocoComponent', () => {
  let component: SelectBlocoComponent;
  let fixture: ComponentFixture<SelectBlocoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectBlocoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectBlocoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
