import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuditoriumBooking, AuditoriumBookingStatus } from '../models/auditorium-booking';
import { AuditoriumTimeSlot } from '../models/auditorium-time-slot';
import { Auditorium } from '../models/auditorium';

export interface AuditoriumAvailability {
  auditorium: Auditorium;
  date: string;
  availability: {
    timeSlot: AuditoriumTimeSlot;
    available: boolean;
    booking?: AuditoriumBooking;
  }[];
  bookings: AuditoriumBooking[];
}

@Injectable({
  providedIn: 'root'
})
export class AuditoriumBookingsService {
  private bookingsUrl = 'http://localhost:3000/auditorium-bookings';
  private timeSlotsUrl = 'http://localhost:3000/auditorium-time-slots';

  constructor(private http: HttpClient) { }

  // Get all auditorium bookings
  getAllBookings(): Observable<AuditoriumBooking[]> {
    return this.http.get<any[]>(this.bookingsUrl).pipe(
      map(bookings => bookings.map(this.mapToAuditoriumBooking))
    );
  }

  // Get bookings by user
  getUserBookings(userId: number): Observable<AuditoriumBooking[]> {
    return this.http.get<any[]>(`${this.bookingsUrl}/user/${userId}`).pipe(
      map(bookings => bookings.map(this.mapToAuditoriumBooking))
    );
  }

  // Get availability for specific auditorium on specific date
  getAvailability(auditoriumId: number, date: string): Observable<AuditoriumAvailability> {
    return this.http.get<any>(`${this.bookingsUrl}/availability/${auditoriumId}/${date}`).pipe(
      map(response => ({
        auditorium: new Auditorium(
          response.auditorium.id,
          response.auditorium.name,
          response.auditorium.buildingId,
          response.auditorium.capacity,
          response.auditorium.features || [],
          response.auditorium.isActive,
          response.auditorium.createdAt ? new Date(response.auditorium.createdAt) : undefined,
          response.auditorium.updatedAt ? new Date(response.auditorium.updatedAt) : undefined
        ),
        date: response.date,
        availability: response.availability.map((avail: any) => ({
          timeSlot: new AuditoriumTimeSlot(
            avail.timeSlot.id,
            avail.timeSlot.startTime,
            avail.timeSlot.endTime,
            avail.timeSlot.displayName,
            avail.timeSlot.isActive,
            avail.timeSlot.order
          ),
          available: avail.available,
          booking: avail.booking ? this.mapToAuditoriumBooking(avail.booking) : undefined
        })),
        bookings: response.bookings.map(this.mapToAuditoriumBooking)
      }))
    );
  }

  // Get all time slots
  getTimeSlots(): Observable<AuditoriumTimeSlot[]> {
    return this.http.get<any[]>(this.timeSlotsUrl).pipe(
      map(slots => slots.map(s => new AuditoriumTimeSlot(
        s.id,
        s.startTime,
        s.endTime,
        s.displayName,
        s.isActive,
        s.order
      )))
    );
  }

  // Create new booking
  createBooking(bookingData: {
    auditoriumId: number;
    userId: number;
    startTime: string;
    endTime: string;
    bookingDate: string;
    purpose: string;
    attendeeCount: number;
  }): Observable<AuditoriumBooking> {
    return this.http.post<any>(this.bookingsUrl, bookingData).pipe(
      map(this.mapToAuditoriumBooking)
    );
  }

  // Update booking
  updateBooking(id: number, bookingData: any): Observable<AuditoriumBooking> {
    return this.http.put<any>(`${this.bookingsUrl}/${id}`, bookingData).pipe(
      map(this.mapToAuditoriumBooking)
    );
  }

  // Cancel booking
  cancelBooking(id: number): Observable<AuditoriumBooking> {
    return this.http.patch<any>(`${this.bookingsUrl}/${id}/cancel`, {}).pipe(
      map(this.mapToAuditoriumBooking)
    );
  }

  // Delete booking
  deleteBooking(id: number): Observable<any> {
    return this.http.delete<any>(`${this.bookingsUrl}/${id}`);
  }

  // Private helper method to map API response to AuditoriumBooking model
  private mapToAuditoriumBooking = (booking: any): AuditoriumBooking => {
    return new AuditoriumBooking(
      booking.id,
      booking.auditoriumId,
      booking.userId,
      booking.startTime,
      booking.endTime,
      new Date(booking.bookingDate),
      booking.purpose,
      booking.attendeeCount,
      booking.status as AuditoriumBookingStatus,
      booking.createdAt ? new Date(booking.createdAt) : undefined,
      booking.updatedAt ? new Date(booking.updatedAt) : undefined
    );
  }

  // Helper method to format date for API calls
  formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Helper method to check if booking can be made for the current time
  canBookForToday(timeSlot: AuditoriumTimeSlot): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime < timeSlot.startTime;
  }
}