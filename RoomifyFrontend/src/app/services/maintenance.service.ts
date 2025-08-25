import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MaintenancePeriod {
  id?: number;
  title: string;
  description: string;
  startDate: string; // ISO string format
  endDate: string;   // ISO string format
  isActive: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MaintenanceCheck {
  allowed: boolean;
  maintenancePeriods?: MaintenancePeriod[];
}

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private maintenanceUrl = 'http://localhost:3000/maintenance';

  constructor(private http: HttpClient) {}

  // Get all maintenance periods
  getAllMaintenancePeriods(): Observable<MaintenancePeriod[]> {
    return this.http.get<MaintenancePeriod[]>(this.maintenanceUrl);
  }

  // Get currently active maintenance periods
  getActiveMaintenancePeriods(): Observable<MaintenancePeriod[]> {
    return this.http.get<MaintenancePeriod[]>(`${this.maintenanceUrl}/active`);
  }

  // Get maintenance period by ID
  getMaintenancePeriodById(id: number): Observable<MaintenancePeriod> {
    return this.http.get<MaintenancePeriod>(`${this.maintenanceUrl}/${id}`);
  }

  // Check if booking is allowed for a specific date/time range
  checkBookingAllowed(startDateTime: string, endDateTime: string): Observable<MaintenanceCheck> {
    return this.http.post<MaintenanceCheck>(`${this.maintenanceUrl}/check-booking-allowed`, {
      startDateTime,
      endDateTime
    });
  }

  // Create a new maintenance period (Admin only)
  createMaintenancePeriod(maintenance: MaintenancePeriod): Observable<any> {
    return this.http.post<any>(this.maintenanceUrl, maintenance);
  }

  // Update an existing maintenance period (Admin only)
  updateMaintenancePeriod(id: number, maintenance: Partial<MaintenancePeriod>): Observable<MaintenancePeriod> {
    return this.http.put<MaintenancePeriod>(`${this.maintenanceUrl}/${id}`, maintenance);
  }

  // Deactivate a maintenance period (Admin only)
  deactivateMaintenancePeriod(id: number): Observable<MaintenancePeriod> {
    return this.http.patch<MaintenancePeriod>(`${this.maintenanceUrl}/${id}/deactivate`, {});
  }

  // Delete a maintenance period (Admin only)
  deleteMaintenancePeriod(id: number): Observable<any> {
    return this.http.delete<any>(`${this.maintenanceUrl}/${id}`);
  }

  // Helper method to format datetime for API calls
  formatDateTime(date: string, time: string): string {
    return `${date}T${time}:00`;
  }
}