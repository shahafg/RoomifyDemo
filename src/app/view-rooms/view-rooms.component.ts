import { Component } from '@angular/core';
import { RoomsService } from '../services/rooms.service';
import { Room } from '../models/room';
import { CommonModule } from '@angular/common';
import { RoomType } from '../models/room-type';

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
  
  constructor(private roomService: RoomsService){
    this.roomService.getAllRooms().subscribe((rooms: Room[]) => {
      this.rooms = rooms;
    });
  }

  getRoomType(room: Room): string {
    return RoomType[room.getType()];
  }
}
