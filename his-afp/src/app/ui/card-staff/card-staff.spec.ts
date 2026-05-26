import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardStaff } from './card-staff';

describe('CardStaff', () => {
  let component: CardStaff;
  let fixture: ComponentFixture<CardStaff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardStaff]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardStaff);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
