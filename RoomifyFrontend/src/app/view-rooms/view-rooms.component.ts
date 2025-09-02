import { Component } from '@angular/core';
import { RoomsService } from '../services/rooms.service';
import { Room } from '../models/room';
import { CommonModule } from '@angular/common';
import { RoomType } from '../models/room-type';
import { Role } from '../models/role';
import { RoomScheduleComponent } from '../room-schedule/room-schedule.component';

@Component({
  selector: 'app-view-rooms',
  standalone: true,
  imports: [CommonModule, RoomScheduleComponent],
  templateUrl: './view-rooms.component.html',
  styleUrl: './view-rooms.component.css'
})

export class ViewRoomsComponent {
  rooms: Room[] = [];
  RoomType = RoomType;
  type: string = ""
  userRole: Role = 10;
  isAdmin: boolean = false;
  selectedRoomId: number | null = null;

  constructor(private roomService: RoomsService) {
    let userData = sessionStorage.getItem('loggedInUser');
    if (userData) {
      let user = JSON.parse(userData);
      this.userRole = user.role;
      if (this.userRole == 4) {
        this.isAdmin = true;
      }
    }

    this.roomService.getAllRooms().subscribe((rooms: Room[]) => {
      this.rooms = rooms;
    });
  }

  getRoomType(room: Room): string {
    return RoomType[room.getType()];
  }

  viewSchedule(roomId: number) {
    this.selectedRoomId = roomId;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  closeSchedule() {
    this.selectedRoomId = null;
    document.body.style.overflow = 'auto'; // Restore scrolling
  }
}
