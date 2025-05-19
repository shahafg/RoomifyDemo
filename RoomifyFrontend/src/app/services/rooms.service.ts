import { Injectable } from '@angular/core';
import { Room } from '../models/room';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class RoomsService {
  rooms: Room[] = [];
  private roomsUrl = 'http://localhost:3000/rooms';

  constructor(private http: HttpClient) {
  //   this.getAllRooms().subscribe(data => {
  //     this.rooms = data;
  //     console.log(this.rooms);
  // });
  }

  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.roomsUrl);
  }

  addRoom(): void {
    
  }
  removeRoom(): void {
    
  }
}

