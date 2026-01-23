import { TestBed } from '@angular/core/testing';

import { HierarchieService } from './hierarchie.service';

describe('HierarchieService', () => {
  let service: HierarchieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HierarchieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
