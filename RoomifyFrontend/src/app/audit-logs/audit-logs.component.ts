import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuditLogService } from '../services/audit-log.service';
import { AuthService } from '../services/auth.service';

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

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.css']
})
export class AuditLogsComponent implements OnInit {
  auditLogs: AuditLog[] = [];
  stats: AuditLogStats | null = null;
  loading = false;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalLogs = 0;
  logsPerPage = 50;

  // Filters
  filters: AuditLogFilter = {};
  
  // Filter form fields
  selectedAction = '';
  selectedEntity = '';
  selectedSeverity = '';
  selectedUserId = '';
  selectedEntityId = '';
  startDate = '';
  endDate = '';
  selectedSuccess = '';

  // Available filter options
  actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
  entities = ['USER', 'ROOM', 'BOOKING', 'TICKET', 'MAINTENANCE', 'MESSAGE'];
  severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  // View modes
  currentView: 'logs' | 'stats' = 'logs';
  
  // Selected log for details modal
  selectedLog: AuditLog | null = null;

  constructor(
    private auditLogService: AuditLogService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user has admin access
    if (!this.hasAdminAccess()) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadAuditLogs();
    this.loadStats();
  }

  hasAdminAccess(): boolean {
    const user = this.authService.getCurrentUser();
    return user && user.role >= 4; // Admin role
  }

  async loadAuditLogs() {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.auditLogService.getAuditLogs(this.filters, {
        page: this.currentPage,
        limit: this.logsPerPage,
        sortBy: 'timestamp',
        sortOrder: 'desc'
      });

      this.auditLogs = result.logs;
      this.currentPage = result.pagination.currentPage;
      this.totalPages = result.pagination.totalPages;
      this.totalLogs = result.pagination.totalLogs;
    } catch (error) {
      this.error = 'Failed to load audit logs: ' + (error as Error).message;
      console.error('Error loading audit logs:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadStats() {
    try {
      this.stats = await this.auditLogService.getAuditStats({
        startDate: this.filters.startDate,
        endDate: this.filters.endDate,
        userId: this.filters.userId
      });
    } catch (error) {
      console.error('Error loading audit stats:', error);
    }
  }

  applyFilters() {
    // Convert form values to filter object
    this.filters = {};
    
    if (this.selectedAction) this.filters.action = this.selectedAction;
    if (this.selectedEntity) this.filters.entity = this.selectedEntity;
    if (this.selectedSeverity) this.filters.severity = this.selectedSeverity;
    if (this.selectedUserId) this.filters.userId = parseInt(this.selectedUserId);
    if (this.selectedEntityId) this.filters.entityId = this.selectedEntityId;
    if (this.startDate) this.filters.startDate = this.startDate;
    if (this.endDate) this.filters.endDate = this.endDate;
    if (this.selectedSuccess !== '') {
      this.filters.success = this.selectedSuccess === 'true';
    }

    this.currentPage = 1; // Reset to first page
    this.loadAuditLogs();
    this.loadStats();
  }

  clearFilters() {
    this.filters = {};
    this.selectedAction = '';
    this.selectedEntity = '';
    this.selectedSeverity = '';
    this.selectedUserId = '';
    this.selectedEntityId = '';
    this.startDate = '';
    this.endDate = '';
    this.selectedSuccess = '';
    
    this.currentPage = 1;
    this.loadAuditLogs();
    this.loadStats();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAuditLogs();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadAuditLogs();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAuditLogs();
    }
  }

  switchView(view: 'logs' | 'stats') {
    this.currentView = view;
  }

  showLogDetails(log: AuditLog) {
    this.selectedLog = log;
  }

  closeLogDetails() {
    this.selectedLog = null;
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'CRITICAL':
        return 'severity-critical';
      case 'HIGH':
        return 'severity-high';
      case 'MEDIUM':
        return 'severity-medium';
      case 'LOW':
        return 'severity-low';
      default:
        return '';
    }
  }

  getActionColor(action: string): string {
    switch (action) {
      case 'CREATE':
        return 'action-create';
      case 'UPDATE':
        return 'action-update';
      case 'DELETE':
        return 'action-delete';
      case 'LOGIN':
        return 'action-login';
      case 'LOGOUT':
        return 'action-logout';
      default:
        return '';
    }
  }

  async exportLogs() {
    this.loading = true;
    try {
      await this.auditLogService.exportAuditLogs(this.filters);
    } catch (error) {
      this.error = 'Failed to export audit logs: ' + (error as Error).message;
      console.error('Error exporting audit logs:', error);
    } finally {
      this.loading = false;
    }
  }

  formatJson(obj: any): string {
    if (!obj) return 'N/A';
    return JSON.stringify(obj, null, 2);
  }

  // Quick filter methods
  filterByCritical() {
    this.selectedSeverity = 'CRITICAL';
    this.applyFilters();
  }

  filterByToday() {
    const today = new Date().toISOString().split('T')[0];
    this.startDate = today;
    this.endDate = today;
    this.applyFilters();
  }

  filterByLastWeek() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    this.startDate = startDate.toISOString().split('T')[0];
    this.endDate = endDate.toISOString().split('T')[0];
    this.applyFilters();
  }

  filterByFailures() {
    this.selectedSuccess = 'false';
    this.applyFilters();
  }
}