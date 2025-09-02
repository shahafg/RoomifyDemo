import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingsService, Booking } from '../services/bookings.service';
import { ScheduleService } from '../services/schedule.service';
import { SchedulePeriod } from '../models/schedule-period';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.css'
})
export class BookingFormComponent implements OnInit {
  @Input() roomId: number | null = null;
  @Input() roomName: string = '';
  @Input() building: string = '';
  @Input() floor: number = 0;
  @Input() selectedDate: string = '';
  @Input() preSelectedTimeSlot: any = null;
  @Output() closeForm = new EventEmitter<void>();
  @Output() bookingCreated = new EventEmitter<Booking>();

  availablePeriods: SchedulePeriod[] = [];
  selectedPeriods: SchedulePeriod[] = [];
  booking: Booking = {
    roomId: 0,
    roomName: '',
    building: '',
    floor: 0,
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: 1,
    additionalNotes: ''
  };

  loading: boolean = false;
  error: string = '';
  isSubmitting: boolean = false;

  constructor(
    private bookingsService: BookingsService,
    private scheduleService: ScheduleService
  ) {}

  ngOnInit() {
    this.loadAvailablePeriods();
    this.initializeBooking();
  }

  private initializeBooking() {
    if (this.roomId && this.roomName && this.selectedDate) {
      this.booking = {
        roomId: this.roomId,
        roomName: this.roomName,
        building: this.building,
        floor: this.floor,
        bookingDate: this.selectedDate,
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: 1,
        additionalNotes: ''
      };
    }

    if (this.preSelectedTimeSlot) {
      // Find the corresponding period for the pre-selected time slot
      const matchingPeriod = this.availablePeriods.find(p => 
        p.getStartTime() === this.preSelectedTimeSlot.time
      );
      if (matchingPeriod) {
        this.togglePeriodSelection(matchingPeriod);
      }
    }
  }

  private loadAvailablePeriods() {
    this.loading = true;
    this.error = '';

    const scheduleId = 'default-schedule-1';
    this.scheduleService.getScheduleById(scheduleId).subscribe({
      next: (scheduleData) => {
        this.availablePeriods = this.scheduleService.convertDataToSchedulePeriods(scheduleData);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load time schedule';
        this.loading = false;
        console.error('Error loading schedule:', error);
      }
    });
  }

  togglePeriodSelection(period: SchedulePeriod) {
    const index = this.selectedPeriods.findIndex(p => p.getId() === period.getId());
    
    if (index > -1) {
      // Remove from selection
      this.selectedPeriods.splice(index, 1);
    } else {
      // Add to selection
      this.selectedPeriods.push(period);
    }

    // Sort selected periods by start time
    this.selectedPeriods.sort((a, b) => {
      const timeA = this.timeToMinutes(a.getStartTime());
      const timeB = this.timeToMinutes(b.getStartTime());
      return timeA - timeB;
    });

    this.updateBookingTimeRange();
  }

  isPeriodSelected(period: SchedulePeriod): boolean {
    return this.selectedPeriods.some(p => p.getId() === period.getId());
  }

  private updateBookingTimeRange() {
    if (this.selectedPeriods.length === 0) {
      this.booking.startTime = '';
      this.booking.endTime = '';
      return;
    }

    // Set start time to the earliest selected period's start time
    this.booking.startTime = this.selectedPeriods[0].getStartTime();
    
    // Set end time to the latest selected period's end time
    this.booking.endTime = this.selectedPeriods[this.selectedPeriods.length - 1].getEndTime();
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  getSelectedPeriodsDisplay(): string {
    if (this.selectedPeriods.length === 0) {
      return 'No periods selected';
    }

    if (this.selectedPeriods.length === 1) {
      const period = this.selectedPeriods[0];
      return `${period.getPeriodName()} (${period.getStartTime()} - ${period.getEndTime()})`;
    }

    return `${this.selectedPeriods.length} periods selected (${this.booking.startTime} - ${this.booking.endTime})`;
  }

  checkAvailability() {
    if (!this.booking.roomId || !this.booking.startTime || !this.booking.endTime) {
      this.error = 'Please select at least one period';
      return;
    }

    this.loading = true;
    this.error = '';

    this.bookingsService.checkAvailability(
      this.booking.roomId,
      this.booking.bookingDate,
      this.booking.startTime,
      this.booking.endTime
    ).subscribe({
      next: (availability) => {
        if (!availability.available) {
          this.error = availability.reason || 'Selected time slots are not available';
        } else {
          this.error = '';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to check availability';
        this.loading = false;
        console.error('Error checking availability:', error);
      }
    });
  }

  submitBooking() {
    if (!this.isValidBooking()) {
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    // Add selected periods information to additional notes
    const periodsInfo = this.selectedPeriods.map(p => 
      `${p.getPeriodName()} (${p.getSubject()})`
    ).join(', ');
    
    const bookingToSubmit = {
      ...this.booking,
      additionalNotes: this.booking.additionalNotes 
        ? `${this.booking.additionalNotes}\n\nSelected Periods: ${periodsInfo}`
        : `Selected Periods: ${periodsInfo}`
    };

    this.bookingsService.createBooking(bookingToSubmit).subscribe({
      next: (response) => {
        this.bookingCreated.emit(bookingToSubmit);
        this.closeForm.emit();
        this.isSubmitting = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to create booking';
        this.isSubmitting = false;
        console.error('Error creating booking:', error);
      }
    });
  }

  private isValidBooking(): boolean {
    if (!this.booking.roomId || !this.booking.bookingDate) {
      this.error = 'Missing room or date information';
      return false;
    }

    if (this.selectedPeriods.length === 0) {
      this.error = 'Please select at least one period';
      return false;
    }

    if (!this.booking.purpose.trim()) {
      this.error = 'Please enter a purpose for the booking';
      return false;
    }

    if (this.booking.attendees < 1) {
      this.error = 'Number of attendees must be at least 1';
      return false;
    }

    return true;
  }

  onClose() {
    this.closeForm.emit();
  }

  clearSelection() {
    this.selectedPeriods = [];
    this.updateBookingTimeRange();
    this.error = '';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}