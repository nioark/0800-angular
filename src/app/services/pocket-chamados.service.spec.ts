import { TestBed } from '@angular/core/testing';

import { PocketChamadosService } from './pocket-chamados.service';

describe('PocketChamadosService', () => {
  let service: PocketChamadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PocketChamadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
