import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborateurEvaluationsComponentComponent } from './collaborateur-evaluations-component.component';

describe('CollaborateurEvaluationsComponentComponent', () => {
  let component: CollaborateurEvaluationsComponentComponent;
  let fixture: ComponentFixture<CollaborateurEvaluationsComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollaborateurEvaluationsComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollaborateurEvaluationsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
