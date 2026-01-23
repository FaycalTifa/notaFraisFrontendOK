import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceEntiteComponent } from './service-entite.component';

describe('ServiceEntiteComponent', () => {
  let component: ServiceEntiteComponent;
  let fixture: ComponentFixture<ServiceEntiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceEntiteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceEntiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
