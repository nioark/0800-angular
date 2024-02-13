import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChamadoComponent } from './add-chamado.component';

describe('AddChamadoComponent', () => {
  let component: AddChamadoComponent;
  let fixture: ComponentFixture<AddChamadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddChamadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddChamadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
