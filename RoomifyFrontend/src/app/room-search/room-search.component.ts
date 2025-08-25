import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Room } from '../models/room';
import { RoomType } from '../models/room-type';
import { RoomsService } from '../services/rooms.service';
import { BookingsService, Booking } from '../services/bookings.service';
// Make sure the file exists at the specified path, or update the path if needed
import { MaintenanceService, MaintenancePeriod } from '../services/maintenance.service';
import { HttpClientModule } from '@angular/common/http';

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
  const today = new Date().toISOString().split('T')[0];
  const selectedDateTime = new Date(`${bookingDate}T${startTime}`);

  if (bookingDate === today && selectedDateTime.getTime() <= now.getTime()) {
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
      next: (rooms: any[]) => {
        console.log('Fetched rooms:', rooms);
        this.allRooms = rooms.map(r => {
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

  convertStringToRoomType(typeString: string): RoomType {
    const typeMap: { [key: string]: RoomType } = {
      'Class': RoomType.Class,
      'ComputerClass': RoomType.ComputerClass,
      'Lab': RoomType.Lab,
      'Auditorium': RoomType.Auditorium
    };
    return typeMap[typeString] ?? RoomType.Class;
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
    this.filteredRooms = this.allRooms.filter(room => {
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

    this.bookingForm.patchValue({
      attendees: Math.min(10, room.getCapacity())
    });
    
    this.bookingForm.get('attendees')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(room.getCapacity())
    ]);
    this.bookingForm.get('attendees')?.updateValueAndValidity();

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
      bookingDate: this.todayDate,
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

    this.bookingForm.markAllAsTouched();

    if (this.bookingForm.invalid) {
      console.log('Form is invalid. Cannot proceed with booking.');
      return;
    }

    const formValue = this.bookingForm.value;

    // Create datetime strings for maintenance check
    const startDateTime = this.maintenanceService.formatDateTime(formValue.bookingDate, formValue.startTime);
    const endDateTime = this.maintenanceService.formatDateTime(formValue.bookingDate, formValue.endTime);

    // First check if booking is allowed (not during maintenance)
    this.maintenanceService.checkBookingAllowed(startDateTime, endDateTime).subscribe({
      next: (maintenanceCheck) => {
        if (!maintenanceCheck.allowed) {
          let message = 'Booking is not allowed during the scheduled maintenance period.\n\n';
          if (maintenanceCheck.maintenancePeriods && maintenanceCheck.maintenancePeriods.length > 0) {
            const maintenance = maintenanceCheck.maintenancePeriods[0];
            message += `Maintenance: ${maintenance.title}\n`;
            message += `Period: ${new Date(maintenance.startDate).toLocaleString()} - ${new Date(maintenance.endDate).toLocaleString()}\n`;
            message += `Description: ${maintenance.description}`;
          }
          alert(message);
          return;
        }

        // If no maintenance conflict, proceed with regular booking flow
        this.proceedWithBooking(formValue);
      },
      error: (error) => {
        console.error('Error checking maintenance periods:', error);
        // If maintenance check fails, proceed with regular booking but warn user
        console.warn('Could not verify maintenance schedule, proceeding with booking...');
        this.proceedWithBooking(formValue);
      }
    });
  }

  private proceedWithBooking(formValue: any): void {
    this.bookingsService.checkAvailability(
      this.selectedRoom!.getId(),
      formValue.bookingDate,
      formValue.startTime,
      formValue.endTime
    ).subscribe({
      next: (availabilityCheck) => {
        if (!availabilityCheck.available) {
          if (availabilityCheck.reason) {
            // This is a maintenance conflict from the backend
            alert(availabilityCheck.reason);
          } else {
            // This is a regular booking conflict
            alert('This time slot is already booked. Please choose a different time.');
            if (availabilityCheck.conflicts && availabilityCheck.conflicts.length > 0) {
              const conflict = availabilityCheck.conflicts[0];
              console.log(`Conflict: ${conflict.startTime} - ${conflict.endTime} for ${conflict.purpose}`);
            }
          }
          return;
        }

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

        this.bookingsService.createBooking(booking).subscribe({
          next: (response) => {
            console.log('Booking saved:', response);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const bookingDate = new Date(formValue.bookingDate);
            bookingDate.setHours(0, 0, 0, 0);

            if (bookingDate.getTime() === today.getTime()) {
              const currentTime = new Date().toTimeString().slice(0, 5);
              if (currentTime >= formValue.startTime && currentTime < formValue.endTime) {
                this.selectedRoom!.setStatus(1);
              }
            }

            alert(`Room ${this.selectedRoom!.getName()} booked successfully!\n\nBooking ID: ${response.booking.id}\nDate: ${formValue.bookingDate}\nTime: ${formValue.startTime} - ${formValue.endTime}\nPurpose: ${formValue.bookingPurpose}\nAttendees: ${formValue.attendees}`);

            this.cancelBooking();
            this.applyFilters();
          },
          error: (error) => {
            console.error('Error saving booking:', error);
            if (error.status === 409) {
              alert('This room has been booked by someone else just now. Please select a different time or room.');
            } else if (error.status === 423) {
              // Maintenance period conflict from backend
              alert('Cannot create booking during maintenance period: ' + (error.error?.message || 'Unknown maintenance conflict'));
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