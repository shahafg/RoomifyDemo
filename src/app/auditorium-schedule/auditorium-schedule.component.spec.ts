import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditoriumScheduleComponent } from './auditorium-schedule.component';

describe('AuditoriumScheduleComponent', () => {
  let component: AuditoriumScheduleComponent;
  let fixture: ComponentFixture<AuditoriumScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditoriumScheduleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuditoriumScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
