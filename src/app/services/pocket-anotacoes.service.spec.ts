import { TestBed } from '@angular/core/testing';

import { PocketAnotacoesService } from './pocket-anotacoes.service';

describe('PocketAnotacoesService', () => {
  let service: PocketAnotacoesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PocketAnotacoesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
