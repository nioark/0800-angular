import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTecnicoComponent } from './add-tecnico.component';

describe('AddTecnicoComponent', () => {
  let component: AddTecnicoComponent;
  let fixture: ComponentFixture<AddTecnicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTecnicoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddTecnicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
