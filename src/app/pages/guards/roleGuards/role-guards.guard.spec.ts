import { TestBed } from '@angular/core/testing';

import { RoleGuardsGuard } from './role-guards.guard';

describe('RoleGuardsGuard', () => {
  let guard: RoleGuardsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RoleGuardsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
