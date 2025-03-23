import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SchedulePeriod {
  id: number;
  periodName: string;
  startTime: string;
  endTime: string;
  subject: string;
  originalStartTime?: string;
  originalEndTime?: string;
}

@Component({
  selector: 'app-time-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-schedule.component.html',
  styleUrls: ['./time-schedule.component.css']
})
export class TimeScheduleComponent implements OnInit {
  schedulePeriods: SchedulePeriod[] = [];
  hasTimeConflict: boolean = false;
  currentEditPeriod: SchedulePeriod | null = null;
  showModal: boolean = false;

  constructor() { 
    console.log('TimeScheduleComponent constructor called');
  }

  ngOnInit(): void {
    console.log('TimeScheduleComponent initialized');
    this.initializeSchedule();
  }

  initializeSchedule(): void {
    // Initialize with default schedule periods
    this.schedulePeriods = [
      { id: 1, periodName: '1', startTime: '07:35', endTime: '08:30', subject: '7th Grade ELA' },
      { id: 2, periodName: '2', startTime: '08:35', endTime: '09:30', subject: '7th Grade ELA' },
      { id: 3, periodName: '3', startTime: '09:35', endTime: '10:30', subject: '8th Grade ELA' },
      { id: 4, periodName: '4', startTime: '10:35', endTime: '11:30', subject: '2nd/3rd Grade Art' },
      { id: 5, periodName: 'LUNCH', startTime: '11:35', endTime: '12:05', subject: 'LUNCH' },
      { id: 6, periodName: '5', startTime: '12:10', endTime: '13:05', subject: '8th Grade ELA' },
      { id: 7, periodName: '6', startTime: '13:10', endTime: '14:05', subject: 'PLAN TIME' },
      { id: 8, periodName: '7', startTime: '14:10', endTime: '15:05', subject: '6th Grade Books & Movies Elective' }
    ];
    console.log('Schedule initialized with', this.schedulePeriods.length, 'periods');
  }

  onTimeFocus(period: SchedulePeriod): void {
    // Save original values for validation
    period.originalStartTime = period.startTime;
    period.originalEndTime = period.endTime;
  }

  validateTimeRange(period: SchedulePeriod): void {
    // Check if this time range overlaps with any other period
    const start = this.timeToMinutes(period.startTime);
    const end = this.timeToMinutes(period.endTime);

    // Basic validation
    if (start >= end) {
      // Revert to original values if invalid
      period.startTime = period.originalStartTime || period.startTime;
      period.endTime = period.originalEndTime || period.endTime;
      alert('End time must be after start time.');
      return;
    }

    // Check for conflicts with other periods
    this.checkForTimeConflicts();
  }

  checkForTimeConflicts(): void {
    this.hasTimeConflict = false;
    
    for (let i = 0; i < this.schedulePeriods.length; i++) {
      const period1 = this.schedulePeriods[i];
      const start1 = this.timeToMinutes(period1.startTime);
      const end1 = this.timeToMinutes(period1.endTime);
      
      for (let j = i + 1; j < this.schedulePeriods.length; j++) {
        const period2 = this.schedulePeriods[j];
        const start2 = this.timeToMinutes(period2.startTime);
        const end2 = this.timeToMinutes(period2.endTime);
        
        // Check for overlap
        if ((start1 < end2 && end1 > start2) || (start2 < end1 && end2 > start1)) {
          this.hasTimeConflict = true;
          return;
        }
      }
    }
  }

  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  addPeriod(): void {
    // Find the last end time to set as the new start time
    let lastEndTime = '15:05';
    if (this.schedulePeriods.length > 0) {
      lastEndTime = this.schedulePeriods[this.schedulePeriods.length - 1].endTime;
    }
    
    // Calculate a new end time 45 minutes later
    const lastEndMinutes = this.timeToMinutes(lastEndTime);
    const newEndMinutes = lastEndMinutes + 45;
    const newEndHours = Math.floor(newEndMinutes / 60);
    const newEndMins = newEndMinutes % 60;
    const newEndTime = `${newEndHours.toString().padStart(2, '0')}:${newEndMins.toString().padStart(2, '0')}`;
    
    const newId = this.schedulePeriods.length > 0 
      ? Math.max(...this.schedulePeriods.map(p => p.id)) + 1 
      : 1;
      
    const newPeriod: SchedulePeriod = {
      id: newId,
      periodName: `${newId}`,
      startTime: lastEndTime,
      endTime: newEndTime,
      subject: 'New Subject'
    };
    
    this.schedulePeriods.push(newPeriod);
    this.checkForTimeConflicts();
  }

  editPeriod(period: SchedulePeriod): void {
    this.currentEditPeriod = { ...period };
    this.showModal = true;
  }

  savePeriodEdit(): void {
    if (!this.currentEditPeriod) return;
    
    // Find and update the period in the array
    const index = this.schedulePeriods.findIndex(p => p.id === this.currentEditPeriod!.id);
    if (index !== -1) {
      this.schedulePeriods[index] = { ...this.currentEditPeriod };
      this.checkForTimeConflicts();
    }
    
    this.closeModal();
  }

  closeModal(): void {
    this.showModal = false;
    this.currentEditPeriod = null;
  }

  saveSchedule(): void {
    if (this.hasTimeConflict) {
      if (!confirm('There are time conflicts in your schedule. Do you still want to save?')) {
        return;
      }
    }
    
    // Here you would typically save to a backend service
    console.log('Saving schedule:', this.schedulePeriods);
    alert('Schedule saved successfully!');
  }

  resetSchedule(): void {
    if (confirm('Are you sure you want to reset the schedule? All changes will be lost.')) {
      this.initializeSchedule();
      this.hasTimeConflict = false;
    }
  }
}