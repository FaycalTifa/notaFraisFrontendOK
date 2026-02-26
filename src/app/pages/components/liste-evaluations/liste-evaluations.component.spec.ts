import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeEvaluationsComponent } from './liste-evaluations.component';

describe('ListeEvaluationsComponent', () => {
  let component: ListeEvaluationsComponent;
  let fixture: ComponentFixture<ListeEvaluationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListeEvaluationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeEvaluationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
