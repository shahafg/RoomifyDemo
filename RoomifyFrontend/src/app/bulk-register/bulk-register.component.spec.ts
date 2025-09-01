import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkRegisterComponent } from './bulk-register.component';

describe('BulkRegisterComponent', () => {
  let component: BulkRegisterComponent;
  let fixture: ComponentFixture<BulkRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkRegisterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BulkRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
