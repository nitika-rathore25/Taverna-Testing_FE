import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarfaxComponent } from './carfax.component';

describe('CarfaxComponent', () => {
  let component: CarfaxComponent;
  let fixture: ComponentFixture<CarfaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarfaxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarfaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
