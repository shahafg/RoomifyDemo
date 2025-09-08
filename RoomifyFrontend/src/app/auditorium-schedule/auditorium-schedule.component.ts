import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditoriumsService } from '../services/auditoriums.service';
import { AuditoriumBookingsService, AuditoriumAvailability } from '../services/auditorium-bookings.service';
import { AuthService } from '../services/auth.service';
import { Auditorium } from '../models/auditorium';
import { AuditoriumBooking } from '../models/auditorium-booking';
import { AuditoriumTimeSlot } from '../models/auditorium-time-slot';
import { User } from '../models/user';

@Component({
  selector: 'app-auditorium-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditorium-schedule.component.html',
  styleUrl: './auditorium-schedule.component.css'
})
export class AuditoriumScheduleComponent implements OnInit {
  auditoriums: Auditorium[] = [];
  selectedAuditorium: Auditorium | null = null;
  selectedDate: string = '';
  minDate: string = '';
  availability: AuditoriumAvailability | null = null;
  myBookings: AuditoriumBooking[] = [];
  
  // Booking form data
  showBookingModal: boolean = false;
  selectedTimeSlot: AuditoriumTimeSlot | null = null;
  bookingForm = {
    purpose: '',
    attendeeCount: 1
  };

  // Loading states
  loading = {
    auditoriums: false,
    availability: false,
    booking: false
  };

  // Error handling
  errorMessage: string = '';
  successMessage: string = '';

  currentUser: any = null;

  constructor(
    private auditoriumsService: AuditoriumsService,
    private auditoriumBookingsService: AuditoriumBookingsService,
    private authService: AuthService
  ) {
    // Set default date to today
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Current user from auth service:', this.currentUser);
    
    // Check if user is logged in
    if (!this.currentUser) {
      this.errorMessage = 'You must be logged in to book auditoriums. Please login first.';
      return;
    }
    
    this.loadAuditoriums();
    this.loadMyBookings();
  }

  loadAuditoriums() {
    this.loading.auditoriums = true;
    this.auditoriumsService.getAllAuditoriums().subscribe({
      next: (auditoriums) => {
        this.auditoriums = auditoriums;
        if (auditoriums.length > 0) {
          this.selectedAuditorium = auditoriums[0];
          this.loadAvailability();
        }
        this.loading.auditoriums = false;
      },
      error: (error) => {
        console.error('Error loading auditoriums:', error);
        this.errorMessage = 'Failed to load auditoriums';
        this.loading.auditoriums = false;
      }
    });
  }

  loadMyBookings() {
    if (this.currentUser) {
      this.auditoriumBookingsService.getUserBookings(this.currentUser.id).subscribe({
        next: (bookings) => {
          this.myBookings = bookings.filter(b => b.isUpcoming());
        },
        error: (error) => {
          console.error('Error loading my bookings:', error);
        }
      });
    }
  }

  onAuditoriumChange() {
    this.loadAvailability();
  }

  onDateChange() {
    // Validate that selected date is not in the past
    if (this.selectedDate < this.minDate) {
      this.errorMessage = 'Cannot select a date in the past. Please choose today or a future date.';
      this.selectedDate = this.minDate; // Reset to today
      return;
    }
    
    this.errorMessage = ''; // Clear any existing error
    this.loadAvailability();
  }

  loadAvailability() {
    if (!this.selectedAuditorium || !this.selectedDate) return;

    this.loading.availability = true;
    this.auditoriumBookingsService.getAvailability(this.selectedAuditorium.id, this.selectedDate).subscribe({
      next: (availability) => {
        this.availability = availability;
        this.loading.availability = false;
      },
      error: (error) => {
        console.error('Error loading availability:', error);
        this.errorMessage = 'Failed to load availability';
        this.loading.availability = false;
      }
    });
  }

  openBookingModal(timeSlot: AuditoriumTimeSlot) {
    if (!this.canBookTimeSlot(timeSlot)) return;

    this.selectedTimeSlot = timeSlot;
    this.showBookingModal = true;
    this.bookingForm = {
      purpose: '',
      attendeeCount: 1
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeBookingModal() {
    this.showBookingModal = false;
    this.selectedTimeSlot = null;
    this.bookingForm = {
      purpose: '',
      attendeeCount: 1
    };
  }

  submitBooking() {
    if (!this.selectedAuditorium || !this.selectedTimeSlot || !this.currentUser) {
      console.error('Missing required objects:', {
        selectedAuditorium: this.selectedAuditorium,
        selectedTimeSlot: this.selectedTimeSlot,
        currentUser: this.currentUser
      });
      this.errorMessage = 'Missing required data. Please refresh the page and try again.';
      return;
    }

    if (!this.bookingForm.purpose.trim()) {
      this.errorMessage = 'Purpose is required';
      return;
    }

    if (this.bookingForm.attendeeCount < 1 || this.bookingForm.attendeeCount > this.selectedAuditorium.capacity) {
      this.errorMessage = `Attendee count must be between 1 and ${this.selectedAuditorium.capacity}`;
      return;
    }

    this.loading.booking = true;
    this.errorMessage = '';

    const bookingData = {
      auditoriumId: this.selectedAuditorium.id,
      userId: this.currentUser.id,
      startTime: this.selectedTimeSlot.startTime,
      endTime: this.selectedTimeSlot.endTime,
      bookingDate: this.selectedDate,
      purpose: this.bookingForm.purpose.trim(),
      attendeeCount: this.bookingForm.attendeeCount
    };

    console.log('Sending booking data:', bookingData);

    this.auditoriumBookingsService.createBooking(bookingData).subscribe({
      next: (booking) => {
        this.successMessage = 'Booking created successfully!';
        this.closeBookingModal();
        this.loadAvailability();
        this.loadMyBookings();
        this.loading.booking = false;
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error creating booking:', error);
        this.errorMessage = error.error?.message || 'Failed to create booking';
        this.loading.booking = false;
      }
    });
  }

  cancelBooking(booking: AuditoriumBooking) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    this.auditoriumBookingsService.cancelBooking(booking.id).subscribe({
      next: () => {
        this.successMessage = 'Booking cancelled successfully!';
        this.loadAvailability();
        this.loadMyBookings();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error cancelling booking:', error);
        this.errorMessage = error.error?.message || 'Failed to cancel booking';
      }
    });
  }

  canBookTimeSlot(timeSlot: AuditoriumTimeSlot): boolean {
    if (!this.availability) return false;
    
    const availabilityInfo = this.availability.availability.find(a => a.timeSlot.id === timeSlot.id);
    if (!availabilityInfo || !availabilityInfo.available) return false;

    // Check if it's today and the time has passed
    const selectedDateObj = new Date(this.selectedDate);
    const today = new Date();
    const isToday = selectedDateObj.toDateString() === today.toDateString();
    
    if (isToday) {
      return this.auditoriumBookingsService.canBookForToday(timeSlot);
    }

    return true;
  }

  getTimeSlotClass(availabilityInfo: any): string {
    if (!availabilityInfo.available) {
      return 'booked';
    }
    
    if (this.canBookTimeSlot(availabilityInfo.timeSlot)) {
      return 'available';
    }
    
    return 'past';
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
