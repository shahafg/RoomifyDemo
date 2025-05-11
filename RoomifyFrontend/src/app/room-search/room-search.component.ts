import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Room } from '../models/room';
import { RoomType } from '../models/room-type';
import { RoomsService } from '../services/rooms.service';

interface RoomTypeOption {
  value: RoomType;
  label: string;
}

@Component({
  selector: 'app-room-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './room-search.component.html',
  styleUrls: ['./room-search.component.css']
})
export class RoomSearchComponent {
  allRooms: Room[] = [];
  filteredRooms: Room[] = [];
  selectedRoom: Room | null = null;
  RoomType = RoomType;
  roomTypeOptions: RoomTypeOption[] = [];
  
  filterForm: FormGroup;
  bookingForm: FormGroup;

  constructor(private roomService: RoomsService, private fb: FormBuilder) {
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

    // Fetch rooms
    this.roomService.getAllRooms().subscribe((rooms: Room[]) => {
      this.allRooms = rooms;
      this.filteredRooms = rooms;
    });

    // Apply filters on form change
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  // Generate room type options from enum
  generateRoomTypeOptions(): void {
    // This creates an array of options with both the enum value and display label
    this.roomTypeOptions = Object.keys(RoomType)
      .filter(key => isNaN(Number(key))) // Filter out numeric keys (enum values)
      .map(key => ({
        value: RoomType[key as keyof typeof RoomType],
        label: key
      }));
  }

  // Filter rooms based on user input
  applyFilters(): void {
    const { roomType, minCapacity, status, accessible } = this.filterForm.value;
    
    this.filteredRooms = this.allRooms.filter(room => {
      // For room type, compare numeric values
      if (roomType !== '' && room.getType() !== Number(roomType)) return false;
      if (minCapacity > 0 && room.getCapacity() < minCapacity) return false;
      if (status !== '' && room.getStatus() !== Number(status)) return false;
      if (accessible !== '' && room.isAccessible() !== (accessible === 'true')) return false;
      return true;
    });
  }

  getRoomType(room: Room): string {
    // Convert enum numeric value to string representation
    return RoomType[room.getType()];
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
    this.selectedRoom = room;
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
  }

  bookRoom(): void {
    if (!this.selectedRoom) {
      alert('Please select a room before booking.');
      return;
    }

    const bookingData = {
      roomId: this.selectedRoom.getId(),
      roomNumber: this.selectedRoom.getName(),
      ...this.bookingForm.value
    };

    console.log('Booking submitted:', bookingData);
    alert('Room booked successfully!');

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
}