import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnneeExerciceComponent } from './annee-exercice.component';

describe('AnneeExerciceComponent', () => {
  let component: AnneeExerciceComponent;
  let fixture: ComponentFixture<AnneeExerciceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnneeExerciceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnneeExerciceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
