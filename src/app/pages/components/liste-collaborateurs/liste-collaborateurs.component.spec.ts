import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeCollaborateursComponent } from './liste-collaborateurs.component';

describe('ListeCollaborateursComponent', () => {
  let component: ListeCollaborateursComponent;
  let fixture: ComponentFixture<ListeCollaborateursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListeCollaborateursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeCollaborateursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
