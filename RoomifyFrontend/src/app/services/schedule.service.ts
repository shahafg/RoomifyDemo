import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SchedulePeriod } from '../models/schedule-period';

export interface SchedulePeriodData {
  id: string;
  name: string;
  active: string;
  period: {
    periodName: string;
    startTime: string;
    endTime: string;
    subject: string;
    originalStartTime?: string;
    originalEndTime?: string;
  }[];
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private apiUrl = 'http://localhost:3000/schedule';

  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  getAllSchedules(): Observable<SchedulePeriodData[]> {
    return this.http.get<SchedulePeriodData[]>(this.apiUrl, this.getHttpOptions());
  }

  getScheduleById(id: string): Observable<SchedulePeriodData> {
    return this.http.get<SchedulePeriodData>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  createSchedule(scheduleData: SchedulePeriodData): Observable<any> {
    return this.http.post<any>(this.apiUrl, scheduleData, this.getHttpOptions());
  }

  updateSchedule(id: string, scheduleData: SchedulePeriodData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, scheduleData, this.getHttpOptions());
  }

  saveScheduleBulk(scheduleData: SchedulePeriodData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bulk`, scheduleData, this.getHttpOptions());
  }

  deleteSchedule(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  convertSchedulePeriodsToData(periods: SchedulePeriod[], scheduleId: string, scheduleName: string): SchedulePeriodData {
    return {
      id: scheduleId,
      name: scheduleName,
      active: 'true',
      period: periods.map(period => ({
        periodName: period.getPeriodName(),
        startTime: period.getStartTime(),
        endTime: period.getEndTime(),
        subject: period.getSubject(),
        originalStartTime: period.getOriginalStartTime(),
        originalEndTime: period.getOriginalEndTime()
      })),
      updatedAt: new Date()
    };
  }

  convertDataToSchedulePeriods(data: SchedulePeriodData): SchedulePeriod[] {
    return data.period.map((period, index) => 
      new SchedulePeriod(
        index,
        period.periodName,
        period.startTime,
        period.endTime,
        period.subject,
        period.originalStartTime,
        period.originalEndTime
      )
    );
  }
}