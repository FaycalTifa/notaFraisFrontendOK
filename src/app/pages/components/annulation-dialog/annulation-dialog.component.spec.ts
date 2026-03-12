import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnulationDialogComponent } from './annulation-dialog.component';

describe('AnnulationDialogComponent', () => {
  let component: AnnulationDialogComponent;
  let fixture: ComponentFixture<AnnulationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnulationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnulationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
