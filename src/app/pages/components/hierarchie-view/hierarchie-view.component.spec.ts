import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchieViewComponent } from './hierarchie-view.component';

describe('HierarchieViewComponent', () => {
  let component: HierarchieViewComponent;
  let fixture: ComponentFixture<HierarchieViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HierarchieViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchieViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
