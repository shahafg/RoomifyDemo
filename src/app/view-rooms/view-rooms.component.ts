import { Component } from '@angular/core';
import { RoomsService } from '../services/rooms.service';
import { Room } from '../models/room';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-rooms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-rooms.component.html',
  styleUrl: './view-rooms.component.css'
})
export class ViewRoomsComponent {
  rooms: Room[] = [];
  
  constructor(private roomService: RoomsService){
    this.roomService.getAllRooms().subscribe((rooms: Room[]) => {
      this.rooms = rooms;
    });
  }
  
}
