import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RicercaPz } from './ricerca-pz';

describe('RicercaPz', () => {
  let component: RicercaPz;
  let fixture: ComponentFixture<RicercaPz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RicercaPz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RicercaPz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
