import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataComparisonComponent } from './data-comparison.component';

describe('DataComparisonComponent', () => {
  let component: DataComparisonComponent;
  let fixture: ComponentFixture<DataComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataComparisonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
