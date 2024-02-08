import { TestBed } from '@angular/core/testing';

import { PocketCollectionsService } from './pocket-collections.service';

describe('PocketCollectionsService', () => {
  let service: PocketCollectionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PocketCollectionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
