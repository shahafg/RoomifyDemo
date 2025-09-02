import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomsService } from '../services/rooms.service';
import { RoomSchedule, TimeSlot } from '../models/room-schedule';

@Component({
  selector: 'app-room-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(private roomsService: RoomsService) {}

  ngOnInit() {
    // Set default date to today
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];
    
    // Load schedule if roomId is provided
    if (this.roomId) {
      this.loadSchedule();
    }
  }

  loadSchedule() {
    if (!this.roomId || !this.selectedDate) return;

    this.loading = true;
    this.error = '';

    this.roomsService.getRoomSchedule(this.roomId, this.selectedDate).subscribe({
      next: (data: RoomSchedule) => {
        this.roomSchedule = data;
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

  onTimeSlotClick(timeSlot: TimeSlot) {
    if (timeSlot.available) {
      // TODO: Navigate to booking form with pre-filled room and time
      alert(`Book room from ${timeSlot.time} to ${timeSlot.endTime}`);
    } else {
      // Show booking details
      alert(`Room booked: ${timeSlot.booking?.purpose || 'Unknown'}`);
    }
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
