import { TestBed } from '@angular/core/testing';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  constructor() { }
}

describe('MaintenanceService', () => {
  let service: MaintenanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaintenanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
