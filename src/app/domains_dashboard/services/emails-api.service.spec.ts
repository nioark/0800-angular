import { TestBed } from '@angular/core/testing';

import { EmailsApiService } from './emails-api.service';

describe('EmailsApiService', () => {
  let service: EmailsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
