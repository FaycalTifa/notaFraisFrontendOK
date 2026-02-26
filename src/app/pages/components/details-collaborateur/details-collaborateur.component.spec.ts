import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsCollaborateurComponent } from './details-collaborateur.component';

describe('DetailsCollaborateurComponent', () => {
  let component: DetailsCollaborateurComponent;
  let fixture: ComponentFixture<DetailsCollaborateurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsCollaborateurComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsCollaborateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
