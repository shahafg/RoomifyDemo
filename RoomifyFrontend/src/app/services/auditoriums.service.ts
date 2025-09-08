import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Auditorium } from '../models/auditorium';

@Injectable({
  providedIn: 'root'
})
export class AuditoriumsService {
  private auditoriumsUrl = 'http://localhost:3000/auditoriums';

  constructor(private http: HttpClient) { }

  // Get all auditoriums
  getAllAuditoriums(): Observable<Auditorium[]> {
    return this.http.get<any[]>(this.auditoriumsUrl).pipe(
      map(auditoriums =>
        auditoriums.map(a => new Auditorium(
          a.id,
          a.name,
          a.buildingId,
          a.capacity,
          a.features || [],
          a.isActive,
          a.createdAt ? new Date(a.createdAt) : undefined,
          a.updatedAt ? new Date(a.updatedAt) : undefined
        ))
      )
    );
  }

  // Get auditorium by ID
  getAuditoriumById(id: number): Observable<Auditorium> {
    return this.http.get<any>(`${this.auditoriumsUrl}/${id}`).pipe(
      map(a => new Auditorium(
        a.id,
        a.name,
        a.buildingId,
        a.capacity,
        a.features || [],
        a.isActive,
        a.createdAt ? new Date(a.createdAt) : undefined,
        a.updatedAt ? new Date(a.updatedAt) : undefined
      ))
    );
  }

  // Get auditoriums by building
  getAuditoriumsByBuilding(buildingId: number): Observable<Auditorium[]> {
    return this.http.get<any[]>(`${this.auditoriumsUrl}/building/${buildingId}`).pipe(
      map(auditoriums =>
        auditoriums.map(a => new Auditorium(
          a.id,
          a.name,
          a.buildingId,
          a.capacity,
          a.features || [],
          a.isActive,
          a.createdAt ? new Date(a.createdAt) : undefined,
          a.updatedAt ? new Date(a.updatedAt) : undefined
        ))
      )
    );
  }

  // Create new auditorium (admin only)
  createAuditorium(auditorium: any): Observable<Auditorium> {
    return this.http.post<any>(this.auditoriumsUrl, auditorium).pipe(
      map(a => new Auditorium(
        a.id,
        a.name,
        a.buildingId,
        a.capacity,
        a.features || [],
        a.isActive,
        a.createdAt ? new Date(a.createdAt) : undefined,
        a.updatedAt ? new Date(a.updatedAt) : undefined
      ))
    );
  }

  // Update auditorium (admin only)
  updateAuditorium(id: number, auditorium: any): Observable<Auditorium> {
    return this.http.put<any>(`${this.auditoriumsUrl}/${id}`, auditorium).pipe(
      map(a => new Auditorium(
        a.id,
        a.name,
        a.buildingId,
        a.capacity,
        a.features || [],
        a.isActive,
        a.createdAt ? new Date(a.createdAt) : undefined,
        a.updatedAt ? new Date(a.updatedAt) : undefined
      ))
    );
  }

  // Soft delete auditorium (admin only)
  deleteAuditorium(id: number): Observable<any> {
    return this.http.delete<any>(`${this.auditoriumsUrl}/${id}`);
  }
}