import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
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
    // Validate booking date before initializing
    if (!this.validateBookingDate()) {
      this.closeForm.emit();
      return;
    }

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

  private validateBookingDate(): boolean {
    const today = new Date().toISOString().split('T')[0];
    if (this.selectedDate < today) {
      alert('Cannot create booking for past dates. Please select a current or future date.');
      return false;
    }
    return true;
  }

  private loadAvailablePeriods() {
    this.loading = true;
    this.error = '';

    const scheduleId = 'default-schedule-1';
    this.scheduleService.getScheduleById(scheduleId).subscribe({
      next: (scheduleData) => {
        console.log('✅ Booking form loaded schedule from database:', scheduleData.name);
        this.availablePeriods = this.scheduleService.convertDataToSchedulePeriods(scheduleData);
        this.loading = false;
      },
      error: (error) => {
        console.log('⚠️ Booking form failed to load from database, using default periods');
        this.createDefaultSchedulePeriods();
        this.loading = false;
        console.error('Error loading schedule:', error);
      }
    });
  }

  private createDefaultSchedulePeriods() {
    this.availablePeriods = [
      new SchedulePeriod(0, '1', '08:00', '08:50', '1st Class'),
      new SchedulePeriod(1, '2', '09:00', '09:50', '2nd Class'),
      new SchedulePeriod(2, '3', '10:00', '10:50', '3rd Class'),
      new SchedulePeriod(3, '4', '11:00', '11:50', '4th Class'),
      new SchedulePeriod(4, 'LUNCH', '11:50', '12:20', 'LUNCH'),
      new SchedulePeriod(5, '5', '12:20', '13:10', '5th Class'),
      new SchedulePeriod(6, '6', '13:20', '14:10', '6th Class'),
      new SchedulePeriod(7, '7', '14:20', '15:10', '7th Class')
    ];
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

    // Don't set continuous range - individual periods will be booked separately
    // These are just for display/validation purposes
    this.booking.startTime = this.selectedPeriods[0].getStartTime();
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

    // Show individual periods, not a continuous range
    const periodNames = this.selectedPeriods.map(p => p.getPeriodName()).join(', ');
    return `${this.selectedPeriods.length} periods selected: ${periodNames}`;
  }

  async checkAvailability() {
    if (!this.booking.roomId || this.selectedPeriods.length === 0) {
      this.error = 'Please select at least one period';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      // Check availability for each selected period individually
      for (const period of this.selectedPeriods) {
        const availability = await firstValueFrom(this.bookingsService.checkAvailability(
          this.booking.roomId,
          this.booking.bookingDate,
          period.getStartTime(),
          period.getEndTime()
        ));

        if (availability && !availability.available) {
          this.error = `Period ${period.getPeriodName()} is not available: ${availability.reason || 'Time slot already booked'}`;
          this.loading = false;
          return;
        }
      }
      
      this.error = '';
      this.loading = false;
    } catch (error) {
      this.error = 'Failed to check availability';
      this.loading = false;
      console.error('Error checking availability:', error);
    }
  }

  async submitBooking() {
    if (!this.isValidBooking()) {
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    try {
      const createdBookings: Booking[] = [];
      
      // Create separate bookings for each selected period
      for (const period of this.selectedPeriods) {
        const bookingForPeriod = {
          ...this.booking,
          startTime: period.getStartTime(),
          endTime: period.getEndTime(),
          additionalNotes: this.booking.additionalNotes 
            ? `${this.booking.additionalNotes}\n\nPeriod: ${period.getPeriodName()} (${period.getSubject()})`
            : `Period: ${period.getPeriodName()} (${period.getSubject()})`
        };

        const response = await this.bookingsService.createBooking(bookingForPeriod).toPromise();
        createdBookings.push(bookingForPeriod);
      }

      // Emit the first booking for compatibility 
      this.bookingCreated.emit(createdBookings[0]);
      this.closeForm.emit();
      this.isSubmitting = false;
    } catch (error: any) {
      this.error = error.error?.message || 'Failed to create booking';
      this.isSubmitting = false;
      console.error('Error creating booking:', error);
    }
  }

  private isValidBooking(): boolean {
    if (!this.booking.roomId || !this.booking.bookingDate) {
      this.error = 'Missing room or date information';
      return false;
    }

    // Final validation - check if booking date is in the past
    if (!this.validateBookingDate()) {
      this.error = 'Cannot create booking for past dates';
      return false;
    }

    if (this.selectedPeriods.length === 0) {
      this.error = 'Please select at least one period';
      return false;
    }

    // Validate that no selected periods are in the past
    for (const period of this.selectedPeriods) {
      if (this.isPeriodInPast(period)) {
        this.error = `Cannot book past time slot: ${period.getPeriodName()}`;
        return false;
      }
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

  private isPeriodInPast(period: SchedulePeriod): boolean {
    const today = new Date().toISOString().split('T')[0];
    if (this.booking.bookingDate !== today) {
      return false; // Future dates are allowed
    }

    const now = new Date();
    const periodStart = new Date(`${this.booking.bookingDate}T${period.getStartTime()}`);
    
    // Add 15-minute buffer
    const minimumBookingTime = new Date(now.getTime() + 15 * 60 * 1000);
    
    return periodStart.getTime() <= minimumBookingTime.getTime();
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