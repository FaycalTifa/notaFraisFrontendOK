import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCollaborateurComponent } from './form-collaborateur.component';

describe('FormCollaborateurComponent', () => {
  let component: FormCollaborateurComponent;
  let fixture: ComponentFixture<FormCollaborateurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormCollaborateurComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCollaborateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
