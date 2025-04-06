import { Injectable } from '@angular/core';
import { Room } from '../models/room';
import { Observable, of } from 'rxjs';
import { RoomType } from '../models/room-type';
import { Building } from '../models/building';

@Injectable({
  providedIn: 'root'
})

export class RoomsService {
  buildings: Building[];
  rooms: Room[];

  constructor() {
    this.rooms = [
      new Room(1, "100", RoomType.Class, "D", 1, 50, 0, true),
      new Room(2, "200", RoomType.ComputerClass, "D", 2, 40, 1, false),
      new Room(3, "100", RoomType.Lab, "B", 1, 50, 0, true),
    ];
    this.buildings = [
      new Building(1, "B"),
      new Building(2, "D"),
      new Building(3, "M"),
    ];
  }

  getAllRooms(): Observable<Room[]> {
    return of(this.rooms);
  }
  addRoom(): void {
    
  }
  removeRoom(): void {
    
  }

  getAllBuildings(): Observable<Building[]> {
    return of(this.buildings);
  }
}

