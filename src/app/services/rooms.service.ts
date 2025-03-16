import { Injectable } from '@angular/core';
import { Room } from '../models/room';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  rooms: Room[];

  constructor() {
    this.rooms = [
      new Room(1, "100", "D", 1, 50, 0, true),
      new Room(2, "Meeting Room B", "Building 2", 2, 20, 1, false),
      new Room(3, "Break Room C", "Building 1", 1, 10, 0, true),
    ];
  }

  getAllRooms(): Observable<Room[]> {
    return of(this.rooms);
  }

  removeRoom() {

  }
}
