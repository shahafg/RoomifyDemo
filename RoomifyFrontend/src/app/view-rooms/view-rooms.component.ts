import { Component } from '@angular/core';
import { RoomsService } from '../services/rooms.service';
import { Room } from '../models/room';
import { CommonModule } from '@angular/common';
import { RoomType } from '../models/room-type';
import { Role } from '../models/role';

@Component({
  selector: 'app-view-rooms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-rooms.component.html',
  styleUrl: './view-rooms.component.css'
})

export class ViewRoomsComponent {
  rooms: Room[] = [];
  RoomType = RoomType;
  type: string = ""
  userRole: Role = 10;
  isAdmin: boolean = false;

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
}
