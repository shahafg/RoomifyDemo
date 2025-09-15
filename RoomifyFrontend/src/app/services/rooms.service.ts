import { Injectable } from '@angular/core';
import { Room } from '../models/room';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RoomType } from '../models/room-type';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  private roomsUrl = 'http://localhost:3000/rooms';

  constructor(private http: HttpClient) { }

  // convert string to RoomType enum
  private convertStringToRoomType(typeString: string): RoomType {
    const typeMap: { [key: string]: RoomType } = {
      'Class': RoomType.Class,
      'ComputerClass': RoomType.ComputerClass,
      'Lab': RoomType.Lab,
      'Auditorium': RoomType.Auditorium
    };
    console.log('RoomsService converting:', typeString, 'to:', typeMap[typeString]);
    return typeMap[typeString] ?? RoomType.Class;
  }

  // Get all rooms
  getAllRooms(): Observable<Room[]> {
    return this.http.get<any[]>(this.roomsUrl).pipe(
      map(rooms =>
        rooms.map(r => {
          console.log('RoomsService processing room:', r.name, 'type:', r.type);
          return new Room(
            r.id,
            r.name,
            this.convertStringToRoomType(r.type),
            r.building,
            r.floor,
            r.capacity,
            r.status,
            r.accessible
          );
        })
      )
    );
  }

  // Get room by ID
  getRoomById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.roomsUrl}/${id}`);
  }

  // Get rooms by building
  getRoomsByBuilding(buildingName: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.roomsUrl}/building/${buildingName}`);
  }

  // Get rooms by type
  getRoomsByType(roomType: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.roomsUrl}/type/${roomType}`);
  }

  // Get rooms by status
  getRoomsByStatus(status: number): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.roomsUrl}/status/${status}`);
  }

  // Add new room
  createRoom(room: any): Observable<Room> {
    return this.http.post<Room>(this.roomsUrl, room);
  }

  // Update room
  updateRoom(id: number, room: any): Observable<Room> {
    return this.http.put<Room>(`${this.roomsUrl}/${id}`, room);
  }

  // Update room status
  updateRoomStatus(id: number, status: number): Observable<Room> {
    return this.http.patch<Room>(`${this.roomsUrl}/${id}/status`, { status });
  }

  // Delete room
  deleteRoom(id: number): Observable<any> {
    return this.http.delete<any>(`${this.roomsUrl}/${id}`);
  }

  // Get room schedule for a specific date
  getRoomSchedule(roomId: number, date: string): Observable<any> {
    return this.http.get<any>(`${this.roomsUrl}/${roomId}/schedule/${date}`);
  }
}