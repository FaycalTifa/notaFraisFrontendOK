import { TestBed } from '@angular/core/testing';

import { AnneeExerciceService } from './annee-exercice.service';

describe('AnneeExerciceService', () => {
  let service: AnneeExerciceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnneeExerciceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
