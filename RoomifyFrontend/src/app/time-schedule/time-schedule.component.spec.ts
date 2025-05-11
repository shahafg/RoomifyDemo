import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeScheduleComponent } from './time-schedule.component';

describe('TimeScheduleComponent', () => {
  let component: TimeScheduleComponent;
  let fixture: ComponentFixture<TimeScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeScheduleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimeScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
