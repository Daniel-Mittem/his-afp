import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatoPz } from './stato-pz';

describe('StatoPz', () => {
  let component: StatoPz;
  let fixture: ComponentFixture<StatoPz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatoPz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatoPz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
