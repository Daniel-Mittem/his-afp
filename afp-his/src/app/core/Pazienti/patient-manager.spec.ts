import { TestBed } from '@angular/core/testing';

import { PazienteManager } from './patient-manager';

describe('PazienteManager', () => {
  let service: PazienteManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PazienteManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
