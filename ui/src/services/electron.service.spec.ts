import { TestBed } from '@angular/core/testing';

import { ElectronUIService } from './electron.service';

describe('ElectronService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ElectronUIService = TestBed.get(ElectronUIService);
    expect(service).toBeTruthy();
  });
});
