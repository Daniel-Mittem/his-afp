import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabellaStaff } from './tabella-staff';

describe('TabellaStaff', () => {
  let component: TabellaStaff;
  let fixture: ComponentFixture<TabellaStaff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabellaStaff]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabellaStaff);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
