import { Injectable } from '@angular/core';
import { Room } from '../models/room';
import { Observable, of } from 'rxjs';
import { RoomType } from '../models/room-type';

@Injectable({
  providedIn: 'root'
})

export class RoomsService {
  rooms: Room[];

  constructor() {
    this.rooms = [
      new Room(1, "100", RoomType.Class, "D", 1, 50, 0, true),
      new Room(2, "200", RoomType.ComputerClass, "D", 2, 40, 1, false),
      new Room(3, "100", RoomType.Lab, "B", 1, 50, 0, true),
    ];
  }

  getAllRooms(): Observable<Room[]> {
    return of(this.rooms);
  }

  removeRoom() {
    
  }
}
