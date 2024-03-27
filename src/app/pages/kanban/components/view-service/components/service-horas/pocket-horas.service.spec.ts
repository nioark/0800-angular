import { TestBed } from '@angular/core/testing';

import { PocketHorasService } from './pocket-horas.service';

describe('PocketHorasService', () => {
  let service: PocketHorasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PocketHorasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
