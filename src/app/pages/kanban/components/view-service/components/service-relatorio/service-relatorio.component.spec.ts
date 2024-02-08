import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceRelatorioComponent } from './service-relatorio.component';

describe('ServiceRelatorioComponent', () => {
  let component: ServiceRelatorioComponent;
  let fixture: ComponentFixture<ServiceRelatorioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceRelatorioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServiceRelatorioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
