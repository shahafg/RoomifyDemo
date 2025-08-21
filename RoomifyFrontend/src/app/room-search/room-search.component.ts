import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Room } from '../models/room';
import { RoomType } from '../models/room-type';
import { RoomsService } from '../services/rooms.service';
import { BookingsService, Booking } from '../services/bookings.service';
import { HttpClientModule } from '@angular/common/http';

interface RoomTypeOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-room-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './room-search.component.html',
  styleUrls: ['./room-search.component.css']
})
export class RoomSearchComponent implements OnInit {
  allRooms: Room[] = [];
  filteredRooms: Room[] = [];
  selectedRoom: Room | null = null;
  RoomType = RoomType;
  roomTypeOptions: RoomTypeOption[] = [];
  
  filterForm: FormGroup;
  bookingForm: FormGroup;

  constructor(
    private roomService: RoomsService, 
    private bookingsService: BookingsService,
    private fb: FormBuilder
  ) {
    // Initialize filter form
    this.filterForm = this.fb.group({
      roomType: [''],
      minCapacity: [0],
      status: [''],
      accessible: ['']
    });

    // Initialize booking form
    this.bookingForm = this.fb.group({
      bookingDate: [new Date().toISOString().split('T')[0]],
      startTime: ['09:00'],
      endTime: ['10:00'],
      bookingPurpose: [''],
      attendees: [0],
      additionalNotes: ['']
    });

    // Generate room type options
    this.generateRoomTypeOptions();
  }

  ngOnInit(): void {
    // Fetch rooms - convert from JSON to Room Object
    this.roomService.getAllRooms().subscribe({
      next: (rooms: any[]) => {
        console.log('Fetched rooms:', rooms);
        this.allRooms = rooms.map(r => {
          // Convert string type to enum value
          const typeEnum = this.convertStringToRoomType(r.type);
          return new Room(
            r.id,
            r.name,
            typeEnum,
            r.building,
            r.floor,
            r.capacity,
            r.status,
            r.accessible
          );
        });
        this.filteredRooms = [...this.allRooms];
        console.log('Processed rooms:', this.allRooms);
      },
      error: (error) => {
        console.error('Error fetching rooms:', error);
        alert('Failed to load rooms. Please check if the backend server is running.');
      }
    });

    // Apply filters on form change
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  // Convert string type from database to RoomType enum
  convertStringToRoomType(typeString: string): RoomType {
    const typeMap: { [key: string]: RoomType } = {
      'Class': RoomType.Class,
      'ComputerClass': RoomType.ComputerClass,
      'Lab': RoomType.Lab,
      'Auditorium': RoomType.Auditorium
    };
    
    return typeMap[typeString] ?? RoomType.Class; // Default to Class if not found
  }

  // Convert RoomType enum to string for display
  convertRoomTypeToString(typeEnum: RoomType): string {
    const typeMap: { [key: number]: string } = {
      [RoomType.Class]: 'Class',
      [RoomType.ComputerClass]: 'Computer Class',
      [RoomType.Lab]: 'Lab',
      [RoomType.Auditorium]: 'Auditorium'
    };
    
    return typeMap[typeEnum] ?? 'Unknown';
  }

  // Generate room type options from enum
  generateRoomTypeOptions(): void {
    this.roomTypeOptions = [
      { value: 'Class', label: 'Class' },
      { value: 'ComputerClass', label: 'Computer Class' },
      { value: 'Lab', label: 'Lab' },
      { value: 'Auditorium', label: 'Auditorium' }
    ];
  }

  // Filter rooms based on user input
  applyFilters(): void {
    const { roomType, minCapacity, status, accessible } = this.filterForm.value;
    
    this.filteredRooms = this.allRooms.filter(room => {
      // For room type, compare with the string value
      if (roomType !== '') {
        const roomTypeEnum = this.convertStringToRoomType(roomType);
        if (room.getType() !== roomTypeEnum) return false;
      }
      if (minCapacity > 0 && room.getCapacity() < minCapacity) return false;
      if (status !== '' && room.getStatus() !== Number(status)) return false;
      if (accessible !== '' && room.isAccessible() !== (accessible === 'true')) return false;
      return true;
    });
  }

  getRoomType(room: Room): string {
    // Convert enum numeric value to string representation
    return this.convertRoomTypeToString(room.getType());
  }

  resetFilters(): void {
    this.filterForm.reset({
      roomType: '',
      minCapacity: 0,
      status: '',
      accessible: ''
    });
    this.filteredRooms = [...this.allRooms];
  }

  selectRoom(room: Room): void {
    if (room.getStatus() !== 0) {
      alert('This room is already booked. Please select an available room.');
      return;
    }
    this.selectedRoom = room;
    
    // Reset booking form with room's capacity as max attendees
    this.bookingForm.patchValue({
      attendees: Math.min(10, room.getCapacity()) // Default to 10 or room capacity, whichever is smaller
    });
    
    this.showBookingForm();
  }

  showBookingForm(): void {
    setTimeout(() => {
      const bookingForm = document.getElementById('bookingForm');
      bookingForm?.scrollIntoView({ behavior: 'smooth' });
      bookingForm?.classList.add('scrolled-to');
      setTimeout(() => {
        bookingForm?.classList.remove('scrolled-to');
      }, 1500);
    }, 100);
  }

  cancelBooking(): void {
    this.selectedRoom = null;
    this.bookingForm.reset({
      bookingDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      bookingPurpose: '',
      attendees: 0,
      additionalNotes: ''
    });
  }

  bookRoom(): void {
    if (!this.selectedRoom) {
      alert('Please select a room before booking.');
      return;
    }

    // Validate booking form
    const formValue = this.bookingForm.value;
    
    if (!formValue.bookingPurpose || formValue.bookingPurpose.trim() === '') {
      alert('Please enter the purpose of booking.');
      return;
    }

    if (!formValue.attendees || formValue.attendees < 1) {
      alert('Please enter the number of attendees (minimum 1).');
      return;
    }

    if (formValue.attendees > this.selectedRoom.getCapacity()) {
      alert(`Number of attendees cannot exceed room capacity (${this.selectedRoom.getCapacity()}).`);
      return;
    }

    // Validate time
    if (formValue.startTime >= formValue.endTime) {
      alert('End time must be after start time.');
      return;
    }

    // First check availability
    this.bookingsService.checkAvailability(
      this.selectedRoom.getId(),
      formValue.bookingDate,
      formValue.startTime,
      formValue.endTime
    ).subscribe({
      next: (availabilityCheck) => {
        if (!availabilityCheck.available) {
          alert('This time slot is already booked. Please choose a different time.');
          if (availabilityCheck.conflicts && availabilityCheck.conflicts.length > 0) {
            const conflict = availabilityCheck.conflicts[0];
            console.log(`Conflict: ${conflict.startTime} - ${conflict.endTime} for ${conflict.purpose}`);
          }
          return;
        }

        // If available, proceed with booking
        const booking: Booking = {
          roomId: this.selectedRoom!.getId(),
          roomName: this.selectedRoom!.getName(),
          building: this.selectedRoom!.getBuilding(),
          floor: this.selectedRoom!.getFloor(),
          bookingDate: formValue.bookingDate,
          startTime: formValue.startTime,
          endTime: formValue.endTime,
          purpose: formValue.bookingPurpose,
          attendees: formValue.attendees,
          additionalNotes: formValue.additionalNotes || ''
        };

        // Save booking to database
        this.bookingsService.createBooking(booking).subscribe({
          next: (response) => {
            console.log('Booking saved:', response);
            
            // Check if booking is for today and update room status
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const bookingDate = new Date(formValue.bookingDate);
            bookingDate.setHours(0, 0, 0, 0);
            
            if (bookingDate.getTime() === today.getTime()) {
              const currentTime = new Date().toTimeString().slice(0, 5);
              if (currentTime >= formValue.startTime && currentTime < formValue.endTime) {
                // Update room status locally
                this.selectedRoom!.setStatus(1);
              }
            }
            
            alert(`Room ${this.selectedRoom!.getName()} booked successfully!\n\nBooking ID: ${response.booking.id}\nDate: ${formValue.bookingDate}\nTime: ${formValue.startTime} - ${formValue.endTime}\nPurpose: ${formValue.bookingPurpose}\nAttendees: ${formValue.attendees}`);

            // Reset form and selection
            this.cancelBooking();
            
            // Re-apply filters to update the display
            this.applyFilters();
          },
          error: (error) => {
            console.error('Error saving booking:', error);
            if (error.status === 409) {
              alert('This room has been booked by someone else just now. Please select a different time or room.');
            } else {
              alert('Failed to save booking. Please try again.');
            }
          }
        });
      },
      error: (error) => {
        console.error('Error checking availability:', error);
        alert('Failed to check availability. Please try again.');
      }
    });
  }
}