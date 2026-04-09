import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { patientInfoResolver } from './patient-info-resolver';

describe('patientInfoResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => patientInfoResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
