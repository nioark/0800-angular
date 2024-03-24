import { TestBed } from '@angular/core/testing';

import { EmailServicesApiService } from './email-services-api.service';

describe('EmailServicesApiService', () => {
  let service: EmailServicesApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailServicesApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
