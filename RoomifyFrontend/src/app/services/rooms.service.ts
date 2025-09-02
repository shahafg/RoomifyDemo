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

  // Get all rooms
  getAllRooms(): Observable<Room[]> {
    return this.http.get<any[]>(this.roomsUrl).pipe(
      map(rooms =>
        rooms.map(r => new Room(
          r.id,
          r.name,
          // convert string to enum
          typeof r.type === 'string' ? RoomType[r.type as keyof typeof RoomType] : r.type,
          r.building,
          r.floor,
          r.capacity,
          r.status,
          r.accessible
        ))
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