import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomsService } from '../services/rooms.service';
import { RoomSchedule, TimeSlot } from '../models/room-schedule';
import { BookingFormComponent } from '../booking-form/booking-form.component';
import { Booking } from '../services/bookings.service';
import { ScheduleService } from '../services/schedule.service';
import { SchedulePeriod } from '../models/schedule-period';
import { Role } from '../models/role';

@Component({
  selector: 'app-room-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, BookingFormComponent],
  templateUrl: './room-schedule.component.html',
  styleUrl: './room-schedule.component.css'
})
export class RoomScheduleComponent implements OnInit {
  @Input() roomId: number | null = null;

  roomSchedule: RoomSchedule | null = null;
  selectedDate: string = '';
  loading: boolean = false;
  error: string = '';
  viewMode: 'day' | 'calendar' = 'day';
  Object = Object; // Make Object available in template
  showBookingForm: boolean = false;
  selectedTimeSlot: TimeSlot | null = null;
  schedulePeriods: SchedulePeriod[] = [];
  periodTimeSlots: any[] = [];
  isStudent: boolean = false;
  userRole: Role = 10;

  constructor(
    private roomsService: RoomsService,
    private scheduleService: ScheduleService
  ) { }

  ngOnInit() {
    // Set default date to today
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];

    // Load schedule periods first
    this.loadSchedulePeriods();

    // Load schedule if roomId is provided
    if (this.roomId) {
      this.loadSchedule();
    }

    let userData = sessionStorage.getItem('loggedInUser');
    if (userData) {
      let user = JSON.parse(userData);
      this.userRole = user.role;
      if (this.userRole == 0) {
        this.isStudent = true;
      }
    }
  }

  loadSchedule() {
    if (!this.roomId || !this.selectedDate) return;

    this.loading = true;
    this.error = '';

    this.roomsService.getRoomSchedule(this.roomId, this.selectedDate).subscribe({
      next: (data: RoomSchedule) => {
        this.roomSchedule = data;
        this.createPeriodTimeSlots();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load room schedule';
        this.loading = false;
        console.error('Error loading room schedule:', error);
      }
    });
  }

  onDateChange() {
    this.loadSchedule();
  }

  loadSchedulePeriods() {
    const scheduleId = 'default-schedule-1';
    this.scheduleService.getScheduleById(scheduleId).subscribe({
      next: (scheduleData) => {
        this.schedulePeriods = this.scheduleService.convertDataToSchedulePeriods(scheduleData);
        if (this.roomSchedule) {
          this.createPeriodTimeSlots();
        }
      },
      error: (error) => {
        console.log('Using default schedule periods');
        this.createDefaultSchedulePeriods();
      }
    });
  }

  createDefaultSchedulePeriods() {
    this.schedulePeriods = [
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

  createPeriodTimeSlots() {
    if (!this.schedulePeriods.length || !this.roomSchedule) {
      return;
    }

    this.periodTimeSlots = this.schedulePeriods.map(period => {
      // Check if this period is booked by looking for overlapping bookings
      const isBooked = this.roomSchedule!.bookings.some(booking => {
        const bookingStart = this.timeToMinutes(booking.startTime);
        const bookingEnd = this.timeToMinutes(booking.endTime);
        const periodStart = this.timeToMinutes(period.getStartTime());
        const periodEnd = this.timeToMinutes(period.getEndTime());

        // Check for overlap
        return (bookingStart < periodEnd && bookingEnd > periodStart);
      });

      const overlappingBooking = isBooked ?
        this.roomSchedule!.bookings.find(booking => {
          const bookingStart = this.timeToMinutes(booking.startTime);
          const bookingEnd = this.timeToMinutes(booking.endTime);
          const periodStart = this.timeToMinutes(period.getStartTime());
          const periodEnd = this.timeToMinutes(period.getEndTime());
          return (bookingStart < periodEnd && bookingEnd > periodStart);
        }) : null;

      return {
        period: period,
        available: !isBooked,
        booking: overlappingBooking,
        time: period.getStartTime(),
        endTime: period.getEndTime()
      };
    });
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  onTimeSlotClick(timeSlot: TimeSlot) {
    if (timeSlot.available) {
      this.selectedTimeSlot = timeSlot;
      this.showBookingForm = true;
    } else {
      // Show booking details
      alert(`Room booked: ${timeSlot.booking?.purpose || 'Unknown'}`);
    }
  }

  onPeriodTimeSlotClick(periodSlot: any) {
    if (this.isStudent) return;
    if (periodSlot.available) {
      this.selectedTimeSlot = {
        time: periodSlot.time,
        endTime: periodSlot.endTime,
        available: periodSlot.available,
        booking: periodSlot.booking
      };
      this.showBookingForm = true;
    } else {
      // Show booking details
      alert(`Room booked during ${periodSlot.period.getPeriodName()} (${periodSlot.period.getSubject()}): ${periodSlot.booking?.purpose || 'Unknown'}`);
    }
  }

  openBookingForm(timeSlot?: TimeSlot) {
    if (this.isStudent) return;
    this.selectedTimeSlot = timeSlot || null;
    this.showBookingForm = true;
  }

  closeBookingForm() {
    this.showBookingForm = false;
    this.selectedTimeSlot = null;
  }

  onBookingCreated(booking: Booking) {
    // Refresh the schedule to show the new booking
    this.loadSchedule();
    this.closeBookingForm();
  }

  getFacilityIcon(facility: string): string {
    const icons: { [key: string]: string } = {
      projector: '📽️',
      whiteboard: '📋',
      airConditioning: '❄️',
      computers: '💻',
      smartBoard: '📺',
      audioSystem: '🔊'
    };
    return icons[facility] || '✨';
  }

  getFacilityDisplay(key: string): string {
    const displays: { [key: string]: string } = {
      projector: 'projector',
      whiteboard: 'whiteboard',
      airConditioning: 'air conditioning',
      computers: 'computers',
      smartBoard: 'smart board',
      audioSystem: 'audio system'
    };
    return displays[key] || key;
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

  isToday(): boolean {
    const today = new Date().toISOString().split('T')[0];
    return this.selectedDate === today;
  }

  switchView(mode: 'day' | 'calendar') {
    this.viewMode = mode;
  }

  getFacilitiesList(facilities: any): { key: string, available: boolean }[] {
    return Object.keys(facilities).map(key => ({
      key: key,
      available: facilities[key]
    }));
  }
}
