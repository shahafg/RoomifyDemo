import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Booking {
  id?: number;
  roomId: number;
  roomName: string;
  building: string;
  floor: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees: number;
  additionalNotes?: string;
  bookedBy?: string;
  bookedAt?: Date;
  status?: 'active' | 'cancelled' | 'completed';
}

export interface AvailabilityCheck {
  available: boolean;
  conflicts?: Booking[];
}

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private bookingsUrl = 'http://localhost:3000/bookings';

  constructor(private http: HttpClient) {}

  // Get all bookings
  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.bookingsUrl);
  }

  // Get booking by ID
  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.bookingsUrl}/${id}`);
  }

  // Get bookings for a specific room
  getBookingsByRoom(roomId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.bookingsUrl}/room/${roomId}`);
  }

  // Get bookings for a specific date
  getBookingsByDate(date: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.bookingsUrl}/date/${date}`);
  }

  // Check if a time slot is available
  checkAvailability(roomId: number, bookingDate: string, startTime: string, endTime: string): Observable<AvailabilityCheck> {
    return this.http.post<AvailabilityCheck>(`${this.bookingsUrl}/check-availability`, {
      roomId,
      bookingDate,
      startTime,
      endTime
    });
  }

  // Create a new booking
  createBooking(booking: Booking): Observable<any> {
    // Add default bookedBy if not provided (in production, this would come from auth service)
    if (!booking.bookedBy) {
      booking.bookedBy = 'Current User'; // Replace with actual user from auth service
    }
    
    return this.http.post<any>(this.bookingsUrl, booking);
  }

  // Update an existing booking
  updateBooking(id: number, booking: Partial<Booking>): Observable<Booking> {
    return this.http.put<Booking>(`${this.bookingsUrl}/${id}`, booking);
  }

  // Cancel a booking
  cancelBooking(id: number): Observable<any> {
    return this.http.delete<any>(`${this.bookingsUrl}/${id}`);
  }
}