import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorDimessi } from './monitor-dimessi';

describe('MonitorDimessi', () => {
  let component: MonitorDimessi;
  let fixture: ComponentFixture<MonitorDimessi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitorDimessi],
    }).compileComponents();

    fixture = TestBed.createComponent(MonitorDimessi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
