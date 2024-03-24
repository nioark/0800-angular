import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigCustoComponent } from './config-custo.component';

describe('ConfigCustoComponent', () => {
  let component: ConfigCustoComponent;
  let fixture: ComponentFixture<ConfigCustoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigCustoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigCustoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
