import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Building } from '../models/building';

@Injectable({
  providedIn: 'root'
})
export class BuildingsService {
  private buildingsUrl = 'http://localhost:3000/buildings';

  constructor(private http: HttpClient) {}

  // Get all buildings
  getAllBuildings(): Observable<Building[]> {
    return this.http.get<Building[]>(this.buildingsUrl);
  }

  // Get building by ID
  getBuildingById(id: number): Observable<Building> {
    return this.http.get<Building>(`${this.buildingsUrl}/${id}`);
  }

  // Add new building
  createBuilding(building: any): Observable<Building> {
    return this.http.post<Building>(this.buildingsUrl, building);
  }

  // Update building
  updateBuilding(id: number, building: any): Observable<Building> {
    return this.http.put<Building>(`${this.buildingsUrl}/${id}`, building);
  }

  // Delete building
  deleteBuilding(id: number): Observable<any> {
    return this.http.delete<any>(`${this.buildingsUrl}/${id}`);
  }
}