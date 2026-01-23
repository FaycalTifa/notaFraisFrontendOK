import { TestBed } from '@angular/core/testing';

import { ServiceEntiteService } from './service-entite.service';

describe('ServiceEntiteService', () => {
  let service: ServiceEntiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceEntiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
