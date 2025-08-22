import { Injectable } from '@angular/core';
import { Room } from '../models/room';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  private roomsUrl = 'http://localhost:3000/rooms';

  constructor(private http: HttpClient) {}

  // Get all rooms
  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.roomsUrl);
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

  // Legacy methods for compatibility
  addRoom(): void {
    console.log('Use createRoom() method instead');
  }
  
  removeRoom(): void {
    console.log('Use deleteRoom() method instead');
  }
}