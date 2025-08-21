import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManheimComponent } from './manheim.component';

describe('ManheimComponent', () => {
  let component: ManheimComponent;
  let fixture: ComponentFixture<ManheimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManheimComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManheimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
