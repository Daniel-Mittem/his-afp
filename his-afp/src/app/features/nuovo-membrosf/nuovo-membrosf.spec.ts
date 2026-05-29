import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuovoMembrosf } from './nuovo-membrosf';

describe('NuovoMembrosf', () => {
  let component: NuovoMembrosf;
  let fixture: ComponentFixture<NuovoMembrosf>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuovoMembrosf]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuovoMembrosf);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
