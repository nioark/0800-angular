import { TestBed } from '@angular/core/testing';

import { PocketSharedService } from './pocket-shared.service';

describe('PocketSharedService', () => {
  let service: PocketSharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PocketSharedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
