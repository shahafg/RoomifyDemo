import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

export interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  entity: string;
  entityId: string;
  userId: number;
  userEmail: string;
  userRole: number;
  ipAddress: string;
  userAgent: string;
  details: string;
  oldValues: any;
  newValues: any;
  success: boolean;
  errorMessage: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface AuditLogFilter {
  userId?: number;
  action?: string;
  entity?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  success?: boolean;
  entityId?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogResponse {
  logs: AuditLog[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalLogs: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuditLogStats {
  totalLogs: number;
  successfulActions: number;
  failedActions: number;
  criticalActions: number;
  highSeverityActions: number;
  successRate: string;
  topActions: Array<{ action: string, count: number }>;
  topEntities: Array<{ entity: string, count: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private apiUrl = 'http://localhost:3000/audit-logs';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders() {
    const currentUser = this.authService.getCurrentUser();
    return {
      'user-role': currentUser?.role?.toString() || '0'
    };
  }

  async getAuditLogs(filters: AuditLogFilter = {}, options: PaginationOptions = {}): Promise<AuditLogResponse> {
    let params = new HttpParams();

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    // Add pagination options
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    try {
      const response = await firstValueFrom(
        this.http.get<AuditLogResponse>(this.apiUrl, {
          params,
          headers: this.getHeaders()
        })
      );
      return response;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  async getAuditStats(filters: { startDate?: string, endDate?: string, userId?: number } = {}): Promise<AuditLogStats> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    try {
      const response = await firstValueFrom(
        this.http.get<AuditLogStats>(`${this.apiUrl}/stats`, {
          params,
          headers: this.getHeaders()
        })
      );
      return response;
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      throw error;
    }
  }

  async getEntityAuditLogs(entityType: string, entityId: string, options: PaginationOptions = {}): Promise<AuditLogResponse> {
    let params = new HttpParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    try {
      const response = await firstValueFrom(
        this.http.get<AuditLogResponse>(`${this.apiUrl}/entity/${entityType}/${entityId}`, {
          params,
          headers: this.getHeaders()
        })
      );
      return response;
    } catch (error) {
      console.error('Error fetching entity audit logs:', error);
      throw error;
    }
  }

  async getUserAuditLogs(userId: number, options: PaginationOptions = {}): Promise<AuditLogResponse> {
    let params = new HttpParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    try {
      const response = await firstValueFrom(
        this.http.get<AuditLogResponse>(`${this.apiUrl}/user/${userId}`, {
          params,
          headers: this.getHeaders()
        })
      );
      return response;
    } catch (error) {
      console.error('Error fetching user audit logs:', error);
      throw error;
    }
  }

  async getCriticalAuditLogs(severity: 'CRITICAL' | 'HIGH' = 'CRITICAL'): Promise<AuditLogResponse> {
    const params = new HttpParams().set('severity', severity);

    try {
      const response = await firstValueFrom(
        this.http.get<AuditLogResponse>(`${this.apiUrl}/critical`, {
          params,
          headers: this.getHeaders()
        })
      );
      return response;
    } catch (error) {
      console.error('Error fetching critical audit logs:', error);
      throw error;
    }
  }

  async exportAuditLogs(filters: AuditLogFilter = {}): Promise<void> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    try {
      const response = await firstValueFrom(
        this.http.get(`${this.apiUrl}/export`, {
          params,
          headers: this.getHeaders(),
          responseType: 'blob'
        })
      );

      // Create download link
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  }

  async createAuditLog(auditData: {
    action: string;
    entity: string;
    entityId?: string;
    userId?: number;
    userEmail?: string;
    userRole?: number;
    details: string;
    oldValues?: any;
    newValues?: any;
    success?: boolean;
    severity?: string;
  }): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.apiUrl}`, auditData, {
          headers: this.getHeaders()
        })
      );
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw error;
    }
  }
}