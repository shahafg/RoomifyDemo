import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Room } from '../models/room';
import { RoomType } from '../models/room-type';
import { RoomsService } from '../services/rooms.service';
import { BookingsService, Booking } from '../services/bookings.service';
import { MaintenanceService, MaintenancePeriod } from '../services/maintenance.service';
import { HttpClientModule } from '@angular/common/http';
import { RoomScheduleComponent } from '../room-schedule/room-schedule.component';

interface RoomTypeOption {
  value: string;
  label: string;
}

// Custom validator to check if end time is after start time
const timeValidator = (control: AbstractControl): ValidationErrors | null => {
  const formGroup = control as FormGroup;
  const startTime = formGroup.get('startTime')?.value;
  const endTime = formGroup.get('endTime')?.value;

  if (startTime && endTime && startTime >= endTime) {
    return { 'timeInvalid': true };
  }
  return null;
};

// Custom validator to check if start time is not in the past relative to the selected date
const futureTimeValidator = (control: AbstractControl): ValidationErrors | null => {
  const formGroup = control.parent as FormGroup;
  if (!formGroup) return null;

  const bookingDate = formGroup.get('bookingDate')?.value;
  const startTime = control.value;

  if (!bookingDate || !startTime) {
    return null;
  }

  const now = new Date();
  const selectedDateTime = new Date(`${bookingDate}T${startTime}`);
  
  // Add 15-minute buffer - users can't book something starting in less than 15 minutes
  const minimumBookingTime = new Date(now.getTime() + 15 * 60 * 1000);

  if (selectedDateTime.getTime() <= minimumBookingTime.getTime()) {
    return { 'pastTime': true };
  }

  return null;
};

// Custom validator to check if booking date is not in the past
const pastDateValidator = (control: AbstractControl): ValidationErrors | null => {
  const bookingDate = control.value;
  if (!bookingDate) {
    return null;
  }
  const today = new Date().toISOString().split('T')[0];
  if (bookingDate < today) {
    return { 'pastDate': true };
  }
  return null;
};

@Component({
  selector: 'app-room-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RoomScheduleComponent],
  templateUrl: './room-search.component.html',
  styleUrls: ['./room-search.component.css']
})

export class RoomSearchComponent implements OnInit {
  allRooms: Room[] = [];
  filteredRooms: Room[] = [];
  selectedRoom: Room | null = null;
  selectedRoomId: number | null = null;
  RoomType = RoomType;
  roomTypeOptions: RoomTypeOption[] = [];
  activeMaintenance: MaintenancePeriod[] = [];
  
  todayDate: string; 

  filterForm: FormGroup;
  bookingForm: FormGroup;

  constructor(
    private roomService: RoomsService,
    private bookingsService: BookingsService,
    private maintenanceService: MaintenanceService,
    private fb: FormBuilder
  ) {
    this.todayDate = new Date().toISOString().split('T')[0];

    this.filterForm = this.fb.group({
      roomType: [''],
      minCapacity: [0],
      status: [''],
      accessible: ['']
    });

    // Re-added the pastDateValidator to the bookingDate control
    this.bookingForm = this.fb.group({
      bookingDate: [this.todayDate, [Validators.required, pastDateValidator]],
      startTime: ['09:00', [Validators.required, futureTimeValidator]],
      endTime: ['10:00', Validators.required],
      bookingPurpose: ['', Validators.required],
      attendees: [0, [Validators.required, Validators.min(1)]],
      additionalNotes: ['']
    }, { validators: timeValidator });

    this.bookingForm.get('bookingDate')?.valueChanges.subscribe(() => {
        this.bookingForm.get('startTime')?.updateValueAndValidity();
    });

    this.generateRoomTypeOptions();
  }

  ngOnInit(): void {
    this.loadRooms();
    this.loadActiveMaintenance();
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  loadRooms(): void {
    this.roomService.getAllRooms().subscribe({
      next: (rooms: Room[]) => {
        console.log('Fetched rooms from service:', rooms);
        this.allRooms = rooms;
        this.filteredRooms = [...this.allRooms];
        console.log('Processed rooms:', this.allRooms);
      },
      error: (error) => {
        console.error('Error fetching rooms:', error);
        alert('Failed to load rooms. Please check if the backend server is running.');
      }
    });
  }

  loadActiveMaintenance(): void {
    this.maintenanceService.getActiveMaintenancePeriods().subscribe({
      next: (periods) => {
        this.activeMaintenance = periods;
        if (periods.length > 0) {
          console.log('Active maintenance periods:', periods);
        }
      },
      error: (error) => {
        console.error('Error loading active maintenance periods:', error);
      }
    });
  }


  convertRoomTypeToString(typeEnum: RoomType): string {
    const typeMap: { [key: number]: string } = {
      [RoomType.Class]: 'Class',
      [RoomType.ComputerClass]: 'Computer Class',
      [RoomType.Lab]: 'Lab',
      [RoomType.Auditorium]: 'Auditorium'
    };
    return typeMap[typeEnum] ?? 'Unknown';
  }

  generateRoomTypeOptions(): void {
    this.roomTypeOptions = [
      { value: 'Class', label: 'Class' },
      { value: 'ComputerClass', label: 'Computer Class' },
      { value: 'Lab', label: 'Lab' },
      { value: 'Auditorium', label: 'Auditorium' }
    ];
  }

  applyFilters(): void {
    const { roomType, minCapacity, status, accessible } = this.filterForm.value;
    console.log('Applying filters, roomType filter:', roomType);
    this.filteredRooms = this.allRooms.filter(room => {
      if (roomType !== '') {
        // Convert the filter string to RoomType enum for comparison
        const roomTypeEnum = this.convertFilterStringToRoomType(roomType);
        console.log('Room:', room.getName(), 'has type:', room.getType(), 'filter type:', roomTypeEnum);
        if (room.getType() !== roomTypeEnum) return false;
      }
      if (minCapacity > 0 && room.getCapacity() < minCapacity) return false;
      if (status !== '' && room.getStatus() !== Number(status)) return false;
      if (accessible !== '' && room.isAccessible() !== (accessible === 'true')) return false;
      return true;
    });
    console.log('Filtered rooms count:', this.filteredRooms.length);
  }

  convertFilterStringToRoomType(typeString: string): RoomType {
    const typeMap: { [key: string]: RoomType } = {
      'Class': RoomType.Class,
      'ComputerClass': RoomType.ComputerClass,
      'Lab': RoomType.Lab,
      'Auditorium': RoomType.Auditorium
    };
    return typeMap[typeString] ?? RoomType.Class;
  }

  getRoomType(room: Room): string {
    const roomTypeEnum = room.getType();
    console.log('getRoomType - Room:', room.getName(), 'Type enum:', roomTypeEnum);
    const result = this.convertRoomTypeToString(roomTypeEnum);
    console.log('getRoomType - Converted to string:', result);
    return result;
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
    this.viewSchedule(room.getId());
  }

  viewSchedule(roomId: number) {
    this.selectedRoomId = roomId;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  closeSchedule() {
    this.selectedRoomId = null;
    this.selectedRoom = null;
    document.body.style.overflow = 'auto'; // Restore scrolling
  }


  // Method to check if there's any active maintenance notification to show
  hasActiveMaintenanceWarning(): boolean {
    return this.activeMaintenance.length > 0;
  }

  // Method to get maintenance warning message
  getMaintenanceWarningMessage(): string {
    if (this.activeMaintenance.length === 0) return '';
    
    const maintenance = this.activeMaintenance[0];
    return `System is currently under maintenance: ${maintenance.title}. Bookings may be restricted.`;
  }
}